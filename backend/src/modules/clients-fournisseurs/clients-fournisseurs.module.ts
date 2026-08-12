import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Fournisseur } from './entities/fournisseur.entity';
import { ClientsFournisseursService } from './clients-fournisseurs.service';
import { ClientsController, FournisseursController } from './clients-fournisseurs.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Fournisseur]), UsersModule],
  controllers: [ClientsController, FournisseursController],
  providers: [ClientsFournisseursService],
  exports: [ClientsFournisseursService],
})
export class ClientsFournisseursModule {}
