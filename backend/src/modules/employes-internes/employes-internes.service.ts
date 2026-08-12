import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeInterne } from './entities/employe-interne.entity';
import { CreateEmployeInterneDto } from './dto/create-employe-interne.dto';

@Injectable()
export class EmployesInternesService {
  constructor(
    @InjectRepository(EmployeInterne)
    private repository: Repository<EmployeInterne>,
  ) {}

  create(entrepriseId: string, dto: CreateEmployeInterneDto): Promise<EmployeInterne> {
    const employe = this.repository.create({ entrepriseId, ...dto });
    return this.repository.save(employe);
  }

  findAll(entrepriseId: string): Promise<EmployeInterne[]> {
    return this.repository.find({ where: { entrepriseId }, order: { createdAt: 'ASC' } });
  }

  async update(id: string, entrepriseId: string, dto: Partial<CreateEmployeInterneDto>): Promise<EmployeInterne> {
    const employe = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!employe) throw new NotFoundException('Collaborateur introuvable');
    Object.assign(employe, dto);
    return this.repository.save(employe);
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const employe = await this.repository.findOne({ where: { id, entrepriseId } });
    if (!employe) throw new NotFoundException('Collaborateur introuvable');
    await this.repository.remove(employe);
  }
}
