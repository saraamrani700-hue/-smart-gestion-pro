import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sauvegarde } from './entities/sauvegarde.entity';
import { SauvegardesService } from './sauvegardes.service';
import { SauvegardesController } from './sauvegardes.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Sauvegarde]), UsersModule],
  controllers: [SauvegardesController],
  providers: [SauvegardesService],
  exports: [SauvegardesService],
})
export class SauvegardesModule {}
