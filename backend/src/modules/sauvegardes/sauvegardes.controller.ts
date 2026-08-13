import { Controller, Get, Post, Param, Res, NotFoundException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
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

  @Get(':id/telecharger')
  @RequirePermissions('sauvegardes.lire')
  async telecharger(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser, @Res() res: Response) {
    const sauvegarde = await this.sauvegardesService.findOne(id, user.entrepriseId);
    if (!sauvegarde || !sauvegarde.fichierUrl || !existsSync(sauvegarde.fichierUrl)) {
      throw new NotFoundException(
        "Ce fichier de sauvegarde n'est plus disponible sur le serveur (le conteneur a peut-etre redemarre depuis). Declenchez une nouvelle sauvegarde.",
      );
    }
    res.download(sauvegarde.fichierUrl);
  }
}
