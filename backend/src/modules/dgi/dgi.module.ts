import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactureElectronique } from './entities/facture-electronique.entity';
import { DgiService } from './dgi.service';
import { DgiController } from './dgi.controller';
import { UsersModule } from '../users/users.module';
import { DocumentCommercial } from '../facturation/entities/document-commercial.entity';
import { Entreprise } from '../entreprises/entities/entreprise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FactureElectronique, DocumentCommercial, Entreprise]),
    UsersModule,
  ],
  controllers: [DgiController],
  providers: [DgiService],
  exports: [DgiService],
})
export class DgiModule {}
