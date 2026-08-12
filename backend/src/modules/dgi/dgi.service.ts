import { Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';
import { FactureElectronique, StatutDgi } from './entities/facture-electronique.entity';
import { DocumentCommercial } from '../facturation/entities/document-commercial.entity';
import { Entreprise } from '../entreprises/entities/entreprise.entity';

@Injectable()
export class DgiService {
  constructor(
    @InjectRepository(FactureElectronique)
    private facturesElectroniquesRepository: Repository<FactureElectronique>,
    @InjectRepository(DocumentCommercial)
    private documentsRepository: Repository<DocumentCommercial>,
    @InjectRepository(Entreprise)
    private entreprisesRepository: Repository<Entreprise>,
  ) {}

  /**
   * Genere l'UUID et le QR code locaux pour une facture. Le contenu du QR
   * (ICE, montant, date, UUID) suit la logique generale des factures
   * electroniques marocaines, mais le format EXACT attendu par la DGI
   * (ordre des champs, encodage) devra etre ajuste selon leurs specifications
   * officielles avant une mise en production reelle.
   */
  async genererStructure(documentId: string, entrepriseId: string): Promise<FactureElectronique> {
    const document = await this.documentsRepository.findOne({
      where: { id: documentId, entrepriseId },
    });
    if (!document) throw new NotFoundException('Document introuvable');

    const existant = await this.facturesElectroniquesRepository.findOne({
      where: { documentId, entrepriseId },
    });
    if (existant) return existant;

    const entreprise = await this.entreprisesRepository.findOne({ where: { id: entrepriseId } });

    const uuidDgi = randomUUID();

    const contenuQr = [
      `ICE:${entreprise?.ice ?? ''}`,
      `NUM:${document.numero}`,
      `DATE:${document.dateDocument}`,
      `TTC:${document.totalTtc}`,
      `UUID:${uuidDgi}`,
    ].join('|');

    const qrCode = await QRCode.toDataURL(contenuQr);

    const facture = this.facturesElectroniquesRepository.create({
      entrepriseId,
      documentId,
      uuidDgi,
      qrCode,
      xmlSigne: null, // reste null : la generation XML + signature reelle
      // necessite le format officiel DGI, pas encore integre
      statutDgi: StatutDgi.EN_ATTENTE,
    });

    return this.facturesElectroniquesRepository.save(facture);
  }

  /**
   * Point d'entree prevu pour la soumission reelle a la DGI. Actuellement
   * non connecte a une API reelle (aucune credential/spec fournie) : renvoie
   * une erreur explicite plutot que de simuler un succes trompeur.
   */
  async envoyerADgi(documentId: string, entrepriseId: string): Promise<never> {
    throw new NotImplementedException(
      "Integration DGI reelle non connectee. La structure locale (UUID, QR code) " +
        "est prete (voir genererStructure), mais l'envoi effectif necessite " +
        "les specifications techniques officielles de la DGI et des identifiants " +
        'valides, qui ne sont pas configures dans cet environnement.',
    );
  }

  findAll(entrepriseId: string): Promise<FactureElectronique[]> {
    return this.facturesElectroniquesRepository.find({ where: { entrepriseId } });
  }

  async findOne(documentId: string, entrepriseId: string): Promise<FactureElectronique> {
    const facture = await this.facturesElectroniquesRepository.findOne({
      where: { documentId, entrepriseId },
    });
    if (!facture) throw new NotFoundException('Structure DGI introuvable pour ce document');
    return facture;
  }
}
