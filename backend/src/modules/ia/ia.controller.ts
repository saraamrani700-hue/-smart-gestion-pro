import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { IaService } from './ia.service';
import { PrevoirVentesDto } from './dto/prevoir-ventes.dto';
import { LireDocumentDto } from './dto/lire-document.dto';

@Controller('ia')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('previsions/ventes')
  @RequirePermissions('ia.utiliser')
  previsionVentes(@Body() dto: PrevoirVentesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.iaService.previsionVentes(user.entrepriseId, dto);
  }

  @Get('previsions')
  @RequirePermissions('ia.utiliser')
  findAllPrevisions(@CurrentUser() user: AuthenticatedUser) {
    return this.iaService.findAllPrevisions(user.entrepriseId);
  }

  @Post('ocr/lire-document')
  @RequirePermissions('ia.utiliser')
  lireDocument(@Body() dto: LireDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.iaService.lireDocument(user.entrepriseId, dto.imageBase64);
  }

  @Get('ocr/analyses')
  @RequirePermissions('ia.utiliser')
  findAllAnalyses(@CurrentUser() user: AuthenticatedUser) {
    return this.iaService.findAllAnalyses(user.entrepriseId);
  }
}
