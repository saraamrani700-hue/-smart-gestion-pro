import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !user.actif) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    await this.usersService.updateDerniereConnexion(user.id);

    const payload = {
      sub: user.id,
      entrepriseId: user.entrepriseId,
      succursaleId: user.succursaleId,
      roleId: user.roleId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nomComplet: user.nomComplet,
        email: user.email,
        entrepriseId: user.entrepriseId,
        succursaleId: user.succursaleId,
      },
    };
  }
}
