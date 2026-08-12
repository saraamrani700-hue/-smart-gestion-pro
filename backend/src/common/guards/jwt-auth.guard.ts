import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protege une route : l'utilisateur doit envoyer un token JWT valide
 * dans le header "Authorization: Bearer <token>".
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
