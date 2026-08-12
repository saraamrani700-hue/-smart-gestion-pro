import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BonsCommandeService } from './bons-commande.service';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';

@Controller('bons-commande')
@UseGuards(JwtAuthGuard)
export class BonsCommandeController {
  constructor(private readonly service: BonsCommandeService) {}

  @Post()
  create(@Body() dto: CreateBonCommandeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.entrepriseId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.entrepriseId);
  }

  @Patch(':id/recu')
  marquerRecu(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.marquerRecu(id, user.entrepriseId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.entrepriseId);
  }
}
