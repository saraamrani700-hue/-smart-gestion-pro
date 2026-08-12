import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RappelFiscal } from './entities/rappel-fiscal.entity';
import { CreateRappelFiscalDto, UpdateRappelFiscalDto } from './dto/create-rappel-fiscal.dto';

@Injectable()
export class CalendrierFiscalService {
  constructor(
    @InjectRepository(RappelFiscal)
    private repository: Repository<RappelFiscal>,
  ) {}

  create(entrepriseId: string, dto: CreateRappelFiscalDto): Promise<RappelFiscal> {
    const rappel = this.repository.create({ entrepriseId, ...dto });
    return this.repository.save(rappel);
  }

  findAll(entrepriseId: string): Promise<RappelFiscal[]> {
    return this.repository.find({ where: { entrepriseId }, order: { dateEcheance: 'ASC' } });
  }

  async update(id: string, entrepriseId: string, dto: UpdateRappelFiscalDto): Promise<RappelFiscal> {
    const rappel = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!rappel) throw new NotFoundException('Rappel introuvable');
    Object.assign(rappel, dto);
    return this.repository.save(rappel);
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const rappel = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!rappel) throw new NotFoundException('Rappel introuvable');
    await this.repository.remove(rappel);
  }
}
