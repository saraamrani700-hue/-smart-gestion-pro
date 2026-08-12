import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateFichePaieDto {
  @IsUUID()
  employeId: string;

  @IsNotEmpty()
  @IsString()
  periode: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  primes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;
}
