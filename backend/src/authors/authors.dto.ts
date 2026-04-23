import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Fyodor Dostoyevski', description: 'Yazarın adı' })
  name: string;

  @ApiPropertyOptional({ example: 'Rus edebiyatının önemli yazarlarından...', description: 'Biyografi' })
  biography?: string;

  @ApiPropertyOptional({ example: '1821-11-11', description: 'Doğum tarihi (YYYY-MM-DD)' })
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Rusya', description: 'Uyruk / Milliyet' })
  nationality?: string;
}

export class UpdateAuthorDto {
  @ApiPropertyOptional({ example: 'Fyodor Dostoyevski', description: 'Yazarın adı' })
  name?: string;

  @ApiPropertyOptional({ example: 'Rus edebiyatının önemli yazarlarından...', description: 'Biyografi' })
  biography?: string;

  @ApiPropertyOptional({ example: '1821-11-11', description: 'Doğum tarihi (YYYY-MM-DD)' })
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Rusya', description: 'Uyruk / Milliyet' })
  nationality?: string;
}
