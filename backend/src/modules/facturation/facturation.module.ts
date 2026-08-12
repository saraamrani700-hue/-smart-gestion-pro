import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentCommercial } from './entities/document-commercial.entity';
import { LigneDocument } from './entities/ligne-document.entity';
import { FacturationService } from './facturation.service';
import { FacturationController } from './facturation.controller';
import { UsersModule } from '../users/users.module';
import { Vente } from '../ventes/entities/vente.entity';
import { Client } from '../clients-fournisseurs/entities/client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentCommercial, LigneDocument, Vente, Client]),
    UsersModule,
  ],
  controllers: [FacturationController],
  providers: [FacturationService],
  exports: [FacturationService],
})
export class FacturationModule {}
