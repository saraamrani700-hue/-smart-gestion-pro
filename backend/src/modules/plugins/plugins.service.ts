import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PluginInstalle } from './entities/plugin-installe.entity';
import { InstallerPluginDto } from './dto/installer-plugin.dto';

// Catalogue des plugins reconnus par le systeme (a etendre au fur et a
// mesure que de vrais connecteurs sont developpes : banques, DGI, scanners...)
export const CATALOGUE_PLUGINS = [
  { code: 'tpe_manuel', nom: 'Saisie manuelle TPE', description: 'Deja actif par defaut (module Paiements)' },
  { code: 'scanner_code_barre', nom: 'Scanner de codes-barres', description: 'Lecture via douchette USB/Bluetooth' },
  { code: 'imprimante_ticket', nom: 'Imprimante de tickets', description: 'Impression des recus de caisse' },
  { code: 'rapprochement_bancaire', nom: 'Rapprochement bancaire automatique', description: 'Necessite un API bancaire reel' },
];

@Injectable()
export class PluginsService {
  constructor(
    @InjectRepository(PluginInstalle)
    private pluginsRepository: Repository<PluginInstalle>,
  ) {}

  getCatalogue() {
    return CATALOGUE_PLUGINS;
  }

  async installer(entrepriseId: string, dto: InstallerPluginDto): Promise<PluginInstalle> {
    const existant = await this.pluginsRepository.findOne({
      where: { entrepriseId, codePlugin: dto.codePlugin },
    });
    if (existant) {
      throw new ConflictException('Ce plugin est deja installe pour cette entreprise');
    }

    const plugin = this.pluginsRepository.create({ entrepriseId, ...dto });
    return this.pluginsRepository.save(plugin);
  }

  findAll(entrepriseId: string): Promise<PluginInstalle[]> {
    return this.pluginsRepository.find({ where: { entrepriseId } });
  }

  async toggle(id: string, entrepriseId: string, actif: boolean): Promise<PluginInstalle> {
    const plugin = await this.pluginsRepository.findOne({ where: { id, entrepriseId } });
    if (!plugin) throw new NotFoundException('Plugin introuvable');
    plugin.actif = actif;
    return this.pluginsRepository.save(plugin);
  }

  async updateConfiguration(
    id: string,
    entrepriseId: string,
    configuration: Record<string, unknown>,
  ): Promise<PluginInstalle> {
    const plugin = await this.pluginsRepository.findOne({ where: { id, entrepriseId } });
    if (!plugin) throw new NotFoundException('Plugin introuvable');
    plugin.configuration = { ...plugin.configuration, ...configuration };
    return this.pluginsRepository.save(plugin);
  }

  async desinstaller(id: string, entrepriseId: string): Promise<void> {
    const plugin = await this.pluginsRepository.findOne({ where: { id, entrepriseId } });
    if (!plugin) throw new NotFoundException('Plugin introuvable');
    await this.pluginsRepository.remove(plugin);
  }
}
