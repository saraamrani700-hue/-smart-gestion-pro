import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AdministrationService } from './administration.service';
import { UpdateParametresDto } from './dto/update-parametres.dto';

@Controller('administration')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdministrationController {
  constructor(private readonly administrationService: AdministrationService) {}

  @Get('parametres')
  @RequirePermissions('administration.lire')
  getParametres(@CurrentUser() user: AuthenticatedUser) {
    return this.administrationService.getParametres(user.entrepriseId);
  }

  @Patch('parametres')
  @RequirePermissions('administration.gerer')
  updateParametres(@Body() dto: UpdateParametresDto, @CurrentUser() user: AuthenticatedUser) {
    return this.administrationService.updateParametres(user.entrepriseId, dto.parametres);
  }
}
