import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Produit } from './produit.entity';
import { Succursale } from '../../entreprises/entities/succursale.entity';

@Entity('stocks')
@Unique(['succursaleId', 'produitId'])
export class Stock extends BaseTenantEntity {
  @Column({ name: 'succursale_id', type: 'uuid' })
  succursaleId: string;

  @ManyToOne(() => Succursale)
  @JoinColumn({ name: 'succursale_id' })
  succursale: Succursale;

  @Column({ name: 'produit_id', type: 'uuid' })
  produitId: string;

  @ManyToOne(() => Produit)
  @JoinColumn({ name: 'produit_id' })
  produit: Produit;

  @Column({ type: 'numeric', precision: 14, scale: 3, default: 0 })
  quantite: number;
}
