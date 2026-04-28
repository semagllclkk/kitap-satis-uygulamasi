import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { LoginDto, RegisterDto } from './auth.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passwordService: PasswordService,
    private tokenService: TokenService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, name, password } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Bu email zaten kayıtlı');
    }

    const hashedPassword = await this.passwordService.hash(password);
    const user = this.userRepository.create({
      email,
      name,
      password: hashedPassword,
      role: 'customer',
    });

    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const isPasswordValid = await this.passwordService.verify(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    return user;
  }

  generateToken(user: User): string {
    return this.tokenService.generateToken(user);
  }
}
