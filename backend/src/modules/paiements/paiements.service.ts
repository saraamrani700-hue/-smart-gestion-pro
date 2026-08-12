import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between } from 'typeorm';
import {
  Paiement,
  StatutPaiement,
  TypeDocumentPaiement,
} from './entities/paiement.entity';
import { CompteBancaire } from './entities/compte-bancaire.entity';
import { Cheque, StatutCheque } from './entities/cheque.entity';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { Vente, StatutVente } from '../ventes/entities/vente.entity';
import { Achat, StatutAchat } from '../achats/entities/achat.entity';
import { Client } from '../clients-fournisseurs/entities/client.entity';
import { Fournisseur } from '../clients-fournisseurs/entities/fournisseur.entity';

@Injectable()
export class PaiementsService {
  constructor(
    @InjectRepository(Paiement)
    private paiementsRepository: Repository<Paiement>,
    @InjectRepository(CompteBancaire)
    private comptesRepository: Repository<CompteBancaire>,
    @InjectRepository(Cheque)
    private chequesRepository: Repository<Cheque>,
    private dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------
  // PAIEMENTS (encaissement client / decaissement fournisseur)
  // ---------------------------------------------------------------------

  async create(entrepriseId: string, userId: string, dto: CreatePaiementDto): Promise<Paiement> {
    return this.dataSource.transaction(async (manager) => {
      if (dto.documentType === TypeDocumentPaiement.VENTE) {
        const vente = await manager.findOne(Vente, {
          where: { id: dto.documentId, entrepriseId },
        });
        if (!vente) throw new NotFoundException('Vente introuvable');

        if (vente.clientId) {
          const client = await manager.findOne(Client, { where: { id: vente.clientId } });
          if (client) {
            // Un encaissement diminue ce que le client nous doit
            client.solde = Number(client.solde) - dto.montant;
            await manager.save(Client, client);
          }
        }

        // Marquer la vente comme payee si le total encaisse couvre le total TTC
        const dejaEncaisse = await this.totalPaiementsAcceptes(
          manager,
          TypeDocumentPaiement.VENTE,
          vente.id,
        );
        if (dejaEncaisse + dto.montant >= Number(vente.totalTtc)) {
          vente.statut = StatutVente.PAYEE;
          await manager.save(Vente, vente);
        }
      } else {
        const achat = await manager.findOne(Achat, {
          where: { id: dto.documentId, entrepriseId },
        });
        if (!achat) throw new NotFoundException('Achat introuvable');

        if (achat.fournisseurId) {
          const fournisseur = await manager.findOne(Fournisseur, {
            where: { id: achat.fournisseurId },
          });
          if (fournisseur) {
            // Un decaissement diminue ce que nous devons au fournisseur
            fournisseur.solde = Number(fournisseur.solde) - dto.montant;
            await manager.save(Fournisseur, fournisseur);
          }
        }

        const dejaPaye = await this.totalPaiementsAcceptes(
          manager,
          TypeDocumentPaiement.ACHAT,
          achat.id,
        );
        if (dejaPaye + dto.montant >= Number(achat.totalTtc)) {
          achat.statut = StatutAchat.PAYEE;
          await manager.save(Achat, achat);
        }
      }

      const paiement = manager.create(Paiement, {
        entrepriseId,
        documentType: dto.documentType,
        documentId: dto.documentId,
        moyenPaiement: dto.moyenPaiement,
        montant: dto.montant,
        referenceTransaction: dto.referenceTransaction,
        carte4Derniers: dto.carte4Derniers,
        banque: dto.banque,
        statut: StatutPaiement.ACCEPTE,
        succursaleId: dto.succursaleId ?? null,
        userId,
      });

      return manager.save(Paiement, paiement);
    });
  }

  private async totalPaiementsAcceptes(
    manager: any,
    documentType: TypeDocumentPaiement,
    documentId: string,
  ): Promise<number> {
    const paiements = await manager.find(Paiement, {
      where: { documentType, documentId, statut: StatutPaiement.ACCEPTE },
    });
    return paiements.reduce((sum: number, p: Paiement) => sum + Number(p.montant), 0);
  }

  /**
   * Remboursement : enregistre un paiement de statut REMBOURSEMENT et
   * reajuste le solde du client/fournisseur dans le sens inverse.
   */
  async rembourser(
    entrepriseId: string,
    userId: string,
    dto: CreatePaiementDto,
  ): Promise<Paiement> {
    return this.dataSource.transaction(async (manager) => {
      if (dto.documentType === TypeDocumentPaiement.VENTE) {
        const vente = await manager.findOne(Vente, { where: { id: dto.documentId, entrepriseId } });
        if (!vente) throw new NotFoundException('Vente introuvable');
        if (vente.clientId) {
          const client = await manager.findOne(Client, { where: { id: vente.clientId } });
          if (client) {
            client.solde = Number(client.solde) + dto.montant;
            await manager.save(Client, client);
          }
        }
      }

      const paiement = manager.create(Paiement, {
        entrepriseId,
        documentType: dto.documentType,
        documentId: dto.documentId,
        moyenPaiement: dto.moyenPaiement,
        montant: dto.montant,
        referenceTransaction: dto.referenceTransaction,
        banque: dto.banque,
        statut: StatutPaiement.REMBOURSEMENT,
        succursaleId: dto.succursaleId ?? null,
        userId,
      });

      return manager.save(Paiement, paiement);
    });
  }

  findAll(entrepriseId: string): Promise<Paiement[]> {
    return this.paiementsRepository.find({
      where: { entrepriseId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByDocument(
    entrepriseId: string,
    documentType: TypeDocumentPaiement,
    documentId: string,
  ): Promise<Paiement[]> {
    return this.paiementsRepository.find({
      where: { entrepriseId, documentType, documentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Dashboard des paiements (cf. discussion) : repartition des encaissements
   * par moyen de paiement sur une periode donnee.
   */
  async dashboard(entrepriseId: string, dateDebut: Date, dateFin: Date) {
    const paiements = await this.paiementsRepository.find({
      where: {
        entrepriseId,
        statut: StatutPaiement.ACCEPTE,
        createdAt: Between(dateDebut, dateFin),
      },
    });

    const parMoyen: Record<string, number> = {};
    let total = 0;

    for (const p of paiements) {
      const montant = Number(p.montant);
      parMoyen[p.moyenPaiement] = (parMoyen[p.moyenPaiement] || 0) + montant;
      total += montant;
    }

    return {
      periode: { debut: dateDebut, fin: dateFin },
      total,
      parMoyenPaiement: parMoyen,
      nombreTransactions: paiements.length,
    };
  }

  // ---------------------------------------------------------------------
  // COMPTES BANCAIRES
  // ---------------------------------------------------------------------

  createCompte(entrepriseId: string, data: { banque: string; rib?: string }): Promise<CompteBancaire> {
    const compte = this.comptesRepository.create({ entrepriseId, ...data });
    return this.comptesRepository.save(compte);
  }

  findAllComptes(entrepriseId: string): Promise<CompteBancaire[]> {
    return this.comptesRepository.find({ where: { entrepriseId } });
  }

  // ---------------------------------------------------------------------
  // CHEQUES
  // ---------------------------------------------------------------------

  createCheque(entrepriseId: string, dto: CreateChequeDto): Promise<Cheque> {
    const cheque = this.chequesRepository.create({ entrepriseId, ...dto });
    return this.chequesRepository.save(cheque);
  }

  findAllCheques(entrepriseId: string): Promise<Cheque[]> {
    return this.chequesRepository.find({ where: { entrepriseId }, order: { createdAt: 'DESC' } });
  }

  async encaisserCheque(id: string, entrepriseId: string): Promise<Cheque> {
    const cheque = await this.chequesRepository.findOne({ where: { id, entrepriseId } });
    if (!cheque) throw new NotFoundException('Cheque introuvable');
    if (cheque.statut !== StatutCheque.EN_ATTENTE) {
      throw new BadRequestException('Ce cheque a deja ete traite');
    }
    cheque.statut = StatutCheque.ENCAISSE;
    cheque.dateEncaissement = new Date().toISOString().slice(0, 10);
    return this.chequesRepository.save(cheque);
  }

  async rejeterCheque(id: string, entrepriseId: string): Promise<Cheque> {
    const cheque = await this.chequesRepository.findOne({ where: { id, entrepriseId } });
    if (!cheque) throw new NotFoundException('Cheque introuvable');
    cheque.statut = StatutCheque.REJETE;
    return this.chequesRepository.save(cheque);
  }
}
