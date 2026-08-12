import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_gestion_pro',
  autoLoadEntities: true,
  // ATTENTION: synchronize doit rester FALSE en production (risque de perte
  // de donnees). Utile uniquement en developpement pour generer les tables
  // automatiquement a partir des entites.
  synchronize: process.env.NODE_ENV !== 'production',
  // En production, les migrations dans src/migrations sont executees
  // automatiquement au demarrage (voir npm run migration:generate/run pour
  // en creer de nouvelles quand les entites evoluent).
  migrations: ['dist/migrations/*.js'],
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV === 'development',
});
