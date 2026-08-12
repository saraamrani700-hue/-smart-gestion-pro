import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { TypeNotification } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(TypeNotification)
  type?: TypeNotification;
}
