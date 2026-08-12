import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AchatsService } from './achats.service';
import { CreateAchatDto } from './dto/create-achat.dto';

@Controller('achats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AchatsController {
  constructor(private readonly achatsService: AchatsService) {}

  @Post()
  @RequirePermissions('achats.create')
  create(@Body() dto: CreateAchatDto, @CurrentUser() user: AuthenticatedUser) {
    return this.achatsService.create(user.entrepriseId, user.userId, dto);
  }

  @Get()
  @RequirePermissions('achats.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.achatsService.findAll(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('achats.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.achatsService.findOne(id, user.entrepriseId);
  }

  @Post(':id/annuler')
  @RequirePermissions('achats.create')
  annuler(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.achatsService.annuler(id, user.entrepriseId, user.userId);
  }
}
