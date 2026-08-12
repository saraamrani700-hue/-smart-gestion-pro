import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BibliothequeDonnees } from './entities/bibliotheque-donnees.entity';

export interface DonneesAvecVersion {
  donnees: string | null;
  version: number;
}

@Injectable()
export class BibliothequeService {
  constructor(
    @InjectRepository(BibliothequeDonnees)
    private repository: Repository<BibliothequeDonnees>,
  ) {}

  async charger(entrepriseId: string): Promise<DonneesAvecVersion> {
    const ligne = await this.repository.findOne({ where: { entrepriseId } });
    return ligne ? { donnees: ligne.donnees, version: ligne.version } : { donnees: null, version: 0 };
  }

  /**
   * Sauvegarde avec verrouillage optimiste : si le client indique une
   * version qui ne correspond plus a celle en base (quelqu'un d'autre a
   * sauvegarde entre temps), la sauvegarde est REFUSEE avec une erreur
   * explicite plutot que d'ecraser silencieusement les changements de
   * l'autre utilisateur — c'est le vrai risque d'un stockage "un seul
   * gros bloc" en usage multi-utilisateur, et c'est ce qui differencie
   * une architecture serveur correcte d'un simple fichier deplace en ligne.
   */
  async sauvegarder(
    entrepriseId: string,
    donnees: string,
    versionAttendue?: number,
  ): Promise<{ version: number }> {
    let ligne = await this.repository.findOne({ where: { entrepriseId } });

    if (!ligne) {
      // Premiere sauvegarde pour cette entreprise : aucun conflit possible.
      ligne = this.repository.create({ entrepriseId, donnees, version: 1 });
      await this.repository.save(ligne);
      return { version: 1 };
    }

    if (versionAttendue !== undefined && versionAttendue !== ligne.version) {
      throw new ConflictException(
        "Ces donnees ont ete modifiees par quelqu'un d'autre depuis votre dernier chargement. " +
          'Rechargez la page pour recuperer la version la plus recente avant de continuer, ' +
          "sinon vous risqueriez d'ecraser son travail.",
      );
    }

    ligne.donnees = donnees;
    ligne.version = ligne.version + 1;
    await this.repository.save(ligne);
    return { version: ligne.version };
  }
}
