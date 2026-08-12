import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersModule } from '../users/users.module';
import { ProduitsModule } from '../produits/produits.module';
import { Cheque } from '../paiements/entities/cheque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Cheque]), UsersModule, ProduitsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
