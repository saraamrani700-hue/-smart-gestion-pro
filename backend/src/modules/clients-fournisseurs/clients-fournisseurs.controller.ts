import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ClientsFournisseursService } from './clients-fournisseurs.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsFournisseursService) {}

  @Post()
  @RequirePermissions('clients.create')
  create(@Body() dto: CreateClientDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createClient(user.entrepriseId, dto);
  }

  @Get()
  @RequirePermissions('clients.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAllClients(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('clients.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOneClient(id, user.entrepriseId);
  }

  @Patch(':id')
  @RequirePermissions('clients.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateClient(id, user.entrepriseId, dto);
  }

  @Delete(':id')
  @RequirePermissions('clients.delete')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.removeClient(id, user.entrepriseId);
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('fournisseurs')
export class FournisseursController {
  constructor(private readonly service: ClientsFournisseursService) {}

  @Post()
  @RequirePermissions('fournisseurs.create')
  create(@Body() dto: CreateFournisseurDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.createFournisseur(user.entrepriseId, dto);
  }

  @Get()
  @RequirePermissions('fournisseurs.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAllFournisseurs(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('fournisseurs.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.findOneFournisseur(id, user.entrepriseId);
  }

  @Patch(':id')
  @RequirePermissions('fournisseurs.update')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFournisseurDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.updateFournisseur(id, user.entrepriseId, dto);
  }

  @Delete(':id')
  @RequirePermissions('fournisseurs.delete')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.removeFournisseur(id, user.entrepriseId);
  }
}
