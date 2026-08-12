import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParametresEntreprise } from './entities/parametres-entreprise.entity';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParametresEntreprise]), UsersModule],
  controllers: [AdministrationController],
  providers: [AdministrationService],
  exports: [AdministrationService],
})
export class AdministrationModule {}
