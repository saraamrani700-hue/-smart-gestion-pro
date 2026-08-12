import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PluginsService } from './plugins.service';
import { InstallerPluginDto } from './dto/installer-plugin.dto';

@Controller('plugins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get('catalogue')
  @RequirePermissions('plugins.lire')
  getCatalogue() {
    return this.pluginsService.getCatalogue();
  }

  @Post()
  @RequirePermissions('plugins.gerer')
  installer(@Body() dto: InstallerPluginDto, @CurrentUser() user: AuthenticatedUser) {
    return this.pluginsService.installer(user.entrepriseId, dto);
  }

  @Get()
  @RequirePermissions('plugins.lire')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.pluginsService.findAll(user.entrepriseId);
  }

  @Patch(':id/activer')
  @RequirePermissions('plugins.gerer')
  activer(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pluginsService.toggle(id, user.entrepriseId, true);
  }

  @Patch(':id/desactiver')
  @RequirePermissions('plugins.gerer')
  desactiver(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pluginsService.toggle(id, user.entrepriseId, false);
  }

  @Patch(':id/configuration')
  @RequirePermissions('plugins.gerer')
  updateConfiguration(
    @Param('id') id: string,
    @Body() configuration: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pluginsService.updateConfiguration(id, user.entrepriseId, configuration);
  }

  @Delete(':id')
  @RequirePermissions('plugins.gerer')
  desinstaller(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.pluginsService.desinstaller(id, user.entrepriseId);
  }
}
