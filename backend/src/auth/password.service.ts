import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
