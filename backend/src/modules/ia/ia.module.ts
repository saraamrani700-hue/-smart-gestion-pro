import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaPrevision } from './entities/ia-prevision.entity';
import { IaDocumentAnalyse } from './entities/ia-document-analyse.entity';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { UsersModule } from '../users/users.module';
import { Vente } from '../ventes/entities/vente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IaPrevision, IaDocumentAnalyse, Vente]), UsersModule],
  controllers: [IaController],
  providers: [IaService],
  exports: [IaService],
})
export class IaModule {}
