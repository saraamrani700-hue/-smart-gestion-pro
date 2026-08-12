import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paiement } from './entities/paiement.entity';
import { CompteBancaire } from './entities/compte-bancaire.entity';
import { Cheque } from './entities/cheque.entity';
import { PaiementsService } from './paiements.service';
import { PaiementsController } from './paiements.controller';
import { UsersModule } from '../users/users.module';
import { Vente } from '../ventes/entities/vente.entity';
import { Achat } from '../achats/entities/achat.entity';
import { Client } from '../clients-fournisseurs/entities/client.entity';
import { Fournisseur } from '../clients-fournisseurs/entities/fournisseur.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paiement, CompteBancaire, Cheque, Vente, Achat, Client, Fournisseur]),
    UsersModule,
  ],
  controllers: [PaiementsController],
  providers: [PaiementsService],
  exports: [PaiementsService],
})
export class PaiementsModule {}
