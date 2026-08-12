import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  findAll(@CurrentUser() user: AuthenticatedUser) {
    // Isolation multi-tenant : on ne retourne jamais que les utilisateurs
    // de l'entreprise du token courant.
    return this.usersService.findAllByEntreprise(user.entrepriseId);
  }

  @Get('roles')
  @RequirePermissions('users.read')
  findAllRoles(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findAllRoles(user.entrepriseId);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(id, user.entrepriseId);
  }

  @Post()
  @RequirePermissions('users.create')
  create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthenticatedUser) {
    return this.usersService.create(user.entrepriseId, dto);
  }
}
