import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SauvegardesService } from './sauvegardes.service';

@Controller('sauvegardes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SauvegardesController {
  constructor(private readonly sauvegardesService: SauvegardesService) {}

  @Post()
  @RequirePermissions('sauvegardes.gerer')
  creerSauvegarde(@CurrentUser() user: AuthenticatedUser) {
    return this.sauvegardesService.creerSauvegarde(user.entrepriseId);
  }

  @Get()
  @RequirePermissions('sauvegardes.lire')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.sauvegardesService.findAll(user.entrepriseId);
  }
}
