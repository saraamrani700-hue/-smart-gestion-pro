import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParametresEntreprise } from './entities/parametres-entreprise.entity';

@Injectable()
export class AdministrationService {
  constructor(
    @InjectRepository(ParametresEntreprise)
    private parametresRepository: Repository<ParametresEntreprise>,
  ) {}

  async getParametres(entrepriseId: string): Promise<ParametresEntreprise> {
    let ligne = await this.parametresRepository.findOne({ where: { entrepriseId } });
    if (!ligne) {
      ligne = this.parametresRepository.create({ entrepriseId, parametres: {} });
      ligne = await this.parametresRepository.save(ligne);
    }
    return ligne;
  }

  async updateParametres(
    entrepriseId: string,
    nouveauxParametres: Record<string, unknown>,
  ): Promise<ParametresEntreprise> {
    const ligne = await this.getParametres(entrepriseId);
    ligne.parametres = { ...ligne.parametres, ...nouveauxParametres };
    return this.parametresRepository.save(ligne);
  }
}
