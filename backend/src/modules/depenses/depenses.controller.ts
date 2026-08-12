import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DepensesService } from './depenses.service';
import { CreateDepenseDto } from './dto/create-depense.dto';

@Controller('depenses')
@UseGuards(JwtAuthGuard)
export class DepensesController {
  constructor(private readonly service: DepensesService) {}

  @Post()
  create(@Body() dto: CreateDepenseDto, @CurrentUser() user: AuthenticatedUser) {
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
