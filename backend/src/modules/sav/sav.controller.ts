import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SavService } from './sav.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddCommentaireDto } from './dto/add-commentaire.dto';
import { UpdateStatutTicketDto } from './dto/update-statut-ticket.dto';
import { StatutTicket } from './entities/ticket-sav.entity';

@Controller('sav')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SavController {
  constructor(private readonly savService: SavService) {}

  @Post('tickets')
  @RequirePermissions('sav.gerer')
  create(@Body() dto: CreateTicketDto, @CurrentUser() user: AuthenticatedUser) {
    return this.savService.createTicket(user.entrepriseId, dto);
  }

  @Get('tickets')
  @RequirePermissions('sav.lire')
  findAll(@Query('statut') statut: StatutTicket, @CurrentUser() user: AuthenticatedUser) {
    return this.savService.findAllTickets(user.entrepriseId, statut);
  }

  @Get('tickets/:id')
  @RequirePermissions('sav.lire')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.savService.findOneTicket(id, user.entrepriseId);
  }

  @Patch('tickets/:id/statut')
  @RequirePermissions('sav.gerer')
  updateStatut(
    @Param('id') id: string,
    @Body() dto: UpdateStatutTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.savService.updateStatut(id, user.entrepriseId, dto.statut);
  }

  @Patch('tickets/:id/assigner')
  @RequirePermissions('sav.gerer')
  assigner(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.savService.assigner(id, user.entrepriseId, user.userId);
  }

  @Post('tickets/:id/commentaires')
  @RequirePermissions('sav.gerer')
  ajouterCommentaire(
    @Param('id') id: string,
    @Body() dto: AddCommentaireDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.savService.ajouterCommentaire(id, user.entrepriseId, user.userId, dto.message);
  }

  @Get('tickets/:id/commentaires')
  @RequirePermissions('sav.lire')
  getCommentaires(@Param('id') id: string) {
    return this.savService.getCommentaires(id);
  }
}
