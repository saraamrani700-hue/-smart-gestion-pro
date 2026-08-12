import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ProduitsService } from './produits.service';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { AjusterStockDto } from './dto/ajuster-stock.dto';
import { TypeProduit } from './entities/produit.entity';

@Controller('produits')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProduitsController {
  constructor(private readonly produitsService: ProduitsService) {}

  @Post()
  @RequirePermissions('produits.create')
  create(@Body() dto: CreateProduitDto, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.create(user.entrepriseId, dto);
  }

  @Get()
  @RequirePermissions('produits.read')
  findAll(@Query('type') type: TypeProduit, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.findAll(user.entrepriseId, type);
  }

  @Get('alertes')
  @RequirePermissions('produits.read')
  getAlertes(@CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.getProduitsEnAlerte(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('produits.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.findOne(id, user.entrepriseId);
  }

  @Patch(':id')
  @RequirePermissions('produits.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProduitDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.produitsService.update(id, user.entrepriseId, dto);
  }

  @Delete(':id')
  @RequirePermissions('produits.delete')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.remove(id, user.entrepriseId);
  }

  @Get(':id/stock')
  @RequirePermissions('stock.read')
  getStock(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.getStockProduit(id, user.entrepriseId);
  }

  @Post('stock/ajuster')
  @RequirePermissions('stock.ajuster')
  ajusterStock(@Body() dto: AjusterStockDto, @CurrentUser() user: AuthenticatedUser) {
    return this.produitsService.ajusterStock(user.entrepriseId, user.userId, dto);
  }

  @Get('stock/mouvements')
  @RequirePermissions('stock.read')
  getMouvements(
    @CurrentUser() user: AuthenticatedUser,
    @Query('produitId') produitId?: string,
  ) {
    return this.produitsService.getHistoriqueMouvements(user.entrepriseId, produitId);
  }
}
