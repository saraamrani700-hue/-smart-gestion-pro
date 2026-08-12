import { IsNotEmpty, IsString } from 'class-validator';

export class LireDocumentDto {
  // Image encodee en base64 (avec ou sans prefixe data:image/...;base64,)
  @IsNotEmpty()
  @IsString()
  imageBase64: string;
}
