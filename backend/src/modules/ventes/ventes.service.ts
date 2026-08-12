import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Vente, StatutVente } from './entities/vente.entity';
import { LigneVente } from './entities/ligne-vente.entity';
import { Stock } from '../produits/entities/stock.entity';
import { MouvementStock, TypeMouvementStock } from '../produits/entities/mouvement-stock.entity';
import { Produit } from '../produits/entities/produit.entity';
import { Client } from '../clients-fournisseurs/entities/client.entity';
import { CreateVenteDto } from './dto/create-vente.dto';

@Injectable()
export class VentesService {
  constructor(
    @InjectRepository(Vente)
    private ventesRepository: Repository<Vente>,
    private dataSource: DataSource,
  ) {}

  private async genererNumero(entrepriseId: string): Promise<string> {
    const count = await this.ventesRepository.count({ where: { entrepriseId } });
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `V-${yyyymmdd}-${String(count + 1).padStart(5, '0')}`;
  }

  findAll(entrepriseId: string): Promise<Vente[]> {
    return this.ventesRepository.find({
      where: { entrepriseId },
      relations: ['lignes', 'lignes.produit', 'client', 'succursale'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, entrepriseId: string): Promise<Vente> {
    const vente = await this.ventesRepository.findOne({
      where: { id, entrepriseId },
      relations: ['lignes', 'lignes.produit', 'client', 'succursale'],
    });
    if (!vente) throw new NotFoundException('Vente introuvable');
    return vente;
  }

  /**
   * Cree une vente validee : calcule les totaux, decremente le stock de
   * chaque produit (avec mouvement de stock associe), et met a jour le
   * solde du client si vente a credit. Tout est fait dans une seule
   * transaction pour garantir la coherence (aucune vente sans stock decremente).
   */
  async create(entrepriseId: string, userId: string, dto: CreateVenteDto): Promise<Vente> {
    return this.dataSource.transaction(async (manager) => {
      let totalHt = 0;
      let totalTva = 0;
      const lignesAConstruire: Partial<LigneVente>[] = [];

      for (const ligneDto of dto.lignes) {
        const produit = await manager.findOne(Produit, {
          where: { id: ligneDto.produitId, entrepriseId },
        });
        if (!produit) {
          throw new NotFoundException(`Produit ${ligneDto.produitId} introuvable`);
        }

        const montantBrutHt = ligneDto.quantite * ligneDto.prixUnitaireHt;
        const remise = montantBrutHt * ((ligneDto.remisePct ?? 0) / 100);
        const ligneHt = montantBrutHt - remise;
        const ligneTva = ligneHt * (ligneDto.tauxTva / 100);

        totalHt += ligneHt;
        totalTva += ligneTva;

        lignesAConstruire.push({
          produitId: ligneDto.produitId,
          quantite: ligneDto.quantite,
          prixUnitaireHt: ligneDto.prixUnitaireHt,
          tauxTva: ligneDto.tauxTva,
          remisePct: ligneDto.remisePct ?? 0,
        });

        // --- Decrement du stock (uniquement si le produit est gere en stock) ---
        if (produit.gereStock) {
          const stock = await manager.findOne(Stock, {
            where: { produitId: produit.id, succursaleId: dto.succursaleId },
          });

          const quantiteAvant = stock ? Number(stock.quantite) : 0;
          const quantiteApres = quantiteAvant - ligneDto.quantite;

          if (quantiteApres < 0) {
            throw new BadRequestException(
              `Stock insuffisant pour "${produit.nom}" (disponible: ${quantiteAvant}, demande: ${ligneDto.quantite})`,
            );
          }

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
              type: TypeMouvementStock.SORTIE,
              quantite: ligneDto.quantite,
              quantiteAvant,
              quantiteApres,
              motif: 'Vente',
              userId,
            }),
          );
        }
      }

      const totalTtc = totalHt + totalTva;
      const numero = await this.genererNumero(entrepriseId);

      const vente = manager.create(Vente, {
        entrepriseId,
        succursaleId: dto.succursaleId,
        clientId: dto.clientId ?? null,
        userId,
        numero,
        statut: StatutVente.VALIDEE,
        totalHt: Math.round(totalHt * 100) / 100,
        totalTva: Math.round(totalTva * 100) / 100,
        totalTtc: Math.round(totalTtc * 100) / 100,
        lignes: lignesAConstruire as LigneVente[],
      });

      const venteSauvegardee = await manager.save(Vente, vente);

      // --- Vente a credit : le client doit desormais ce montant ---
      // (l'encaissement, gere par le futur module Paiements, diminuera ce solde)
      if (dto.clientId) {
        const client = await manager.findOne(Client, {
          where: { id: dto.clientId, entrepriseId },
        });
        if (client) {
          client.solde = Number(client.solde) + venteSauvegardee.totalTtc;
          await manager.save(Client, client);
        }
      }

      return (await manager.findOne(Vente, {
        where: { id: venteSauvegardee.id, entrepriseId },
        relations: ['lignes', 'lignes.produit', 'client', 'succursale'],
      }))!;
    });
  }

  /**
   * Annule une vente validee : remet le stock et annule la dette client.
   */
  async annuler(id: string, entrepriseId: string, userId: string): Promise<Vente> {
    return this.dataSource.transaction(async (manager) => {
      const vente = await manager.findOne(Vente, {
        where: { id, entrepriseId },
        relations: ['lignes'],
      });
      if (!vente) throw new NotFoundException('Vente introuvable');
      if (vente.statut === StatutVente.ANNULEE) {
        throw new BadRequestException('Cette vente est deja annulee');
      }

      for (const ligne of vente.lignes) {
        const produit = await manager.findOne(Produit, { where: { id: ligne.produitId } });
        if (!produit?.gereStock) continue;

        const stock = await manager.findOne(Stock, {
          where: { produitId: ligne.produitId, succursaleId: vente.succursaleId },
        });
        const quantiteAvant = stock ? Number(stock.quantite) : 0;
        const quantiteApres = quantiteAvant + Number(ligne.quantite);

        if (stock) {
          stock.quantite = quantiteApres;
          await manager.save(Stock, stock);
        }

        await manager.save(
          MouvementStock,
          manager.create(MouvementStock, {
            entrepriseId,
            produitId: ligne.produitId,
            succursaleId: vente.succursaleId,
            type: TypeMouvementStock.ENTREE,
            quantite: Number(ligne.quantite),
            quantiteAvant,
            quantiteApres,
            referenceDoc: vente.numero,
            motif: 'Annulation de vente',
            userId,
          }),
        );
      }

      if (vente.clientId) {
        const client = await manager.findOne(Client, { where: { id: vente.clientId } });
        if (client) {
          client.solde = Number(client.solde) - Number(vente.totalTtc);
          await manager.save(Client, client);
        }
      }

      vente.statut = StatutVente.ANNULEE;
      await manager.save(Vente, vente);

      return (await manager.findOne(Vente, {
        where: { id, entrepriseId },
        relations: ['lignes', 'lignes.produit', 'client', 'succursale'],
      }))!;
    });
  }
}
