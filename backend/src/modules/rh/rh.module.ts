import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employe } from './entities/employe.entity';
import { Conge } from './entities/conge.entity';
import { FichePaie } from './entities/fiche-paie.entity';
import { RhService } from './rh.service';
import { RhController } from './rh.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Employe, Conge, FichePaie]), UsersModule],
  controllers: [RhController],
  providers: [RhService],
  exports: [RhService],
})
export class RhModule {}
