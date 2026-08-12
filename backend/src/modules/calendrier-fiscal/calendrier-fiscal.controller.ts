import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CalendrierFiscalService } from './calendrier-fiscal.service';
import { CreateRappelFiscalDto, UpdateRappelFiscalDto } from './dto/create-rappel-fiscal.dto';

@Controller('calendrier-fiscal')
@UseGuards(JwtAuthGuard)
export class CalendrierFiscalController {
  constructor(private readonly service: CalendrierFiscalService) {}

  @Post()
  create(@Body() dto: CreateRappelFiscalDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.entrepriseId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.entrepriseId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRappelFiscalDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.update(id, user.entrepriseId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.entrepriseId);
  }
}
