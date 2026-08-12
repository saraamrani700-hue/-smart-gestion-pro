import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produit } from './entities/produit.entity';
import { Categorie } from './entities/categorie.entity';
import { UniteMesure } from './entities/unite-mesure.entity';
import { Stock } from './entities/stock.entity';
import { MouvementStock } from './entities/mouvement-stock.entity';
import { ProduitsService } from './produits.service';
import { ProduitsController } from './produits.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produit, Categorie, UniteMesure, Stock, MouvementStock]),
    UsersModule,
  ],
  controllers: [ProduitsController],
  providers: [ProduitsService],
  exports: [ProduitsService],
})
export class ProduitsModule {}
