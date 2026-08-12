import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vente } from './entities/vente.entity';
import { LigneVente } from './entities/ligne-vente.entity';
import { VentesService } from './ventes.service';
import { VentesController } from './ventes.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vente, LigneVente]), UsersModule],
  controllers: [VentesController],
  providers: [VentesService],
  exports: [VentesService],
})
export class VentesModule {}
