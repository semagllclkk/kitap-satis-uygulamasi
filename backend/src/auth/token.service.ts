import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities';

/**
 * Tek sorumluluk: JWT token generation
 * Token logic AuthService'den ayrıştırıldı
 */
@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateToken(user: User): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
