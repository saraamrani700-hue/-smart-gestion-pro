import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum TypeNotification {
  INFO = 'info',
  ALERTE = 'alerte',
  ERREUR = 'erreur',
  STOCK_BAS = 'stock_bas',
  PAIEMENT = 'paiement',
  CHEQUE_ECHEANCE = 'cheque_echeance',
}

@Entity('notifications')
export class Notification extends BaseTenantEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null; // null = notification pour toute l'entreprise

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'enum', enum: TypeNotification, default: TypeNotification.INFO })
  type: TypeNotification;

  @Column({ default: false })
  lue: boolean;
}
