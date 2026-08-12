import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalAudit } from './entities/journal-audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(JournalAudit)
    private journalRepository: Repository<JournalAudit>,
  ) {}

  async enregistrer(entry: {
    entrepriseId: string | null;
    userId: string | null;
    action: string;
    tableCible?: string;
    donnees?: Record<string, unknown>;
    ipAdresse?: string;
  }): Promise<void> {
    try {
      const ligne = this.journalRepository.create(entry);
      await this.journalRepository.save(ligne);
    } catch {
      // L'audit ne doit jamais faire echouer la requete metier en cours.
      // En production, on logguerait cette erreur vers un systeme externe.
    }
  }

  findAll(entrepriseId: string, limit = 200): Promise<JournalAudit[]> {
    return this.journalRepository.find({
      where: { entrepriseId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
