import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achat } from './entities/achat.entity';
import { LigneAchat } from './entities/ligne-achat.entity';
import { AchatsService } from './achats.service';
import { AchatsController } from './achats.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Achat, LigneAchat]), UsersModule],
  controllers: [AchatsController],
  providers: [AchatsService],
  exports: [AchatsService],
})
export class AchatsModule {}
