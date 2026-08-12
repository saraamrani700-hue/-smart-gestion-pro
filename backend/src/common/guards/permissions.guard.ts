import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    // Aucune permission specifique requise sur cette route -> acces autorise
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifie');
    }

    const userPermissions = await this.usersService.getPermissionCodes(
      user.userId,
    );

    const aAccess = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!aAccess) {
      throw new ForbiddenException(
        'Permissions insuffisantes pour effectuer cette action',
      );
    }

    return true;
  }
}
