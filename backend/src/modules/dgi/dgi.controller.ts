import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DgiService } from './dgi.service';
import { GenererStructureDgiDto } from './dto/generer-structure-dgi.dto';

@Controller('dgi')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DgiController {
  constructor(private readonly dgiService: DgiService) {}

  @Post('structure')
  @RequirePermissions('dgi.gerer')
  genererStructure(@Body() dto: GenererStructureDgiDto, @CurrentUser() user: AuthenticatedUser) {
    return this.dgiService.genererStructure(dto.documentId, user.entrepriseId);
  }

  @Post('envoyer/:documentId')
  @RequirePermissions('dgi.gerer')
  envoyer(@Param('documentId') documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.dgiService.envoyerADgi(documentId, user.entrepriseId);
  }

  @Get()
  @RequirePermissions('dgi.lire')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.dgiService.findAll(user.entrepriseId);
  }

  @Get(':documentId')
  @RequirePermissions('dgi.lire')
  findOne(@Param('documentId') documentId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.dgiService.findOne(documentId, user.entrepriseId);
  }
}
