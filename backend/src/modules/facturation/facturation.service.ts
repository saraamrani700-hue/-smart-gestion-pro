import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import {
  DocumentCommercial,
  StatutDocumentCommercial,
  TypeDocumentCommercial,
} from './entities/document-commercial.entity';
import { LigneDocument } from './entities/ligne-document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { Vente } from '../ventes/entities/vente.entity';
import { Client } from '../clients-fournisseurs/entities/client.entity';

const PREFIXES: Record<TypeDocumentCommercial, string> = {
  [TypeDocumentCommercial.DEVIS]: 'DEV',
  [TypeDocumentCommercial.PROFORMA]: 'PRO',
  [TypeDocumentCommercial.BON_LIVRAISON]: 'BL',
  [TypeDocumentCommercial.FACTURE]: 'FAC',
  [TypeDocumentCommercial.AVOIR]: 'AV',
};

@Injectable()
export class FacturationService {
  constructor(
    @InjectRepository(DocumentCommercial)
    private documentsRepository: Repository<DocumentCommercial>,
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    private dataSource: DataSource,
  ) {}

  private async genererNumero(
    entrepriseId: string,
    type: TypeDocumentCommercial,
  ): Promise<string> {
    const count = await this.documentsRepository.count({ where: { entrepriseId, type } });
    const date = new Date();
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `${PREFIXES[type]}-${yyyymmdd}-${String(count + 1).padStart(5, '0')}`;
  }

  private calculerTotaux(lignes: CreateDocumentDto['lignes']) {
    let totalHt = 0;
    let totalTva = 0;
    for (const l of lignes) {
      const brut = l.quantite * l.prixUnitaireHt;
      const remise = brut * ((l.remisePct ?? 0) / 100);
      const ht = brut - remise;
      totalHt += ht;
      totalTva += ht * (l.tauxTva / 100);
    }
    return {
      totalHt: Math.round(totalHt * 100) / 100,
      totalTva: Math.round(totalTva * 100) / 100,
      totalTtc: Math.round((totalHt + totalTva) * 100) / 100,
    };
  }

  async create(entrepriseId: string, dto: CreateDocumentDto): Promise<DocumentCommercial> {
    const numero = await this.genererNumero(entrepriseId, dto.type);
    const totaux = this.calculerTotaux(dto.lignes);

    const document = this.documentsRepository.create({
      entrepriseId,
      type: dto.type,
      numero,
      clientId: dto.clientId ?? null,
      documentOrigineId: dto.documentOrigineId ?? null,
      statut: StatutDocumentCommercial.BROUILLON,
      dateDocument: new Date().toISOString().slice(0, 10),
      dateEcheance: dto.dateEcheance ?? null,
      ...totaux,
      lignes: dto.lignes.map((l) => ({
        produitId: l.produitId ?? null,
        designation: l.designation,
        quantite: l.quantite,
        prixUnitaireHt: l.prixUnitaireHt,
        tauxTva: l.tauxTva,
        remisePct: l.remisePct ?? 0,
      })) as LigneDocument[],
    });

    return this.documentsRepository.save(document);
  }

  findAll(entrepriseId: string, type?: TypeDocumentCommercial): Promise<DocumentCommercial[]> {
    return this.documentsRepository.find({
      where: type ? { entrepriseId, type } : { entrepriseId },
      relations: ['lignes', 'lignes.produit', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, entrepriseId: string): Promise<DocumentCommercial> {
    const document = await this.documentsRepository.findOne({
      where: { id, entrepriseId },
      relations: ['lignes', 'lignes.produit', 'client'],
    });
    if (!document) throw new NotFoundException('Document introuvable');
    return document;
  }

  /**
   * Convertit un document en un autre type (ex: Devis -> Facture, Facture ->
   * Avoir). L'original est marque CONVERTI et un nouveau document est cree
   * avec les memes lignes, en reference au document d'origine.
   */
  async convertir(
    id: string,
    entrepriseId: string,
    nouveauType: TypeDocumentCommercial,
  ): Promise<DocumentCommercial> {
    return this.dataSource.transaction(async (manager) => {
      const original = await manager.findOne(DocumentCommercial, {
        where: { id, entrepriseId },
        relations: ['lignes'],
      });
      if (!original) throw new NotFoundException('Document introuvable');
      if (original.statut === StatutDocumentCommercial.CONVERTI) {
        throw new BadRequestException('Ce document a deja ete converti');
      }

      const numero = await this.genererNumero(entrepriseId, nouveauType);

      const nouveau = manager.create(DocumentCommercial, {
        entrepriseId,
        type: nouveauType,
        numero,
        clientId: original.clientId,
        documentOrigineId: original.id,
        statut: StatutDocumentCommercial.BROUILLON,
        dateDocument: new Date().toISOString().slice(0, 10),
        totalHt: original.totalHt,
        totalTva: original.totalTva,
        totalTtc: original.totalTtc,
        lignes: original.lignes.map((l) => ({
          produitId: l.produitId,
          designation: l.designation,
          quantite: l.quantite,
          prixUnitaireHt: l.prixUnitaireHt,
          tauxTva: l.tauxTva,
          remisePct: l.remisePct,
        })) as LigneDocument[],
      });

      const nouveauSauvegarde = await manager.save(DocumentCommercial, nouveau);

      original.statut = StatutDocumentCommercial.CONVERTI;
      await manager.save(DocumentCommercial, original);

      return nouveauSauvegarde;
    });
  }

  /**
   * Genere une Facture "officielle" a partir d'une Vente deja validee (le
   * stock a deja ete decremente par VentesService). C'est le pont entre le
   * module Ventes (transactionnel) et Facturation (document imprimable).
   */
  async genererFactureDepuisVente(venteId: string, entrepriseId: string): Promise<DocumentCommercial> {
    const vente = await this.dataSource.getRepository(Vente).findOne({
      where: { id: venteId, entrepriseId },
      relations: ['lignes', 'lignes.produit'],
    });
    if (!vente) throw new NotFoundException('Vente introuvable');

    const numero = await this.genererNumero(entrepriseId, TypeDocumentCommercial.FACTURE);

    const document = this.documentsRepository.create({
      entrepriseId,
      type: TypeDocumentCommercial.FACTURE,
      numero,
      clientId: vente.clientId,
      venteId: vente.id,
      statut: StatutDocumentCommercial.ACCEPTE,
      dateDocument: new Date().toISOString().slice(0, 10),
      totalHt: vente.totalHt,
      totalTva: vente.totalTva,
      totalTtc: vente.totalTtc,
      lignes: vente.lignes.map((l) => ({
        produitId: l.produitId,
        designation: l.produit?.nom,
        quantite: l.quantite,
        prixUnitaireHt: l.prixUnitaireHt,
        tauxTva: l.tauxTva,
        remisePct: l.remisePct,
      })) as LigneDocument[],
    });

    return this.documentsRepository.save(document);
  }

  async annuler(id: string, entrepriseId: string): Promise<DocumentCommercial> {
    const document = await this.findOne(id, entrepriseId);
    document.statut = StatutDocumentCommercial.ANNULE;
    return this.documentsRepository.save(document);
  }

  /**
   * Suppression definitive, reservee aux documents encore au statut
   * BROUILLON (jamais envoyes/finalises) — utile pour nettoyer un essai
   * rate (import Excel mal forme, etc.) sans laisser de trace inutile.
   * Un document deja converti/envoye/accepte ne peut pas etre supprime,
   * seulement annule, pour preserver la tracabilite.
   */
  async supprimer(id: string, entrepriseId: string): Promise<void> {
    const document = await this.findOne(id, entrepriseId);
    if (document.statut !== StatutDocumentCommercial.BROUILLON) {
      throw new BadRequestException(
        'Seul un document encore au statut "brouillon" peut etre supprime definitivement. ' +
          'Utilisez "Annuler" pour les autres.',
      );
    }
    await this.documentsRepository.remove(document);
  }

  // ---------------------------------------------------------------------
  // IMPORT EXCEL
  // ---------------------------------------------------------------------

  /**
   * Lit un fichier Excel et cree un document commercial par groupe de lignes
   * partageant la meme colonne "Numero" (ou un document par ligne si cette
   * colonne est absente/vide). Colonnes attendues dans la premiere feuille
   * (l'ordre n'importe pas, les noms sont insensibles a la casse et aux
   * accents) :
   *   Numero | Type | Client | Designation | Quantite | PrixUnitaireHT | TVA
   *
   * "Type" doit valoir : devis, proforma, bon_livraison, facture ou avoir
   * (par defaut "facture" si absent). "Client" est recherche par nom exact
   * dans l'entreprise ; s'il n'existe pas, il est cree automatiquement.
   */
  async importerDepuisExcel(
    entrepriseId: string,
    buffer: Buffer,
  ): Promise<{ documentsCrees: number; documents: DocumentCommercial[]; erreurs: string[] }> {
    const erreurs: string[] = [];
    let lignesBrutes: Record<string, unknown>[];

    try {
      const classeur = XLSX.read(buffer, { type: 'buffer' });
      const premiereFeuille = classeur.Sheets[classeur.SheetNames[0]];
      lignesBrutes = XLSX.utils.sheet_to_json(premiereFeuille, { defval: '' });
    } catch (e) {
      throw new BadRequestException(
        "Impossible de lire le fichier Excel. Verifiez qu'il s'agit bien d'un fichier .xlsx ou .xls valide.",
      );
    }

    if (lignesBrutes.length === 0) {
      throw new BadRequestException('Le fichier Excel ne contient aucune ligne de donnees.');
    }

    // Normalise les noms de colonnes (insensible a la casse/accents/espaces)
    const normaliser = (s: string) =>
      s.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

    const lireChamp = (ligne: Record<string, unknown>, ...cles: string[]): string => {
      const entree = Object.entries(ligne).find(([k]) => cles.includes(normaliser(k)));
      return entree ? String(entree[1]).trim() : '';
    };

    // Regroupe les lignes par numero de document (un numero vide = un
    // document independant par ligne, identifie par son index)
    const groupes = new Map<string, Record<string, unknown>[]>();
    lignesBrutes.forEach((ligne, index) => {
      const numero = lireChamp(ligne, 'numero', 'numerodocument', 'reference') || `__ligne_${index}`;
      if (!groupes.has(numero)) groupes.set(numero, []);
      groupes.get(numero)!.push(ligne);
    });

    const documentsCrees: DocumentCommercial[] = [];

    for (const [cle, lignesGroupe] of groupes) {
      try {
        const premiereLigne = lignesGroupe[0];
        const typeBrut = lireChamp(premiereLigne, 'type').toLowerCase() || 'facture';
        const typesValides = Object.values(TypeDocumentCommercial) as string[];
        const type = typesValides.includes(typeBrut)
          ? (typeBrut as TypeDocumentCommercial)
          : TypeDocumentCommercial.FACTURE;

        const nomClient = lireChamp(premiereLigne, 'client', 'nomclient');
        let clientId: string | undefined;
        if (nomClient) {
          let client = await this.clientsRepository.findOne({ where: { entrepriseId, nom: nomClient } });
          if (!client) {
            client = await this.clientsRepository.save(
              this.clientsRepository.create({ entrepriseId, nom: nomClient }),
            );
          }
          clientId = client.id;
        }

        const lignes = lignesGroupe.map((ligne, indexLigne) => {
          const texteQuantite = lireChamp(ligne, 'quantite', 'qte');
          const texteprix = lireChamp(ligne, 'prixunitaireht', 'prixht', 'prix');
          const texteTva = lireChamp(ligne, 'tva', 'tauxtva');

          const quantite = texteQuantite ? parseFloat(texteQuantite) : 1;
          const prixUnitaireHt = parseFloat(texteprix);
          const tauxTva = texteTva ? parseFloat(texteTva) : 20;
          const designation = lireChamp(ligne, 'designation', 'produit', 'article') || 'Article';

          // Un prix absent ou illisible est une VRAIE erreur, pas un 0 par
          // defaut silencieux — sinon on cree des documents fantomes a
          // 0,00 MAD sans que l'utilisateur comprenne pourquoi.
          if (!texteprix || isNaN(prixUnitaireHt)) {
            throw new Error(
              `ligne ${indexLigne + 1} : colonne "PrixUnitaireHT" manquante ou illisible ` +
                `(valeur trouvee : "${texteprix || '(vide)'}")`,
            );
          }
          if (isNaN(quantite) || quantite <= 0) {
            throw new Error(`ligne ${indexLigne + 1} : quantite invalide ("${texteQuantite}")`);
          }
          return { designation, quantite, prixUnitaireHt, tauxTva };
        });

        const document = await this.create(entrepriseId, {
          type,
          clientId,
          lignes,
        });
        documentsCrees.push(await this.findOne(document.id, entrepriseId));
      } catch (e) {
        erreurs.push(
          `Groupe "${cle}" : ${e instanceof Error ? e.message : 'erreur inconnue'}`,
        );
      }
    }

    return { documentsCrees: documentsCrees.length, documents: documentsCrees, erreurs };
  }
}
