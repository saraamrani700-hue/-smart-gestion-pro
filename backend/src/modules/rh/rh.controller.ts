import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { RhService } from './rh.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { CreateCongeDto } from './dto/create-conge.dto';
import { CreateFichePaieDto } from './dto/create-fiche-paie.dto';

@Controller('rh')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RhController {
  constructor(private readonly rhService: RhService) {}

  @Post('employes')
  @RequirePermissions('rh.gerer')
  createEmploye(@Body() dto: CreateEmployeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.createEmploye(user.entrepriseId, dto);
  }

  @Get('employes')
  @RequirePermissions('rh.lire')
  findAllEmployes(@CurrentUser() user: AuthenticatedUser) {
    return this.rhService.findAllEmployes(user.entrepriseId);
  }

  @Get('employes/:id')
  @RequirePermissions('rh.lire')
  findOneEmploye(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.findOneEmploye(id, user.entrepriseId);
  }

  @Post('conges')
  @RequirePermissions('rh.gerer')
  createConge(@Body() dto: CreateCongeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.createConge(user.entrepriseId, dto);
  }

  @Get('conges')
  @RequirePermissions('rh.lire')
  findAllConges(@CurrentUser() user: AuthenticatedUser) {
    return this.rhService.findAllConges(user.entrepriseId);
  }

  @Patch('conges/:id/approuver')
  @RequirePermissions('rh.gerer')
  approuverConge(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.traiterConge(id, user.entrepriseId, true);
  }

  @Patch('conges/:id/refuser')
  @RequirePermissions('rh.gerer')
  refuserConge(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.traiterConge(id, user.entrepriseId, false);
  }

  @Post('paie')
  @RequirePermissions('rh.gerer')
  createFichePaie(@Body() dto: CreateFichePaieDto, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.createFichePaie(user.entrepriseId, dto);
  }

  @Get('paie')
  @RequirePermissions('rh.lire')
  findAllFichesPaie(@Query('employeId') employeId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.rhService.findAllFichesPaie(user.entrepriseId, employeId);
  }
}
