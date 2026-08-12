import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { BibliothequeService } from './bibliotheque.service';
import { SaveDonneesDto } from './dto/save-donnees.dto';

/**
 * Equivalent web des appels IPC Electron "erp:load-data" / "erp:save-data"
 * de l'application d'origine, avec verrouillage optimiste (voir le service)
 * pour un comportement multi-utilisateur sur, comme un vrai serveur.
 */
@Controller('bibliotheque')
@UseGuards(JwtAuthGuard)
export class BibliothequeController {
  constructor(private readonly service: BibliothequeService) {}

  @Get('data')
  async charger(@CurrentUser() user: AuthenticatedUser) {
    return this.service.charger(user.entrepriseId);
  }

  @Put('data')
  async sauvegarder(@Body() dto: SaveDonneesDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.sauvegarder(user.entrepriseId, dto.donnees, dto.version);
  }
}
