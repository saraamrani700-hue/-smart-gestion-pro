import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';
import { Entreprise } from './entreprise.entity';

@Entity('succursales')
export class Succursale extends BaseTenantEntity {
  @ManyToOne(() => Entreprise)
  @JoinColumn({ name: 'entreprise_id' })
  entreprise: Entreprise;

  @Column()
  nom: string;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ name: 'responsable_id', type: 'uuid', nullable: true })
  responsableId: string | null;

  @Column({ default: true })
  actif: boolean;
}
