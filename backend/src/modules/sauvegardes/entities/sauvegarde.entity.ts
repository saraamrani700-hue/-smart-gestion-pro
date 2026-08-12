import { Entity, Column } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

export enum StatutSauvegarde {
  EN_COURS = 'en_cours',
  REUSSIE = 'reussie',
  ECHOUEE = 'echouee',
}

/**
 * Le champ fichierUrl contient le CHEMIN LOCAL sur le serveur
 * (ex: /var/backups/smart-gestion-pro/xxx.sql). En complement, si un compte
 * de service Google est configure (voir SauvegardesService), le fichier est
 * aussi uploade sur Google Drive et sa reference est stockee dans
 * googleDriveFileId / googleDriveUrl.
 */
@Entity('sauvegardes')
export class Sauvegarde extends BaseTenantEntity {
  @Column({ name: 'fichier_url', nullable: true })
  fichierUrl: string;

  @Column({ name: 'taille_octets', type: 'bigint', nullable: true })
  tailleOctets: number;

  @Column({ type: 'enum', enum: StatutSauvegarde, default: StatutSauvegarde.EN_COURS })
  statut: StatutSauvegarde;

  @Column({ name: 'message_erreur', type: 'text', nullable: true })
  messageErreur: string | null;

  @Column({ name: 'google_drive_file_id', type: 'varchar', nullable: true })
  googleDriveFileId: string | null;

  @Column({ name: 'google_drive_url', type: 'varchar', nullable: true })
  googleDriveUrl: string | null;
}
