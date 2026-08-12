import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, statSync, createReadStream } from 'fs';
import { join } from 'path';
import { google } from 'googleapis';
import { Sauvegarde, StatutSauvegarde } from './entities/sauvegarde.entity';

const execAsync = promisify(exec);

const DOSSIER_SAUVEGARDES = process.env.DOSSIER_SAUVEGARDES || '/tmp/smart-gestion-pro-backups';

@Injectable()
export class SauvegardesService {
  private readonly logger = new Logger(SauvegardesService.name);

  constructor(
    @InjectRepository(Sauvegarde)
    private sauvegardesRepository: Repository<Sauvegarde>,
  ) {}

  /**
   * Lance un vrai dump PostgreSQL (pg_dump) de la base configuree via les
   * variables d'environnement DB_*, l'enregistre sur disque local, PUIS
   * l'uploade automatiquement vers Google Drive si un compte de service est
   * configure (voir README section "Sauvegardes Google Drive"). Le fichier
   * local est toujours conserve, meme si l'upload Google Drive echoue ou
   * n'est pas configure — la sauvegarde locale ne depend jamais de Google Drive.
   */
  async creerSauvegarde(entrepriseId: string): Promise<Sauvegarde> {
    if (!existsSync(DOSSIER_SAUVEGARDES)) {
      mkdirSync(DOSSIER_SAUVEGARDES, { recursive: true });
    }

    const horodatage = new Date().toISOString().replace(/[:.]/g, '-');
    const nomFichier = `backup-${entrepriseId}-${horodatage}.sql`;
    const cheminFichier = join(DOSSIER_SAUVEGARDES, nomFichier);

    let sauvegarde = this.sauvegardesRepository.create({
      entrepriseId,
      statut: StatutSauvegarde.EN_COURS,
    });
    sauvegarde = await this.sauvegardesRepository.save(sauvegarde);

    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '5432';
    const username = process.env.DB_USERNAME || 'postgres';
    const database = process.env.DB_NAME || 'smart_gestion_pro';
    const password = process.env.DB_PASSWORD || '';

    // PGPASSWORD evite d'exposer le mot de passe dans la commande elle-meme
    const commande = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${cheminFichier}"`;

    try {
      await execAsync(commande);
      const taille = statSync(cheminFichier).size;

      sauvegarde.fichierUrl = cheminFichier;
      sauvegarde.tailleOctets = taille;
      sauvegarde.statut = StatutSauvegarde.REUSSIE;

      // Upload Google Drive — ne fait jamais echouer la sauvegarde locale,
      // deja reussie a ce stade, meme si Google Drive n'est pas configure
      // ou si l'upload rencontre un probleme reseau/permissions.
      try {
        const resultatDrive = await this.uploaderVersGoogleDrive(cheminFichier, nomFichier);
        if (resultatDrive) {
          sauvegarde.googleDriveFileId = resultatDrive.fileId;
          sauvegarde.googleDriveUrl = resultatDrive.url;
        }
      } catch (erreurDrive) {
        this.logger.warn(
          `Sauvegarde locale reussie mais upload Google Drive echoue : ${erreurDrive instanceof Error ? erreurDrive.message : erreurDrive}`,
        );
        sauvegarde.messageErreur = `Local OK, Google Drive echoue : ${erreurDrive instanceof Error ? erreurDrive.message : erreurDrive}`;
      }
    } catch (erreur) {
      sauvegarde.statut = StatutSauvegarde.ECHOUEE;
      sauvegarde.messageErreur = erreur instanceof Error ? erreur.message : String(erreur);
    }

    return this.sauvegardesRepository.save(sauvegarde);
  }

  /**
   * Uploade un fichier vers Google Drive via un compte de service (aucune
   * fenetre de connexion navigateur necessaire, ideal pour un serveur
   * automatise). Retourne null si Google Drive n'est pas configure
   * (variables d'environnement absentes) — c'est un etat normal, pas une
   * erreur, tant que l'utilisateur n'a pas fourni ses identifiants.
   *
   * Configuration requise (voir README) :
   *   GOOGLE_DRIVE_ENABLED=true
   *   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/chemin/vers/service-account.json
   *   GOOGLE_DRIVE_FOLDER_ID=<id du dossier Drive partage avec le compte de service>
   */
  private async uploaderVersGoogleDrive(
    cheminFichier: string,
    nomFichier: string,
  ): Promise<{ fileId: string; url: string } | null> {
    if (process.env.GOOGLE_DRIVE_ENABLED !== 'true') {
      return null;
    }

    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!keyPath || !folderId) {
      this.logger.warn(
        'GOOGLE_DRIVE_ENABLED=true mais GOOGLE_SERVICE_ACCOUNT_KEY_PATH ou GOOGLE_DRIVE_FOLDER_ID manquant — upload ignore.',
      );
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: keyPath,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const reponse = await drive.files.create({
      requestBody: {
        name: nomFichier,
        parents: [folderId],
      },
      media: {
        mimeType: 'application/sql',
        body: createReadStream(cheminFichier),
      },
      fields: 'id, webViewLink',
    });

    return {
      fileId: reponse.data.id!,
      url: reponse.data.webViewLink || `https://drive.google.com/file/d/${reponse.data.id}/view`,
    };
  }

  findAll(entrepriseId: string): Promise<Sauvegarde[]> {
    return this.sauvegardesRepository.find({
      where: { entrepriseId },
      order: { createdAt: 'DESC' },
    });
  }
}
