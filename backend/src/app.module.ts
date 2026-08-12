import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EntreprisesModule } from './modules/entreprises/entreprises.module';
import { ProduitsModule } from './modules/produits/produits.module';
import { ClientsFournisseursModule } from './modules/clients-fournisseurs/clients-fournisseurs.module';
import { VentesModule } from './modules/ventes/ventes.module';
import { AchatsModule } from './modules/achats/achats.module';
import { PaiementsModule } from './modules/paiements/paiements.module';
import { FacturationModule } from './modules/facturation/facturation.module';
import { ComptabiliteModule } from './modules/comptabilite/comptabilite.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { AdministrationModule } from './modules/administration/administration.module';
import { RhModule } from './modules/rh/rh.module';
import { SavModule } from './modules/sav/sav.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { IaModule } from './modules/ia/ia.module';
import { DgiModule } from './modules/dgi/dgi.module';
import { SauvegardesModule } from './modules/sauvegardes/sauvegardes.module';
import { CacheModule } from './cache/cache.module';
import { BibliothequeModule } from './modules/bibliotheque/bibliotheque.module';
import { DepensesModule } from './modules/depenses/depenses.module';
import { CalendrierFiscalModule } from './modules/calendrier-fiscal/calendrier-fiscal.module';
import { ZakatModule } from './modules/zakat/zakat.module';
import { BonsCommandeModule } from './modules/bons-commande/bons-commande.module';
import { EmployesInternesModule } from './modules/employes-internes/employes-internes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(getDatabaseConfig()),
    ThrottlerModule.forRoot([
      {
        // Limite raisonnable pour un petit VPS (1 vCPU) : protege contre les
        // abus/bots sans gener un usage normal. Ajustable via ces valeurs.
        ttl: 60000, // fenetre de 60 secondes
        limit: 120, // 120 requetes / IP / minute
      },
    ]),
    CacheModule,

    // Modules implementes a ce stade :
    AuthModule,
    UsersModule,
    EntreprisesModule,
    ProduitsModule,
    ClientsFournisseursModule,
    VentesModule,
    AchatsModule,
    PaiementsModule,
    FacturationModule,
    ComptabiliteModule,
    NotificationsModule,
    AuditModule,
    AdministrationModule,
    RhModule,
    SavModule,
    PluginsModule,
    IaModule,
    DgiModule,
    SauvegardesModule,
    BibliothequeModule,
    DepensesModule,
    CalendrierFiscalModule,
    ZakatModule,
    BonsCommandeModule,
    EmployesInternesModule,

    // Hors scope "code backend" (voir README) : vraie soumission DGI (specs
    // officielles manquantes), vrai OCR de production a grande echelle,
    // applications Web/Mobile/Desktop, offline sync, Google Drive reel.
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
