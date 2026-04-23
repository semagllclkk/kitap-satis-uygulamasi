export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  name: string;
  password: string;
}

export class AuthResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  token: string;
}
