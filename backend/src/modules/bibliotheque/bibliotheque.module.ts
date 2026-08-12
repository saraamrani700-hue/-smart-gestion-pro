import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BibliothequeDonnees } from './entities/bibliotheque-donnees.entity';
import { BibliothequeService } from './bibliotheque.service';
import { BibliothequeController } from './bibliotheque.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BibliothequeDonnees])],
  controllers: [BibliothequeController],
  providers: [BibliothequeService],
  exports: [BibliothequeService],
})
export class BibliothequeModule {}
