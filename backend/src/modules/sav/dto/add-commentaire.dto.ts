import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentaireDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
