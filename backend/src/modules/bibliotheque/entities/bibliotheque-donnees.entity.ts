import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * L'application "Gestion Bibliotheque" (convertie depuis une appli de bureau
 * Electron) gere elle-meme tout son etat metier en memoire (produits, ventes,
 * clients, achats...) et persiste l'ensemble sous forme d'UN SEUL bloc JSON.
 * Ce choix vient de l'application d'origine ; on le conserve a l'identique
 * cote serveur plutot que de re-decouper en tables relationnelles, ce qui
 * aurait demande de reecrire toute la logique metier React sans necessite
 * reelle (l'app fonctionne, ce n'est qu'un changement de lieu de stockage).
 */
@Entity('bibliotheque_donnees')
export class BibliothequeDonnees {
  @PrimaryColumn({ name: 'entreprise_id', type: 'uuid' })
  entrepriseId: string;

  @Column({ type: 'text' })
  donnees: string;

  // Protection contre l'ecrasement silencieux : incremente a chaque
  // sauvegarde. Le client doit renvoyer la version qu'il avait chargee ;
  // si elle ne correspond plus (quelqu'un d'autre a sauvegarde entre temps),
  // la sauvegarde est refusee plutot que d'ecraser silencieusement les
  // changements de l'autre utilisateur.
  @Column({ type: 'int', default: 1 })
  version: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
