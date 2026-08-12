import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { VentesService } from './ventes.service';
import { CreateVenteDto } from './dto/create-vente.dto';

@Controller('ventes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class VentesController {
  constructor(private readonly ventesService: VentesService) {}

  @Post()
  @RequirePermissions('ventes.create')
  create(@Body() dto: CreateVenteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.ventesService.create(user.entrepriseId, user.userId, dto);
  }

  @Get()
  @RequirePermissions('ventes.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ventesService.findAll(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('ventes.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ventesService.findOne(id, user.entrepriseId);
  }

  @Post(':id/annuler')
  @RequirePermissions('ventes.annuler')
  annuler(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.ventesService.annuler(id, user.entrepriseId, user.userId);
  }
}
