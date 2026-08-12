import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { EntreprisesService } from './entreprises.service';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

@Controller('entreprises')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EntreprisesController {
  constructor(private readonly entreprisesService: EntreprisesService) {}

  @Get('moi')
  getMonEntreprise(@CurrentUser() user: AuthenticatedUser) {
    return this.entreprisesService.findById(user.entrepriseId);
  }

  @Patch('moi')
  @RequirePermissions('administration.gerer')
  updateMonEntreprise(@Body() dto: UpdateEntrepriseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.entreprisesService.update(user.entrepriseId, dto);
  }

  @Get('succursales')
  getSuccursales(@CurrentUser() user: AuthenticatedUser) {
    return this.entreprisesService.findSuccursales(user.entrepriseId);
  }

  @Post('succursales')
  @RequirePermissions('administration.gerer')
  createSuccursale(
    @Body() body: { nom: string; adresse?: string; telephone?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.entreprisesService.createSuccursale(user.entrepriseId, body);
  }
}
