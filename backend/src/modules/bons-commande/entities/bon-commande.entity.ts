import { Entity, Column, OneToMany } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { LigneBonCommande } from './ligne-bon-commande.entity';

export enum StatutBonCommande {
  EN_ATTENTE = 'en_attente',
  RECU = 'recu',
}

@Entity('bons_commande')
export class BonCommande extends BaseTenantEntity {
  @Column()
  numero: string;

  @Column({ name: 'fournisseur_id', type: 'uuid', nullable: true })
  fournisseurId: string | null;

  @Column({ type: 'enum', enum: StatutBonCommande, default: StatutBonCommande.EN_ATTENTE })
  statut: StatutBonCommande;

  @Column({ name: 'total_ttc', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTtc: number;

  @OneToMany(() => LigneBonCommande, (l) => l.bonCommande, { cascade: true })
  lignes: LigneBonCommande[];
}
