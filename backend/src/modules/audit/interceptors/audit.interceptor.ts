import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../audit.service';

const METHODES_AUDITEES = ['POST', 'PATCH', 'PUT', 'DELETE'];

/**
 * Journalise automatiquement toute action de modification (creation,
 * mise a jour, suppression) effectuee via l'API, avec l'utilisateur,
 * l'entreprise, la route appelee et le corps de la requete.
 * Ne bloque jamais la requete metier meme si l'ecriture de l'audit echoue.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (!METHODES_AUDITEES.includes(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const user = request.user;
        void this.auditService.enregistrer({
          entrepriseId: user?.entrepriseId ?? null,
          userId: user?.userId ?? null,
          action: `${request.method} ${request.route?.path ?? request.url}`,
          donnees: this.assainir(request.body),
          ipAdresse: request.ip,
        });
      }),
    );
  }

  // Retire les champs sensibles avant stockage (mot de passe, tokens...)
  private assainir(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const copie = { ...(body as Record<string, unknown>) };
    delete copie.motDePasse;
    delete copie.password;
    delete copie.accessToken;
    return copie;
  }
}
