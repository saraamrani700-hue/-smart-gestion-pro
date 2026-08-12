import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employe } from './entities/employe.entity';
import { Conge, StatutConge } from './entities/conge.entity';
import { FichePaie } from './entities/fiche-paie.entity';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { CreateCongeDto } from './dto/create-conge.dto';
import { CreateFichePaieDto } from './dto/create-fiche-paie.dto';

@Injectable()
export class RhService {
  constructor(
    @InjectRepository(Employe)
    private employesRepository: Repository<Employe>,
    @InjectRepository(Conge)
    private congesRepository: Repository<Conge>,
    @InjectRepository(FichePaie)
    private fichesRepository: Repository<FichePaie>,
  ) {}

  // ---------------------------------------------------------------------
  // EMPLOYES
  // ---------------------------------------------------------------------

  createEmploye(entrepriseId: string, dto: CreateEmployeDto): Promise<Employe> {
    const employe = this.employesRepository.create({ entrepriseId, ...dto });
    return this.employesRepository.save(employe);
  }

  findAllEmployes(entrepriseId: string): Promise<Employe[]> {
    return this.employesRepository.find({ where: { entrepriseId }, order: { nomComplet: 'ASC' } });
  }

  async findOneEmploye(id: string, entrepriseId: string): Promise<Employe> {
    const employe = await this.employesRepository.findOne({ where: { id, entrepriseId } });
    if (!employe) throw new NotFoundException('Employe introuvable');
    return employe;
  }

  // ---------------------------------------------------------------------
  // CONGES
  // ---------------------------------------------------------------------

  async createConge(entrepriseId: string, dto: CreateCongeDto): Promise<Conge> {
    await this.findOneEmploye(dto.employeId, entrepriseId); // valide l'appartenance
    const conge = this.congesRepository.create({ entrepriseId, ...dto });
    return this.congesRepository.save(conge);
  }

  findAllConges(entrepriseId: string): Promise<Conge[]> {
    return this.congesRepository.find({
      where: { entrepriseId },
      relations: ['employe'],
      order: { dateDebut: 'DESC' },
    });
  }

  async traiterConge(id: string, entrepriseId: string, approuve: boolean): Promise<Conge> {
    const conge = await this.congesRepository.findOne({ where: { id, entrepriseId } });
    if (!conge) throw new NotFoundException('Demande de conge introuvable');
    conge.statut = approuve ? StatutConge.APPROUVE : StatutConge.REFUSE;
    return this.congesRepository.save(conge);
  }

  // ---------------------------------------------------------------------
  // PAIE (calcul simplifie - ne remplace pas un vrai logiciel de paie
  // conforme CNSS/IR marocain, utile pour un apercu rapide uniquement)
  // ---------------------------------------------------------------------

  async createFichePaie(entrepriseId: string, dto: CreateFichePaieDto): Promise<FichePaie> {
    const employe = await this.findOneEmploye(dto.employeId, entrepriseId);
    const primes = dto.primes ?? 0;
    const deductions = dto.deductions ?? 0;
    const salaireNet = Number(employe.salaireBase) + primes - deductions;

    const fiche = this.fichesRepository.create({
      entrepriseId,
      employeId: dto.employeId,
      periode: dto.periode,
      salaireBase: employe.salaireBase,
      primes,
      deductions,
      salaireNet: Math.round(salaireNet * 100) / 100,
    });

    return this.fichesRepository.save(fiche);
  }

  findAllFichesPaie(entrepriseId: string, employeId?: string): Promise<FichePaie[]> {
    return this.fichesRepository.find({
      where: employeId ? { entrepriseId, employeId } : { entrepriseId },
      relations: ['employe'],
      order: { createdAt: 'DESC' },
    });
  }
}
