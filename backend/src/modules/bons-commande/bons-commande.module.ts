import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BonCommande } from './entities/bon-commande.entity';
import { LigneBonCommande } from './entities/ligne-bon-commande.entity';
import { BonsCommandeService } from './bons-commande.service';
import { BonsCommandeController } from './bons-commande.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BonCommande, LigneBonCommande])],
  controllers: [BonsCommandeController],
  providers: [BonsCommandeService],
  exports: [BonsCommandeService],
})
export class BonsCommandeModule {}
