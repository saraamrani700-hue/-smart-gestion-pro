import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { FacturationService } from './facturation.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ConvertirDocumentDto } from './dto/convertir-document.dto';
import { TypeDocumentCommercial } from './entities/document-commercial.entity';

@Controller('facturation')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  @Post('documents')
  @RequirePermissions('facturation.create')
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.create(user.entrepriseId, dto);
  }

  @Get('documents')
  @RequirePermissions('facturation.read')
  findAll(@Query('type') type: TypeDocumentCommercial, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.findAll(user.entrepriseId, type);
  }

  @Get('documents/:id')
  @RequirePermissions('facturation.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.findOne(id, user.entrepriseId);
  }

  @Post('documents/:id/convertir')
  @RequirePermissions('facturation.create')
  convertir(
    @Param('id') id: string,
    @Body() dto: ConvertirDocumentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.facturationService.convertir(id, user.entrepriseId, dto.nouveauType);
  }

  @Post('documents/:id/annuler')
  @RequirePermissions('facturation.create')
  annuler(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.annuler(id, user.entrepriseId);
  }

  @Delete('documents/:id')
  @RequirePermissions('facturation.create')
  supprimer(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.supprimer(id, user.entrepriseId);
  }

  @Post('ventes/:venteId/generer-facture')
  @RequirePermissions('facturation.create')
  genererDepuisVente(@Param('venteId') venteId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.facturationService.genererFactureDepuisVente(venteId, user.entrepriseId);
  }

  @Post('import-excel')
  @RequirePermissions('facturation.create')
  @UseInterceptors(FileInterceptor('fichier'))
  importerExcel(
    @UploadedFile() fichier: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!fichier) {
      throw new BadRequestException('Aucun fichier recu (champ "fichier" attendu).');
    }
    return this.facturationService.importerDepuisExcel(user.entrepriseId, fichier.buffer);
  }
}
