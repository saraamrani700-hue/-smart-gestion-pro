import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalculZakat } from './entities/calcul-zakat.entity';
import { CreateCalculZakatDto } from './dto/create-calcul-zakat.dto';

@Injectable()
export class ZakatService {
  constructor(
    @InjectRepository(CalculZakat)
    private repository: Repository<CalculZakat>,
  ) {}

  create(entrepriseId: string, dto: CreateCalculZakatDto): Promise<CalculZakat> {
    const calcul = this.repository.create({ entrepriseId, ...dto });
    return this.repository.save(calcul);
  }

  findAll(entrepriseId: string): Promise<CalculZakat[]> {
    return this.repository.find({ where: { entrepriseId }, order: { createdAt: 'DESC' } });
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const calcul = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!calcul) throw new NotFoundException('Calcul introuvable');
    await this.repository.remove(calcul);
  }
}
