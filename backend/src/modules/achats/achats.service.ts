import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Achat, StatutAchat } from './entities/achat.entity';
import { LigneAchat } from './entities/ligne-achat.entity';
import { Stock } from '../produits/entities/stock.entity';
import { MouvementStock, TypeMouvementStock } from '../produits/entities/mouvement-stock.entity';
import { Produit } from '../produits/entities/produit.entity';
import { Fournisseur } from '../clients-fournisseurs/entities/fournisseur.entity';
import { CreateAchatDto } from './dto/create-achat.dto';

@Injectable()
export class AchatsService {
  constructor(
    @InjectRepository(Achat)
    private achatsRepository: Repository<Achat>,
    private dataSource: DataSource,
  ) {}

  private async genererNumero(entrepriseId: string): Promise<string> {
    const count = await this.achatsRepository.count({ where: { entrepriseId } });
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `A-${yyyymmdd}-${String(count + 1).padStart(5, '0')}`;
  }

  findAll(entrepriseId: string): Promise<Achat[]> {
    return this.achatsRepository.find({
      where: { entrepriseId },
      relations: ['lignes', 'lignes.produit', 'fournisseur', 'succursale'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, entrepriseId: string): Promise<Achat> {
    const achat = await this.achatsRepository.findOne({
      where: { id, entrepriseId },
      relations: ['lignes', 'lignes.produit', 'fournisseur', 'succursale'],
    });
    if (!achat) throw new NotFoundException('Achat introuvable');
    return achat;
  }

  /**
   * Cree un achat valide : incremente le stock de chaque produit (contraire
   * exact de la Vente), calcule les totaux, et augmente la dette envers le
   * fournisseur (le futur paiement fournisseur la diminuera).
   */
  async create(entrepriseId: string, userId: string, dto: CreateAchatDto): Promise<Achat> {
    return this.dataSource.transaction(async (manager) => {
      let totalHt = 0;
      let totalTva = 0;
      const lignesAConstruire: Partial<LigneAchat>[] = [];

      for (const ligneDto of dto.lignes) {
        const produit = await manager.findOne(Produit, {
          where: { id: ligneDto.produitId, entrepriseId },
        });
        if (!produit) {
          throw new NotFoundException(`Produit ${ligneDto.produitId} introuvable`);
        }

        const ligneHt = ligneDto.quantite * ligneDto.prixUnitaireHt;
        const ligneTva = ligneHt * (ligneDto.tauxTva / 100);
        totalHt += ligneHt;
        totalTva += ligneTva;

        lignesAConstruire.push({
          produitId: ligneDto.produitId,
          quantite: ligneDto.quantite,
          prixUnitaireHt: ligneDto.prixUnitaireHt,
          tauxTva: ligneDto.tauxTva,
        });

        if (produit.gereStock) {
          const stock = await manager.findOne(Stock, {
            where: { produitId: produit.id, succursaleId: dto.succursaleId },
          });

          const quantiteAvant = stock ? Number(stock.quantite) : 0;
          const quantiteApres = quantiteAvant + ligneDto.quantite;

          if (stock) {
            stock.quantite = quantiteApres;
            await manager.save(Stock, stock);
          } else {
            await manager.save(
              Stock,
              manager.create(Stock, {
                entrepriseId,
                produitId: produit.id,
                succursaleId: dto.succursaleId,
                quantite: quantiteApres,
              }),
            );
          }

          await manager.save(
            MouvementStock,
            manager.create(MouvementStock, {
              entrepriseId,
              produitId: produit.id,
              succursaleId: dto.succursaleId,
              type: TypeMouvementStock.ENTREE,
              quantite: ligneDto.quantite,
              quantiteAvant,
              quantiteApres,
              motif: 'Achat',
              userId,
            }),
          );
        }
      }

      const totalTtc = totalHt + totalTva;
      const numero = await this.genererNumero(entrepriseId);

      const achat = manager.create(Achat, {
        entrepriseId,
        succursaleId: dto.succursaleId,
        fournisseurId: dto.fournisseurId ?? null,
        userId,
        numero,
        statut: StatutAchat.VALIDEE,
        totalHt: Math.round(totalHt * 100) / 100,
        totalTva: Math.round(totalTva * 100) / 100,
        totalTtc: Math.round(totalTtc * 100) / 100,
        lignes: lignesAConstruire as LigneAchat[],
      });

      const achatSauvegarde = await manager.save(Achat, achat);

      if (dto.fournisseurId) {
        const fournisseur = await manager.findOne(Fournisseur, {
          where: { id: dto.fournisseurId, entrepriseId },
        });
        if (fournisseur) {
          fournisseur.solde = Number(fournisseur.solde) + achatSauvegarde.totalTtc;
          await manager.save(Fournisseur, fournisseur);
        }
      }

      return (await manager.findOne(Achat, {
        where: { id: achatSauvegarde.id, entrepriseId },
        relations: ['lignes', 'lignes.produit', 'fournisseur', 'succursale'],
      }))!;
    });
  }

  /**
   * Annule un achat valide : retire le stock qui avait ete ajoute (avec
   * verification qu'il y a bien assez de stock disponible pour le retirer —
   * ce ne serait pas le cas si une partie a deja ete revendue) et annule la
   * dette envers le fournisseur.
   */
  async annuler(id: string, entrepriseId: string, userId: string): Promise<Achat> {
    return this.dataSource.transaction(async (manager) => {
      const achat = await manager.findOne(Achat, {
        where: { id, entrepriseId },
        relations: ['lignes'],
      });
      if (!achat) throw new NotFoundException('Achat introuvable');
      if (achat.statut === StatutAchat.ANNULEE) {
        throw new BadRequestException('Cet achat est deja annule');
      }

      for (const ligne of achat.lignes) {
        const produit = await manager.findOne(Produit, { where: { id: ligne.produitId } });
        if (!produit?.gereStock) continue;

        const stock = await manager.findOne(Stock, {
          where: { produitId: ligne.produitId, succursaleId: achat.succursaleId },
        });
        const quantiteAvant = stock ? Number(stock.quantite) : 0;
        const quantiteApres = quantiteAvant - Number(ligne.quantite);

        if (quantiteApres < 0) {
          throw new BadRequestException(
            `Impossible d'annuler : le stock actuel de "${produit.nom}" (${quantiteAvant}) ` +
              `est inferieur a la quantite de cet achat (${ligne.quantite}) — une partie a probablement deja ete vendue.`,
          );
        }

        if (stock) {
          stock.quantite = quantiteApres;
          await manager.save(Stock, stock);
        }

        await manager.save(
          MouvementStock,
          manager.create(MouvementStock, {
            entrepriseId,
            produitId: ligne.produitId,
            succursaleId: achat.succursaleId,
            type: TypeMouvementStock.SORTIE,
            quantite: Number(ligne.quantite),
            quantiteAvant,
            quantiteApres,
            referenceDoc: achat.numero,
            motif: 'Annulation d\'achat',
            userId,
          }),
        );
      }

      if (achat.fournisseurId) {
        const fournisseur = await manager.findOne(Fournisseur, { where: { id: achat.fournisseurId } });
        if (fournisseur) {
          fournisseur.solde = Number(fournisseur.solde) - Number(achat.totalTtc);
          await manager.save(Fournisseur, fournisseur);
        }
      }

      achat.statut = StatutAchat.ANNULEE;
      await manager.save(Achat, achat);

      return (await manager.findOne(Achat, {
        where: { id, entrepriseId },
        relations: ['lignes', 'lignes.produit', 'fournisseur', 'succursale'],
      }))!;
    });
  }
}
