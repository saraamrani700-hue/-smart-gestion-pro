import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAllRoles(entrepriseId: string): Promise<Role[]> {
    // Les roles systeme (entrepriseId null) sont visibles par toutes les
    // entreprises, en plus des roles propres a celle-ci.
    return this.rolesRepository
      .createQueryBuilder('role')
      .where('role.entrepriseId = :entrepriseId OR role.entrepriseId IS NULL', { entrepriseId })
      .orderBy('role.nom', 'ASC')
      .getMany();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string, entrepriseId?: string): Promise<User> {
    const where: any = { id };
    if (entrepriseId) where.entrepriseId = entrepriseId;
    const user = await this.usersRepository.findOne({ where });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async findAllByEntreprise(entrepriseId: string): Promise<User[]> {
    return this.usersRepository.find({ where: { entrepriseId } });
  }

  async create(entrepriseId: string, dto: CreateUserDto): Promise<User> {
    const existant = await this.findByEmail(dto.email);
    if (existant) {
      throw new ConflictException('Un utilisateur avec cet email existe deja');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 10);

    const user = this.usersRepository.create({
      entrepriseId,
      succursaleId: dto.succursaleId ?? null,
      roleId: dto.roleId ?? null,
      nomComplet: dto.nomComplet,
      email: dto.email,
      motDePasse: motDePasseHash,
      telephone: dto.telephone,
      actif: true,
    });

    return this.usersRepository.save(user);
  }

  async updateDerniereConnexion(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { derniereConnexion: new Date() });
  }

  /**
   * Retourne la liste des codes de permission (ex: 'produits.create')
   * de l'utilisateur, via son role. Utilise par PermissionsGuard.
   */
  async getPermissionCodes(userId: string): Promise<string[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });

    if (!user || !user.role) return [];

    return user.role.permissions.map((p) => p.code);
  }
}
