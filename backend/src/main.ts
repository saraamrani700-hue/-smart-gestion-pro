import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // En-tetes de securite HTTP (protection XSS, clickjacking, sniffing...)
  app.use(helmet());

  // CORS : en production, restreindre a l'origine reelle du frontend via
  // la variable FRONTEND_URL. En developpement (variable absente), tout
  // est autorise pour faciliter les tests locaux.
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors(
    frontendUrl
      ? { origin: frontendUrl.split(',').map((u) => u.trim()), credentials: true }
      : {},
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Smart Gestion Pro API demarree sur http://localhost:${port}/api`);
}

bootstrap();
