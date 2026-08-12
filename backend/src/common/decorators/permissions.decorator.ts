import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Usage : @RequirePermissions('produits.create', 'produits.update')
 * Verifie via PermissionsGuard que l'utilisateur connecte possede bien
 * les permissions listees (cf. Article 1 - Gestion des Utilisateurs & Permissions).
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
