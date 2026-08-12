import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createWorker } from 'tesseract.js';
import { Vente, StatutVente } from '../ventes/entities/vente.entity';
import { IaPrevision } from './entities/ia-prevision.entity';
import { IaDocumentAnalyse } from './entities/ia-document-analyse.entity';
import { PrevoirVentesDto } from './dto/prevoir-ventes.dto';

@Injectable()
export class IaService {
  constructor(
    @InjectRepository(Vente)
    private ventesRepository: Repository<Vente>,
    @InjectRepository(IaPrevision)
    private previsionsRepository: Repository<IaPrevision>,
    @InjectRepository(IaDocumentAnalyse)
    private analysesRepository: Repository<IaDocumentAnalyse>,
  ) {}

  // ---------------------------------------------------------------------
  // PREVISION DES VENTES (regression lineaire simple, calcul reel — pas
  // un placeholder — sur l'historique mensuel des ventes de l'entreprise)
  // ---------------------------------------------------------------------

  async previsionVentes(entrepriseId: string, dto: PrevoirVentesDto): Promise<IaPrevision> {
    const nombreMois = dto.nombreMoisHistorique ?? 6;

    const dateDebut = new Date();
    dateDebut.setMonth(dateDebut.getMonth() - nombreMois);

    const ventes = await this.ventesRepository.find({
      where: { entrepriseId },
    });

    const ventesFiltrees = ventes.filter(
      (v) => v.statut !== StatutVente.ANNULEE && new Date(v.createdAt) >= dateDebut,
    );

    // Regroupement par mois (cle 'YYYY-MM')
    const totauxParMois = new Map<string, number>();
    for (const v of ventesFiltrees) {
      const cle = new Date(v.createdAt).toISOString().slice(0, 7);
      totauxParMois.set(cle, (totauxParMois.get(cle) ?? 0) + Number(v.totalTtc));
    }

    const moisTries = Array.from(totauxParMois.keys()).sort();
    const valeurs = moisTries.map((m) => totauxParMois.get(m)!);

    // Regression lineaire (moindres carres) : y = a*x + b, x = index du mois
    const { a, b, prevision, moisSuivant } = this.regressionLineaire(valeurs, moisTries);

    const previsionEnregistree = this.previsionsRepository.create({
      entrepriseId,
      type: 'ventes',
      periode: moisSuivant,
      valeurPrevue: Math.max(0, Math.round(prevision * 100) / 100),
      donneesJson: {
        historique: Object.fromEntries(totauxParMois),
        pente: Math.round(a * 100) / 100,
        ordonneeOrigine: Math.round(b * 100) / 100,
        nombreMoisAnalyses: moisTries.length,
        methode: 'regression_lineaire_moindres_carres',
      },
    });

    return this.previsionsRepository.save(previsionEnregistree);
  }

  private regressionLineaire(
    valeurs: number[],
    moisTries: string[],
  ): { a: number; b: number; prevision: number; moisSuivant: string } {
    const n = valeurs.length;

    if (n === 0) {
      const moisSuivant = new Date().toISOString().slice(0, 7);
      return { a: 0, b: 0, prevision: 0, moisSuivant };
    }

    if (n === 1) {
      const moisSuivant = this.moisSuivantDe(moisTries[0]);
      return { a: 0, b: valeurs[0], prevision: valeurs[0], moisSuivant };
    }

    // x = 0, 1, 2... (index du mois), y = totaux
    const xs = valeurs.map((_, i) => i);
    const sommeX = xs.reduce((s, x) => s + x, 0);
    const sommeY = valeurs.reduce((s, y) => s + y, 0);
    const sommeXY = xs.reduce((s, x, i) => s + x * valeurs[i], 0);
    const sommeX2 = xs.reduce((s, x) => s + x * x, 0);

    const denom = n * sommeX2 - sommeX * sommeX;
    const a = denom !== 0 ? (n * sommeXY - sommeX * sommeY) / denom : 0;
    const b = (sommeY - a * sommeX) / n;

    const prochainIndex = n; // le mois suivant le dernier de l'historique
    const prevision = a * prochainIndex + b;
    const moisSuivant = this.moisSuivantDe(moisTries[moisTries.length - 1]);

    return { a, b, prevision, moisSuivant };
  }

  private moisSuivantDe(moisAAAAMM: string): string {
    const [annee, mois] = moisAAAAMM.split('-').map(Number);
    const date = new Date(annee, mois - 1 + 1, 1); // +1 mois
    return date.toISOString().slice(0, 7);
  }

  findAllPrevisions(entrepriseId: string): Promise<IaPrevision[]> {
    return this.previsionsRepository.find({ where: { entrepriseId }, order: { createdAt: 'DESC' } });
  }

  // ---------------------------------------------------------------------
  // OCR — lecture reelle de documents scannes via Tesseract.js
  // ---------------------------------------------------------------------

  /**
   * Extrait le texte d'une image (facture scannee, ticket, etc.) en base64.
   * Utilise Tesseract.js (moteur OCR open-source, execute localement, sans
   * service tiers). NOTE : au premier appel, Tesseract.js telecharge les
   * donnees linguistiques ("eng.traineddata") si elles ne sont pas deja en
   * cache localement — une connexion internet est necessaire sur le serveur
   * lors de ce premier telechargement (ou fournir le fichier en local pour
   * un fonctionnement 100% hors-ligne).
   */
  async lireDocument(entrepriseId: string, imageBase64: string): Promise<IaDocumentAnalyse> {
    const donneesPropres = imageBase64.includes(',')
      ? imageBase64.split(',')[1]
      : imageBase64;
    const buffer = Buffer.from(donneesPropres, 'base64');

    let worker;
    try {
      worker = await createWorker('eng', 1, {
        // CRITIQUE : sans errorHandler, Tesseract.js fait un "throw" interne
        // sur echec de chargement (ex: donnees linguistiques inaccessibles),
        // ce qui plante TOUT le processus Node.js (pas seulement la requete
        // en cours). Ce handler ne doit RIEN relancer : le rejet normal de
        // la promesse de createWorker() (capture par ce try/catch) suffit.
        errorHandler: () => {},
      });
    } catch (erreur) {
      throw new Error(
        "Le moteur OCR n'a pas pu se charger. Verifiez que le serveur a acces a " +
          'internet (telechargement des donnees linguistiques au premier appel), ' +
          `ou reessayez plus tard. Detail : ${erreur instanceof Error ? erreur.message : erreur}`,
      );
    }

    let texteExtrait = '';
    let confiance = 0;

    try {
      const resultat = await worker.recognize(buffer);
      texteExtrait = resultat.data.text;
      confiance = resultat.data.confidence;
    } finally {
      await worker.terminate();
    }

    const donneesExtraites = this.extraireChampsFacture(texteExtrait);

    const analyse = this.analysesRepository.create({
      entrepriseId,
      typeDocument: 'document_scanne',
      texteExtrait,
      confiance,
      statut: 'traite',
      donneesExtraites,
    });

    return this.analysesRepository.save(analyse);
  }

  /**
   * Tente de reperer, dans le texte brut extrait par l'OCR, les champs
   * typiques d'une facture/ticket : montant TTC, HT, TVA, et une date.
   * Approche par expressions regulieres sur des mots-cles courants
   * (francais/anglais) — une extraction "au mieux", pas une garantie :
   * la qualite depend fortement de la nettete du document scanne et de
   * sa mise en page. A verifier manuellement avant tout usage comptable.
   */
  private extraireChampsFacture(texte: string): Record<string, unknown> {
    const nettoye = texte.replace(/\s+/g, ' ');

    const extraireMontant = (motsClefs: string[]): number | null => {
      for (const mot of motsClefs) {
        const positionMot = nettoye.search(new RegExp(mot, 'i'));
        if (positionMot === -1) continue;

        // Cherche, dans les 40 caracteres suivant le mot-cle, le premier
        // nombre qui n'est PAS immediatement suivi d'un "%" (pour ne pas
        // confondre un taux de TVA comme "20%" avec le montant reel qui suit).
        const zoneRecherche = nettoye.slice(positionMot, positionMot + 40);
        const regexNombres = /([0-9][0-9\s.,]*[0-9])\s*(%)?/g;
        let trouve: RegExpExecArray | null;
        while ((trouve = regexNombres.exec(zoneRecherche)) !== null) {
          if (trouve[2]) continue; // pourcentage : on ignore et on continue la recherche
          const nombre = trouve[1].replace(/\s/g, '').replace(',', '.').replace(/\.(?=.*\.)/g, '');
          const valeur = parseFloat(nombre);
          if (!isNaN(valeur)) return valeur;
        }
      }
      return null;
    };

    const dateTrouvee = nettoye.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/);

    return {
      montantTtc: extraireMontant(['total\\s*ttc', 'montant\\s*ttc', 'total\\s*a\\s*payer', 'grand\\s*total', 'total']),
      montantHt: extraireMontant(['total\\s*ht', 'montant\\s*ht', 'sous[\\s-]*total']),
      montantTva: extraireMontant(['tva', 'vat']),
      date: dateTrouvee ? dateTrouvee[1] : null,
      avertissement:
        'Extraction automatique non garantie — verifiez ces valeurs par rapport au document original avant utilisation comptable.',
    };
  }

  findAllAnalyses(entrepriseId: string): Promise<IaDocumentAnalyse[]> {
    return this.analysesRepository.find({ where: { entrepriseId }, order: { createdAt: 'DESC' } });
  }
}
