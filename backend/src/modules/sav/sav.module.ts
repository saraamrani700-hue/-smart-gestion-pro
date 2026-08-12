import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketSav } from './entities/ticket-sav.entity';
import { CommentaireTicket } from './entities/commentaire-ticket.entity';
import { SavService } from './sav.service';
import { SavController } from './sav.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([TicketSav, CommentaireTicket]), UsersModule],
  controllers: [SavController],
  providers: [SavService],
  exports: [SavService],
})
export class SavModule {}
