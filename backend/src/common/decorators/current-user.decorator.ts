import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  userId: string;
  entrepriseId: string;
  succursaleId: string | null;
  roleId: string | null;
  email: string;
}

/**
 * Usage dans un controller : @CurrentUser() user: AuthenticatedUser
 * Le JwtStrategy attache ces informations a request.user apres validation du token.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
