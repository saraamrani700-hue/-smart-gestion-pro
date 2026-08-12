import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // userId
  entrepriseId: string;
  succursaleId: string | null;
  roleId: string | null;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'change_this_secret_in_production',
    });
  }

  async validate(payload: JwtPayload) {
    // Ce qui est retourne ici devient request.user, disponible via @CurrentUser()
    // et utilise par le TenantGuard pour isoler les donnees par entreprise.
    return {
      userId: payload.sub,
      entrepriseId: payload.entrepriseId,
      succursaleId: payload.succursaleId,
      roleId: payload.roleId,
      email: payload.email,
    };
  }
}
