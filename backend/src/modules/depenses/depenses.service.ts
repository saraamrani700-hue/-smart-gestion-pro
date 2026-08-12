import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Depense } from './entities/depense.entity';
import { CreateDepenseDto } from './dto/create-depense.dto';

@Injectable()
export class DepensesService {
  constructor(
    @InjectRepository(Depense)
    private repository: Repository<Depense>,
  ) {}

  create(entrepriseId: string, dto: CreateDepenseDto): Promise<Depense> {
    const depense = this.repository.create({ entrepriseId, ...dto });
    return this.repository.save(depense);
  }

  findAll(entrepriseId: string): Promise<Depense[]> {
    return this.repository.find({ where: { entrepriseId }, order: { dateDepense: 'DESC' } });
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const depense = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!depense) throw new NotFoundException('Depense introuvable');
    await this.repository.remove(depense);
  }
}
