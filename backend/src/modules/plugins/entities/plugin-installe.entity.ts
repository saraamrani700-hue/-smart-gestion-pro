import { Entity, Column, CreateDateColumn } from 'typeorm';
import { BaseTenantEntity } from '../../../common/entities/base-tenant.entity';

/**
 * Registre des plugins/integrations activables par entreprise (ex: un futur
 * connecteur TPE d'une banque precise, un connecteur DGI, un lecteur de
 * codes-barres specifique...). Ce module gere l'ACTIVATION/CONFIGURATION ;
 * le chargement dynamique reel du code du plugin est une etape ulterieure
 * qui dependra des plugins concrets a developper.
 */
@Entity('plugins_installes')
export class PluginInstalle extends BaseTenantEntity {
  @Column({ name: 'code_plugin' })
  codePlugin: string; // identifiant unique du plugin, ex: 'tpe_cih_bank'

  @Column({ nullable: true })
  version: string;

  @Column({ type: 'jsonb', default: {} })
  configuration: Record<string, unknown>;

  @Column({ default: true })
  actif: boolean;

  @CreateDateColumn({ name: 'installe_le' })
  installeLe: Date;
}
