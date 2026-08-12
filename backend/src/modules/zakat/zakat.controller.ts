import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ZakatService } from './zakat.service';
import { CreateCalculZakatDto } from './dto/create-calcul-zakat.dto';

@Controller('zakat')
@UseGuards(JwtAuthGuard)
export class ZakatController {
  constructor(private readonly service: ZakatService) {}

  @Post()
  create(@Body() dto: CreateCalculZakatDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.entrepriseId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.entrepriseId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.entrepriseId);
  }
}
