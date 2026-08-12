import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { PaiementsService } from './paiements.service';
import { CreatePaiementDto } from './dto/create-paiement.dto';
import { CreateChequeDto } from './dto/create-cheque.dto';
import { TypeDocumentPaiement } from './entities/paiement.entity';

@Controller('paiements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post()
  @RequirePermissions('paiements.create')
  create(@Body() dto: CreatePaiementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.create(user.entrepriseId, user.userId, dto);
  }

  @Post('rembourser')
  @RequirePermissions('paiements.rembourser')
  rembourser(@Body() dto: CreatePaiementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.rembourser(user.entrepriseId, user.userId, dto);
  }

  @Get()
  @RequirePermissions('paiements.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.findAll(user.entrepriseId);
  }

  @Get('document/:type/:id')
  @RequirePermissions('paiements.read')
  findByDocument(
    @Param('type') type: TypeDocumentPaiement,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paiementsService.findByDocument(user.entrepriseId, type, id);
  }

  @Get('dashboard')
  @RequirePermissions('paiements.read')
  dashboard(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const dateDebut = debut ? new Date(debut) : new Date(new Date().setDate(1));
    const dateFin = fin ? new Date(fin) : new Date();
    return this.paiementsService.dashboard(user.entrepriseId, dateDebut, dateFin);
  }

  // -------------------- Comptes bancaires --------------------

  @Post('comptes-bancaires')
  @RequirePermissions('banques.create')
  createCompte(
    @Body() body: { banque: string; rib?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.paiementsService.createCompte(user.entrepriseId, body);
  }

  @Get('comptes-bancaires')
  @RequirePermissions('banques.read')
  findAllComptes(@CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.findAllComptes(user.entrepriseId);
  }

  // -------------------- Cheques --------------------

  @Post('cheques')
  @RequirePermissions('cheques.create')
  createCheque(@Body() dto: CreateChequeDto, @CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.createCheque(user.entrepriseId, dto);
  }

  @Get('cheques')
  @RequirePermissions('cheques.read')
  findAllCheques(@CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.findAllCheques(user.entrepriseId);
  }

  @Post('cheques/:id/encaisser')
  @RequirePermissions('cheques.encaisser')
  encaisserCheque(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.encaisserCheque(id, user.entrepriseId);
  }

  @Post('cheques/:id/rejeter')
  @RequirePermissions('cheques.encaisser')
  rejeterCheque(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.paiementsService.rejeterCheque(id, user.entrepriseId);
  }
}
