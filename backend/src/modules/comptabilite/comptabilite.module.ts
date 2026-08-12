import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompteComptable } from './entities/compte-comptable.entity';
import { EcritureComptable } from './entities/ecriture-comptable.entity';
import { DeclarationTva } from './entities/declaration-tva.entity';
import { ComptabiliteService } from './comptabilite.service';
import { ComptabiliteController } from './comptabilite.controller';
import { UsersModule } from '../users/users.module';
import { Vente } from '../ventes/entities/vente.entity';
import { Achat } from '../achats/entities/achat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompteComptable, EcritureComptable, DeclarationTva, Vente, Achat]),
    UsersModule,
  ],
  controllers: [ComptabiliteController],
  providers: [ComptabiliteService],
  exports: [ComptabiliteService],
})
export class ComptabiliteModule {}
