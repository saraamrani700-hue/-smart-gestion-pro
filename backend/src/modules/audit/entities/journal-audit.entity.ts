import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('journal_audit')
export class JournalAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entreprise_id', type: 'uuid', nullable: true })
  entrepriseId: string | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column()
  action: string; // ex: 'POST /api/produits', 'DELETE /api/clients/:id'

  @Column({ name: 'table_cible', nullable: true })
  tableCible: string;

  @Column({ type: 'jsonb', nullable: true })
  donnees: Record<string, unknown>;

  @Column({ name: 'ip_adresse', nullable: true })
  ipAdresse: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
