import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('parametres_entreprise')
export class ParametresEntreprise {
  @PrimaryColumn({ name: 'entreprise_id', type: 'uuid' })
  entrepriseId: string;

  @Column({ type: 'jsonb', default: {} })
  parametres: Record<string, unknown>;
}
