import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { Fournisseur } from './entities/fournisseur.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';

@Injectable()
export class ClientsFournisseursService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(Fournisseur)
    private fournisseursRepository: Repository<Fournisseur>,
  ) {}

  // ---------------------------------------------------------------------
  // CLIENTS
  // ---------------------------------------------------------------------

  createClient(entrepriseId: string, dto: CreateClientDto): Promise<Client> {
    const client = this.clientsRepository.create({ entrepriseId, ...dto });
    return this.clientsRepository.save(client);
  }

  findAllClients(entrepriseId: string): Promise<Client[]> {
    return this.clientsRepository.find({ where: { entrepriseId }, order: { nom: 'ASC' } });
  }

  async findOneClient(id: string, entrepriseId: string): Promise<Client> {
    const client = await this.clientsRepository.findOne({ where: { id, entrepriseId } });
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  async updateClient(id: string, entrepriseId: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findOneClient(id, entrepriseId);
    Object.assign(client, dto);
    return this.clientsRepository.save(client);
  }

  async removeClient(id: string, entrepriseId: string): Promise<void> {
    const client = await this.findOneClient(id, entrepriseId);
    client.actif = false;
    await this.clientsRepository.save(client);
  }

  /**
   * Augmente ou diminue le solde d'un client (ex: +montant a la vente a
   * credit, -montant a l'encaissement). Appele par le module Ventes/Paiements.
   */
  async ajusterSoldeClient(clientId: string, entrepriseId: string, montant: number): Promise<Client> {
    const client = await this.findOneClient(clientId, entrepriseId);
    client.solde = Number(client.solde) + montant;
    return this.clientsRepository.save(client);
  }

  // ---------------------------------------------------------------------
  // FOURNISSEURS
  // ---------------------------------------------------------------------

  createFournisseur(entrepriseId: string, dto: CreateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = this.fournisseursRepository.create({ entrepriseId, ...dto });
    return this.fournisseursRepository.save(fournisseur);
  }

  findAllFournisseurs(entrepriseId: string): Promise<Fournisseur[]> {
    return this.fournisseursRepository.find({ where: { entrepriseId }, order: { nom: 'ASC' } });
  }

  async findOneFournisseur(id: string, entrepriseId: string): Promise<Fournisseur> {
    const fournisseur = await this.fournisseursRepository.findOne({ where: { id, entrepriseId } });
    if (!fournisseur) throw new NotFoundException('Fournisseur introuvable');
    return fournisseur;
  }

  async updateFournisseur(
    id: string,
    entrepriseId: string,
    dto: UpdateFournisseurDto,
  ): Promise<Fournisseur> {
    const fournisseur = await this.findOneFournisseur(id, entrepriseId);
    Object.assign(fournisseur, dto);
    return this.fournisseursRepository.save(fournisseur);
  }

  async removeFournisseur(id: string, entrepriseId: string): Promise<void> {
    const fournisseur = await this.findOneFournisseur(id, entrepriseId);
    fournisseur.actif = false;
    await this.fournisseursRepository.save(fournisseur);
  }

  async ajusterSoldeFournisseur(
    fournisseurId: string,
    entrepriseId: string,
    montant: number,
  ): Promise<Fournisseur> {
    const fournisseur = await this.findOneFournisseur(fournisseurId, entrepriseId);
    fournisseur.solde = Number(fournisseur.solde) + montant;
    return this.fournisseursRepository.save(fournisseur);
  }
}
