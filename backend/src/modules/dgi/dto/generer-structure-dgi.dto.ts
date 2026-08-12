import { IsUUID } from 'class-validator';

export class GenererStructureDgiDto {
  @IsUUID()
  documentId: string; // id du DocumentCommercial de type "facture"
}
