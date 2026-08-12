import { IsEnum } from 'class-validator';
import { TypeDocumentCommercial } from '../entities/document-commercial.entity';

export class ConvertirDocumentDto {
  @IsEnum(TypeDocumentCommercial)
  nouveauType: TypeDocumentCommercial;
}
