import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entreprise } from './entities/entreprise.entity';
import { Succursale } from './entities/succursale.entity';
import { EntreprisesService } from './entreprises.service';
import { EntreprisesController } from './entreprises.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Entreprise, Succursale]), UsersModule],
  controllers: [EntreprisesController],
  providers: [EntreprisesService],
  exports: [EntreprisesService],
})
export class EntreprisesModule {}
