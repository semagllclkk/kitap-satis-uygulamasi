import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'kullanici@email.com', description: 'Kullanıcı e-posta adresi' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Kullanıcı şifresi' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'kullanici@email.com', description: 'E-posta adresi' })
  email: string;

  @ApiProperty({ example: 'Ahmet Yılmaz', description: 'Ad soyad' })
  name: string;

  @ApiProperty({ example: '123456', description: 'Şifre' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  token: string;
}
