import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('entreprises')
export class Entreprise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  ice: string;

  @Column({ name: 'if_fiscal', nullable: true })
  ifFiscal: string;

  @Column({ nullable: true })
  rc: string;

  @Column({ nullable: true })
  patente: string;

  @Column({ nullable: true })
  cnss: string;

  @Column({ type: 'text', nullable: true })
  adresse: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ default: 'MAD' })
  devise: string;

  @Column({ name: 'plan_abonnement', default: 'standard' })
  planAbonnement: string;

  @Column({ default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
