import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Notification, TypeNotification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ProduitsService } from '../produits/produits.service';
import { Cheque, StatutCheque } from '../paiements/entities/cheque.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(Cheque)
    private chequesRepository: Repository<Cheque>,
    private produitsService: ProduitsService,
  ) {}

  create(entrepriseId: string, dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      entrepriseId,
      userId: dto.userId ?? null,
      titre: dto.titre,
      message: dto.message,
      type: dto.type ?? TypeNotification.INFO,
    });
    return this.notificationsRepository.save(notification);
  }

  /**
   * A appeler periodiquement (cron) ou manuellement : cree une notification
   * "stock_bas" pour chaque produit dont le stock total est sous son seuil
   * d'alerte, en evitant les doublons non lus pour le meme produit.
   */
  async genererAlertesStock(entrepriseId: string): Promise<Notification[]> {
    const produitsEnAlerte = await this.produitsService.getProduitsEnAlerte(entrepriseId);
    const notifications: Notification[] = [];

    for (const produit of produitsEnAlerte) {
      const dejaExistante = await this.notificationsRepository.findOne({
        where: {
          entrepriseId,
          type: TypeNotification.STOCK_BAS,
          lue: false,
          titre: `Stock bas : ${produit.nom}`,
        },
      });
      if (dejaExistante) continue;

      const notification = this.notificationsRepository.create({
        entrepriseId,
        userId: null,
        titre: `Stock bas : ${produit.nom}`,
        message: `Le produit "${produit.nom}" est descendu sous son seuil d'alerte (${produit.seuilAlerte}).`,
        type: TypeNotification.STOCK_BAS,
      });
      notifications.push(await this.notificationsRepository.save(notification));
    }

    return notifications;
  }

  /**
   * Cree une notification "cheque_echeance" pour chaque cheque encore
   * EN_ATTENTE dont la date d'echeance est deja passee ou approche a moins
   * de 7 jours — pour ne pas se faire surprendre par un cheque a presenter
   * ou a honorer. Evite les doublons non lus pour le meme cheque.
   */
  async genererAlertesCheques(entrepriseId: string): Promise<Notification[]> {
    const dansSeptJours = new Date();
    dansSeptJours.setDate(dansSeptJours.getDate() + 7);
    const limite = dansSeptJours.toISOString().slice(0, 10);

    const chequesASurveiller = await this.chequesRepository.find({
      where: {
        entrepriseId,
        statut: StatutCheque.EN_ATTENTE,
        dateEcheance: LessThanOrEqual(limite),
      },
    });

    const notifications: Notification[] = [];

    for (const cheque of chequesASurveiller) {
      const titre = `Cheque a echeance : ${cheque.numeroCheque || cheque.id.slice(0, 8)}`;
      const dejaExistante = await this.notificationsRepository.findOne({
        where: { entrepriseId, type: TypeNotification.CHEQUE_ECHEANCE, lue: false, titre },
      });
      if (dejaExistante) continue;

      const enRetard = cheque.dateEcheance && cheque.dateEcheance < new Date().toISOString().slice(0, 10);
      const sens = cheque.type === 'recu' ? 'a encaisser' : 'a honorer';

      const notification = this.notificationsRepository.create({
        entrepriseId,
        userId: null,
        titre,
        message: `Cheque ${sens} de ${cheque.montant} MAD (${cheque.banque || 'banque non renseignee'}), echeance ${enRetard ? 'DEPASSEE' : 'proche'} le ${cheque.dateEcheance}.`,
        type: TypeNotification.CHEQUE_ECHEANCE,
      });
      notifications.push(await this.notificationsRepository.save(notification));
    }

    return notifications;
  }

  /**
   * Regenere toutes les alertes automatiques (stock + cheques) en un seul
   * appel — utilise par le centre d'alertes du frontend.
   */
  async genererToutesLesAlertes(entrepriseId: string): Promise<Notification[]> {
    const [stock, cheques] = await Promise.all([
      this.genererAlertesStock(entrepriseId),
      this.genererAlertesCheques(entrepriseId),
    ]);
    return [...stock, ...cheques];
  }

  async findAllForEntreprise(entrepriseId: string, nonLuesUniquement = false): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: nonLuesUniquement ? { entrepriseId, lue: false } : { entrepriseId },
      order: { createdAt: 'DESC' },
    });
  }

  async marquerLue(id: string, entrepriseId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, entrepriseId },
    });
    if (!notification) throw new NotFoundException('Notification introuvable');
    notification.lue = true;
    return this.notificationsRepository.save(notification);
  }
}
