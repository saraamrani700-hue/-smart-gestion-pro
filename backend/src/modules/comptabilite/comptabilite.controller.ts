import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ComptabiliteService } from './comptabilite.service';
import { CreateCompteDto } from './dto/create-compte.dto';
import { CalculerTvaDto } from './dto/calculer-tva.dto';

@Controller('comptabilite')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComptabiliteController {
  constructor(private readonly comptabiliteService: ComptabiliteService) {}

  @Post('plan-comptable/initialiser')
  @RequirePermissions('comptabilite.gerer')
  initialiser(@CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.initialiserPlanComptable(user.entrepriseId);
  }

  @Post('plan-comptable')
  @RequirePermissions('comptabilite.gerer')
  createCompte(@Body() dto: CreateCompteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.createCompte(user.entrepriseId, dto);
  }

  @Get('plan-comptable')
  @RequirePermissions('comptabilite.lire')
  findAllComptes(@CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.findAllComptes(user.entrepriseId);
  }

  @Post('ventes/:venteId/ecriture')
  @RequirePermissions('comptabilite.gerer')
  genererEcritureVente(@Param('venteId') venteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.genererEcritureVente(venteId, user.entrepriseId);
  }

  @Post('achats/:achatId/ecriture')
  @RequirePermissions('comptabilite.gerer')
  genererEcritureAchat(@Param('achatId') achatId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.genererEcritureAchat(achatId, user.entrepriseId);
  }

  @Get('ecritures')
  @RequirePermissions('comptabilite.lire')
  findAllEcritures(@CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.findAllEcritures(user.entrepriseId);
  }

  @Post('tva/calculer')
  @RequirePermissions('comptabilite.gerer')
  calculerTva(@Body() dto: CalculerTvaDto, @CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.calculerDeclarationTva(user.entrepriseId, dto);
  }

  @Get('tva')
  @RequirePermissions('comptabilite.lire')
  findAllDeclarations(@CurrentUser() user: AuthenticatedUser) {
    return this.comptabiliteService.findAllDeclarations(user.entrepriseId);
  }
}
