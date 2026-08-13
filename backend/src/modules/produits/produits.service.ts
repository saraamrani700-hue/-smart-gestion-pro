import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Produit, TypeProduit } from './entities/produit.entity';
import { Categorie } from './entities/categorie.entity';
import { UniteMesure } from './entities/unite-mesure.entity';
import { Stock } from './entities/stock.entity';
import { MouvementStock, TypeMouvementStock } from './entities/mouvement-stock.entity';
import { CreateProduitDto } from './dto/create-produit.dto';
import { UpdateProduitDto } from './dto/update-produit.dto';
import { AjusterStockDto } from './dto/ajuster-stock.dto';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private produitsRepository: Repository<Produit>,
    @InjectRepository(Categorie)
    private categoriesRepository: Repository<Categorie>,
    @InjectRepository(UniteMesure)
    private unitesRepository: Repository<UniteMesure>,
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    @InjectRepository(MouvementStock)
    private mouvementRepository: Repository<MouvementStock>,
    private dataSource: DataSource,
    private cacheService: CacheService,
  ) {}

  // ---------------------------------------------------------------------
  // CATEGORIES & UNITES DE MESURE
  // ---------------------------------------------------------------------

  findAllCategories(entrepriseId: string): Promise<Categorie[]> {
    return this.categoriesRepository.find({ where: { entrepriseId }, order: { nom: 'ASC' } });
  }

  createCategorie(entrepriseId: string, nom: string, parentId?: string): Promise<Categorie> {
    const categorie = this.categoriesRepository.create({ entrepriseId, nom, parentId: parentId || null });
    return this.categoriesRepository.save(categorie);
  }

  findAllUnites(entrepriseId: string): Promise<UniteMesure[]> {
    return this.unitesRepository.find({ where: { entrepriseId }, order: { nom: 'ASC' } });
  }

  createUnite(entrepriseId: string, nom: string, symbole: string): Promise<UniteMesure> {
    const unite = this.unitesRepository.create({ entrepriseId, nom, symbole });
    return this.unitesRepository.save(unite);
  }

  // ---------------------------------------------------------------------
  // CRUD PRODUITS
  // ---------------------------------------------------------------------

  async create(entrepriseId: string, dto: CreateProduitDto): Promise<Produit> {
    const produit = this.produitsRepository.create({ entrepriseId, ...dto });
    const sauvegarde = await this.produitsRepository.save(produit);
    await this.cacheService.delParPrefixe(`produits:${entrepriseId}`);
    return sauvegarde;
  }

  async findAll(entrepriseId: string, type?: TypeProduit): Promise<Produit[]> {
    const cleCache = `produits:${entrepriseId}:liste:${type || 'tous'}`;
    const enCache = await this.cacheService.get<Produit[]>(cleCache);
    if (enCache) return enCache;

    const produits = await this.produitsRepository.find({
      where: type ? { entrepriseId, type } : { entrepriseId },
      relations: ['categorie', 'unite'],
      order: { nom: 'ASC' },
    });

    await this.cacheService.set(cleCache, produits, 60); // cache 60s
    return produits;
  }

  async findOne(id: string, entrepriseId: string): Promise<Produit> {
    const produit = await this.produitsRepository.findOne({
      where: { id, entrepriseId },
      relations: ['categorie', 'unite'],
    });
    if (!produit) throw new NotFoundException('Produit introuvable');
    return produit;
  }

  async update(id: string, entrepriseId: string, dto: UpdateProduitDto): Promise<Produit> {
    const produit = await this.findOne(id, entrepriseId);
    Object.assign(produit, dto);
    const sauvegarde = await this.produitsRepository.save(produit);
    await this.cacheService.delParPrefixe(`produits:${entrepriseId}`);
    return sauvegarde;
  }

  async remove(id: string, entrepriseId: string): Promise<void> {
    const produit = await this.findOne(id, entrepriseId);
    // Desactivation logique plutot que suppression physique : on garde
    // l'historique (mouvements de stock, lignes de vente/achat passees...).
    produit.actif = false;
    await this.produitsRepository.save(produit);
    await this.cacheService.delParPrefixe(`produits:${entrepriseId}`);
  }

  // ---------------------------------------------------------------------
  // STOCK
  // ---------------------------------------------------------------------

  async getStockProduit(produitId: string, entrepriseId: string): Promise<Stock[]> {
    return this.stockRepository.find({
      where: { produitId, entrepriseId },
      relations: ['succursale'],
    });
  }

  async getProduitsEnAlerte(entrepriseId: string): Promise<Produit[]> {
    // Produits dont le stock total est descendu sous le seuil d'alerte
    // (cf. Article 1 - notifications "stock bas").
    const produits = await this.produitsRepository.find({
      where: { entrepriseId, gereStock: true },
    });

    const enAlerte: Produit[] = [];
    for (const produit of produits) {
      const stocks = await this.stockRepository.find({ where: { produitId: produit.id } });
      const total = stocks.reduce((sum, s) => sum + Number(s.quantite), 0);
      if (total <= Number(produit.seuilAlerte)) {
        enAlerte.push(produit);
      }
    }
    return enAlerte;
  }

  /**
   * Ajuste le stock d'un produit dans une succursale et cree systematiquement
   * un mouvement de stock associe (tracabilite complete). Utilise une
   * transaction pour garantir la coherence entre "stocks" et "mouvements_stock".
   */
  async ajusterStock(
    entrepriseId: string,
    userId: string,
    dto: AjusterStockDto,
  ): Promise<{ stock: Stock; mouvement: MouvementStock }> {
    const produit = await this.findOne(dto.produitId, entrepriseId);

    if (!produit.gereStock) {
      throw new BadRequestException(
        `Le produit "${produit.nom}" n'est pas gere en stock (service ou desactive)`,
      );
    }

    if (dto.quantite <= 0) {
      throw new BadRequestException('La quantite doit etre superieure a 0');
    }

    return this.dataSource.transaction(async (manager) => {
      let stock = await manager.findOne(Stock, {
        where: { produitId: dto.produitId, succursaleId: dto.succursaleId },
      });

      if (!stock) {
        stock = manager.create(Stock, {
          entrepriseId,
          produitId: dto.produitId,
          succursaleId: dto.succursaleId,
          quantite: 0,
        });
      }

      const quantiteAvant = Number(stock.quantite);
      const sensPositif = [TypeMouvementStock.ENTREE, TypeMouvementStock.INVENTAIRE].includes(
        dto.type,
      );

      let quantiteApres: number;
      if (dto.type === TypeMouvementStock.INVENTAIRE) {
        // En mode inventaire, la quantite saisie represente le nouveau total
        quantiteApres = dto.quantite;
      } else if (sensPositif) {
        quantiteApres = quantiteAvant + dto.quantite;
      } else {
        quantiteApres = quantiteAvant - dto.quantite;
        if (quantiteApres < 0) {
          throw new BadRequestException(
            `Stock insuffisant pour "${produit.nom}" (disponible: ${quantiteAvant})`,
          );
        }
      }

      stock.quantite = quantiteApres;
      const stockSauvegarde = await manager.save(Stock, stock);

      const mouvement = manager.create(MouvementStock, {
        entrepriseId,
        produitId: dto.produitId,
        succursaleId: dto.succursaleId,
        type: dto.type,
        quantite: dto.quantite,
        quantiteAvant,
        quantiteApres,
        referenceDoc: dto.referenceDoc,
        motif: dto.motif,
        userId,
      });
      const mouvementSauvegarde = await manager.save(MouvementStock, mouvement);

      return { stock: stockSauvegarde, mouvement: mouvementSauvegarde };
    });
  }

  async getHistoriqueMouvements(
    entrepriseId: string,
    produitId?: string,
  ): Promise<MouvementStock[]> {
    return this.mouvementRepository.find({
      where: produitId ? { entrepriseId, produitId } : { entrepriseId },
      relations: ['produit', 'succursale'],
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
