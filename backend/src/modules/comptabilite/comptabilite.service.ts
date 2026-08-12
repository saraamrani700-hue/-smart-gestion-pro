import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CompteComptable } from './entities/compte-comptable.entity';
import { EcritureComptable } from './entities/ecriture-comptable.entity';
import { DeclarationTva } from './entities/declaration-tva.entity';
import { CreateCompteDto } from './dto/create-compte.dto';
import { CalculerTvaDto } from './dto/calculer-tva.dto';
import { Vente, StatutVente } from '../ventes/entities/vente.entity';
import { Achat, StatutAchat } from '../achats/entities/achat.entity';

// Comptes standards utilises pour la generation automatique d'ecritures
// (plan comptable marocain simplifie). Crees automatiquement si absents.
const COMPTES_STANDARDS = [
  { numeroCompte: '3421', libelle: 'Clients', typeCompte: 'actif' },
  { numeroCompte: '4411', libelle: 'Fournisseurs', typeCompte: 'passif' },
  { numeroCompte: '7111', libelle: 'Ventes de marchandises', typeCompte: 'produit' },
  { numeroCompte: '6111', libelle: 'Achats de marchandises', typeCompte: 'charge' },
  { numeroCompte: '4455', libelle: 'Etat - TVA collectee', typeCompte: 'passif' },
  { numeroCompte: '3455', libelle: 'Etat - TVA deductible', typeCompte: 'actif' },
];

@Injectable()
export class ComptabiliteService {
  constructor(
    @InjectRepository(CompteComptable)
    private comptesRepository: Repository<CompteComptable>,
    @InjectRepository(EcritureComptable)
    private ecrituresRepository: Repository<EcritureComptable>,
    @InjectRepository(DeclarationTva)
    private declarationsRepository: Repository<DeclarationTva>,
    @InjectRepository(Vente)
    private ventesRepository: Repository<Vente>,
    @InjectRepository(Achat)
    private achatsRepository: Repository<Achat>,
  ) {}

  // ---------------------------------------------------------------------
  // PLAN COMPTABLE
  // ---------------------------------------------------------------------

  async initialiserPlanComptable(entrepriseId: string): Promise<CompteComptable[]> {
    const comptes: CompteComptable[] = [];
    for (const c of COMPTES_STANDARDS) {
      comptes.push(await this.findOrCreateCompte(entrepriseId, c.numeroCompte, c.libelle, c.typeCompte));
    }
    return comptes;
  }

  private async findOrCreateCompte(
    entrepriseId: string,
    numeroCompte: string,
    libelle: string,
    typeCompte: string,
  ): Promise<CompteComptable> {
    let compte = await this.comptesRepository.findOne({ where: { entrepriseId, numeroCompte } });
    if (!compte) {
      compte = this.comptesRepository.create({ entrepriseId, numeroCompte, libelle, typeCompte });
      compte = await this.comptesRepository.save(compte);
    }
    return compte;
  }

  createCompte(entrepriseId: string, dto: CreateCompteDto): Promise<CompteComptable> {
    const compte = this.comptesRepository.create({ entrepriseId, ...dto });
    return this.comptesRepository.save(compte);
  }

  findAllComptes(entrepriseId: string): Promise<CompteComptable[]> {
    return this.comptesRepository.find({ where: { entrepriseId }, order: { numeroCompte: 'ASC' } });
  }

  // ---------------------------------------------------------------------
  // ECRITURES AUTOMATIQUES
  // ---------------------------------------------------------------------

  /**
   * Genere l'ecriture comptable d'une vente validee :
   *   Debit  3421 Clients        totalTtc
   *   Credit 7111 Ventes         totalHt
   *   Credit 4455 TVA collectee  totalTva
   */
  async genererEcritureVente(venteId: string, entrepriseId: string): Promise<EcritureComptable[]> {
    const vente = await this.ventesRepository.findOne({ where: { id: venteId, entrepriseId } });
    if (!vente) throw new NotFoundException('Vente introuvable');
    if (vente.statut === StatutVente.ANNULEE) {
      throw new NotFoundException('Impossible de comptabiliser une vente annulee');
    }

    const [clients, ventesCompte, tvaCollectee] = await Promise.all([
      this.findOrCreateCompte(entrepriseId, '3421', 'Clients', 'actif'),
      this.findOrCreateCompte(entrepriseId, '7111', 'Ventes de marchandises', 'produit'),
      this.findOrCreateCompte(entrepriseId, '4455', 'Etat - TVA collectee', 'passif'),
    ]);

    const date = new Date().toISOString().slice(0, 10);
    const libelle = `Vente ${vente.numero}`;

    const ecritures = [
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: clients.id,
        documentId: vente.id,
        debit: vente.totalTtc,
        credit: 0,
        dateEcriture: date,
        libelle,
      }),
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: ventesCompte.id,
        documentId: vente.id,
        debit: 0,
        credit: vente.totalHt,
        dateEcriture: date,
        libelle,
      }),
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: tvaCollectee.id,
        documentId: vente.id,
        debit: 0,
        credit: vente.totalTva,
        dateEcriture: date,
        libelle,
      }),
    ];

    return this.ecrituresRepository.save(ecritures);
  }

  /**
   * Genere l'ecriture comptable d'un achat valide :
   *   Debit  6111 Achats          totalHt
   *   Debit  3455 TVA deductible  totalTva
   *   Credit 4411 Fournisseurs    totalTtc
   */
  async genererEcritureAchat(achatId: string, entrepriseId: string): Promise<EcritureComptable[]> {
    const achat = await this.achatsRepository.findOne({ where: { id: achatId, entrepriseId } });
    if (!achat) throw new NotFoundException('Achat introuvable');

    const [achatsCompte, tvaDeductible, fournisseurs] = await Promise.all([
      this.findOrCreateCompte(entrepriseId, '6111', 'Achats de marchandises', 'charge'),
      this.findOrCreateCompte(entrepriseId, '3455', 'Etat - TVA deductible', 'actif'),
      this.findOrCreateCompte(entrepriseId, '4411', 'Fournisseurs', 'passif'),
    ]);

    const date = new Date().toISOString().slice(0, 10);
    const libelle = `Achat ${achat.numero}`;

    const ecritures = [
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: achatsCompte.id,
        documentId: achat.id,
        debit: achat.totalHt,
        credit: 0,
        dateEcriture: date,
        libelle,
      }),
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: tvaDeductible.id,
        documentId: achat.id,
        debit: achat.totalTva,
        credit: 0,
        dateEcriture: date,
        libelle,
      }),
      this.ecrituresRepository.create({
        entrepriseId,
        compteId: fournisseurs.id,
        documentId: achat.id,
        debit: 0,
        credit: achat.totalTtc,
        dateEcriture: date,
        libelle,
      }),
    ];

    return this.ecrituresRepository.save(ecritures);
  }

  findAllEcritures(entrepriseId: string): Promise<EcritureComptable[]> {
    return this.ecrituresRepository.find({
      where: { entrepriseId },
      relations: ['compte'],
      order: { dateEcriture: 'DESC' },
    });
  }

  // ---------------------------------------------------------------------
  // TVA
  // ---------------------------------------------------------------------

  /**
   * Calcule la TVA collectee (sur les ventes non annulees) et deductible
   * (sur les achats) pour une periode donnee, et enregistre une declaration.
   */
  async calculerDeclarationTva(entrepriseId: string, dto: CalculerTvaDto): Promise<DeclarationTva> {
    const debut = new Date(dto.dateDebut);
    debut.setHours(0, 0, 0, 0);

    // Bug corrige : une date de fin sans heure (ex: "2026-07-31") est
    // interpretee comme minuit pile, ce qui exclut TOUTES les transactions
    // de la journee en cours. On force la fin de journee (23:59:59.999).
    const fin = new Date(dto.dateFin);
    fin.setHours(23, 59, 59, 999);

    const ventes = await this.ventesRepository.find({
      where: { entrepriseId, createdAt: Between(debut, fin) },
    });
    const achats = await this.achatsRepository.find({
      where: { entrepriseId, createdAt: Between(debut, fin) },
    });

    const tvaCollectee = ventes
      .filter((v) => v.statut !== StatutVente.ANNULEE)
      .reduce((sum, v) => sum + Number(v.totalTva), 0);

    const tvaDeductible = achats.reduce((sum, a) => sum + Number(a.totalTva), 0);

    const declaration = this.declarationsRepository.create({
      entrepriseId,
      periode: dto.periode,
      tvaCollectee: Math.round(tvaCollectee * 100) / 100,
      tvaDeductible: Math.round(tvaDeductible * 100) / 100,
      tvaAPayer: Math.round((tvaCollectee - tvaDeductible) * 100) / 100,
    });

    return this.declarationsRepository.save(declaration);
  }

  findAllDeclarations(entrepriseId: string): Promise<DeclarationTva[]> {
    return this.declarationsRepository.find({ where: { entrepriseId }, order: { createdAt: 'DESC' } });
  }
}
