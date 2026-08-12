import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entreprise } from './entities/entreprise.entity';
import { Succursale } from './entities/succursale.entity';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

@Injectable()
export class EntreprisesService {
  constructor(
    @InjectRepository(Entreprise)
    private entreprisesRepository: Repository<Entreprise>,
    @InjectRepository(Succursale)
    private succursalesRepository: Repository<Succursale>,
  ) {}

  async findById(id: string): Promise<Entreprise> {
    const entreprise = await this.entreprisesRepository.findOne({ where: { id } });
    if (!entreprise) throw new NotFoundException('Entreprise introuvable');
    return entreprise;
  }

  async update(id: string, dto: UpdateEntrepriseDto): Promise<Entreprise> {
    const entreprise = await this.findById(id);
    Object.assign(entreprise, dto);
    return this.entreprisesRepository.save(entreprise);
  }

  async findSuccursales(entrepriseId: string): Promise<Succursale[]> {
    return this.succursalesRepository.find({ where: { entrepriseId } });
  }

  async createSuccursale(
    entrepriseId: string,
    data: { nom: string; adresse?: string; telephone?: string },
  ): Promise<Succursale> {
    const succursale = this.succursalesRepository.create({
      entrepriseId,
      ...data,
    });
    return this.succursalesRepository.save(succursale);
  }
}
