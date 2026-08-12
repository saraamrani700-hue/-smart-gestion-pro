import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @RequirePermissions('notifications.creer')
  create(@Body() dto: CreateNotificationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.create(user.entrepriseId, dto);
  }

  @Post('generer-alertes-stock')
  @RequirePermissions('notifications.creer')
  genererAlertesStock(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.genererAlertesStock(user.entrepriseId);
  }

  @Post('generer-alertes-cheques')
  @RequirePermissions('notifications.creer')
  genererAlertesCheques(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.genererAlertesCheques(user.entrepriseId);
  }

  @Post('generer-toutes-les-alertes')
  @RequirePermissions('notifications.creer')
  genererToutesLesAlertes(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.genererToutesLesAlertes(user.entrepriseId);
  }

  @Get()
  @RequirePermissions('notifications.lire')
  findAll(@Query('nonLues') nonLues: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findAllForEntreprise(user.entrepriseId, nonLues === 'true');
  }

  @Post(':id/lue')
  @RequirePermissions('notifications.lire')
  marquerLue(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.marquerLue(id, user.entrepriseId);
  }
}
