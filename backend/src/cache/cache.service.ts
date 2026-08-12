import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      // Ne bloque pas le demarrage de l'app si Redis est indisponible ;
      // les appels cache echoueront silencieusement (voir get/set ci-dessous)
      lazyConnect: false,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('error', () => {
      // Le cache est une optimisation, pas une dependance critique :
      // on n'interrompt jamais une requete metier a cause de Redis.
    });
  }

  async get<T>(cle: string): Promise<T | null> {
    try {
      const valeur = await this.client.get(cle);
      return valeur ? (JSON.parse(valeur) as T) : null;
    } catch {
      return null;
    }
  }

  async set(cle: string, valeur: unknown, ttlSecondes = 60): Promise<void> {
    try {
      await this.client.set(cle, JSON.stringify(valeur), 'EX', ttlSecondes);
    } catch {
      // silencieux : le cache ne doit jamais faire echouer la requete
    }
  }

  async del(cle: string): Promise<void> {
    try {
      await this.client.del(cle);
    } catch {
      // silencieux
    }
  }

  /**
   * Supprime toutes les cles correspondant a un prefixe (ex: invalider tout
   * le cache "produits:<entrepriseId>:*" apres une creation/modification).
   */
  async delParPrefixe(prefixe: string): Promise<void> {
    try {
      const cles = await this.client.keys(`${prefixe}*`);
      if (cles.length > 0) await this.client.del(...cles);
    } catch {
      // silencieux
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
