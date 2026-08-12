import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Client } from '../../clients-fournisseurs/entities/client.entity';
import { Succursale } from '../../entreprises/entities/succursale.entity';
import { LigneVente } from './ligne-vente.entity';

export enum StatutVente {
  BROUILLON = 'brouillon',
  VALIDEE = 'validee',
  PAYEE = 'payee',
  ANNULEE = 'annulee',
}

@Entity('ventes')
export class Vente extends BaseTenantEntity {
  @Column({ name: 'succursale_id', type: 'uuid' })
  succursaleId: string;

  @ManyToOne(() => Succursale)
  @JoinColumn({ name: 'succursale_id' })
  succursale: Succursale;

  @Column({ name: 'client_id', type: 'uuid', nullable: true })
  clientId: string | null;

  @ManyToOne(() => Client, { nullable: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column()
  numero: string;

  @Column({ type: 'enum', enum: StatutVente, default: StatutVente.BROUILLON })
  statut: StatutVente;

  @Column({ name: 'total_ht', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalHt: number;

  @Column({ name: 'total_tva', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTva: number;

  @Column({ name: 'total_ttc', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalTtc: number;

  @OneToMany(() => LigneVente, (ligne) => ligne.vente, { cascade: true })
  lignes: LigneVente[];
}
