import { IsObject } from 'class-validator';

export class UpdateParametresDto {
  @IsObject()
  parametres: Record<string, unknown>;
}
