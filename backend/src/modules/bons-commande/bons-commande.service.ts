import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BonCommande, StatutBonCommande } from './entities/bon-commande.entity';
import { LigneBonCommande } from './entities/ligne-bon-commande.entity';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';

@Injectable()
export class BonsCommandeService {
  constructor(
    @InjectRepository(BonCommande)
    private repository: Repository<BonCommande>,
  ) {}

  private async genererNumero(entrepriseId: string): Promise<string> {
    const count = await this.repository.count({ where: { entrepriseId } });
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BC-${date}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(entrepriseId: string, dto: CreateBonCommandeDto): Promise<BonCommande> {
    const totalTtc = dto.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaireHt, 0);
    const numero = await this.genererNumero(entrepriseId);
    const bon = this.repository.create({
      entrepriseId,
      numero,
      fournisseurId: dto.fournisseurId ?? null,
      statut: StatutBonCommande.EN_ATTENTE,
      totalTtc: Math.round(totalTtc * 100) / 100,
      lignes: dto.lignes as LigneBonCommande[],
    });
    return this.repository.save(bon);
  }

  findAll(entrepriseId: string): Promise<BonCommande[]> {
    return this.repository.find({
      where: { entrepriseId },
      relations: ['lignes', 'lignes.produit'],
      order: { createdAt: 'DESC' },
    });
  }

  async marquerRecu(id: string, entrepriseId: string): Promise<BonCommande> {
    const bon = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!bon) throw new NotFoundException('Bon de commande introuvable');
    bon.statut = StatutBonCommande.RECU;
    return this.repository.save(bon);
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const bon = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!bon) throw new NotFoundException('Bon de commande introuvable');
    await this.repository.remove(bon);
  }
}
