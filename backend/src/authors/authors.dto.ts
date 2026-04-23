export class CreateAuthorDto {
  name: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
}

export class UpdateAuthorDto {
  name?: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
}
