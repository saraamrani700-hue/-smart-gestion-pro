import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

/**
 * Configuration utilisee UNIQUEMENT par la CLI TypeORM pour generer et
 * executer les migrations (npm run migration:generate / migration:run).
 * L'application elle-meme utilise config/database.config.ts au demarrage.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'smart_gestion_pro',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
