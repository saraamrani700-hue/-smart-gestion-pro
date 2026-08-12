import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class InstallerPluginDto {
  @IsNotEmpty()
  @IsString()
  codePlugin: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsObject()
  configuration?: Record<string, unknown>;
}
