import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { EmployesInternesService } from './employes-internes.service';
import { CreateEmployeInterneDto } from './dto/create-employe-interne.dto';

@Controller('employes-internes')
@UseGuards(JwtAuthGuard)
export class EmployesInternesController {
  constructor(private readonly service: EmployesInternesService) {}

  @Post()
  create(@Body() dto: CreateEmployeInterneDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(user.entrepriseId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findAll(user.entrepriseId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateEmployeInterneDto>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, user.entrepriseId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.service.remove(id, user.entrepriseId);
  }
}
