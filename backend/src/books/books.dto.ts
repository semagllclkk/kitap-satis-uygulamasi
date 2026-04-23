import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Suç ve Ceza', description: 'Kitap başlığı' })
  title: string;

  @ApiPropertyOptional({ example: '978-3-16-148410-0', description: 'ISBN numarası' })
  isbn?: string;

  @ApiPropertyOptional({ example: 'Klasik bir roman...', description: 'Kitap açıklaması' })
  description?: string;

  @ApiProperty({ example: 149.90, description: 'Fiyat (TL)' })
  price: number;

  @ApiProperty({ example: 50, description: 'Stok adedi' })
  stock: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Kapak görseli URL' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: '1866', description: 'Yayın yılı' })
  publicationYear?: string;

  @ApiPropertyOptional({ example: 'İş Bankası Kültür Yayınları', description: 'Yayınevi' })
  publisher?: string;

  @ApiProperty({ example: 'uuid-yazar-id', description: 'Yazarın ID\'si' })
  authorId: string;
}

export class UpdateBookDto {
  @ApiPropertyOptional({ example: 'Suç ve Ceza', description: 'Kitap başlığı' })
  title?: string;

  @ApiPropertyOptional({ example: '978-3-16-148410-0', description: 'ISBN numarası' })
  isbn?: string;

  @ApiPropertyOptional({ example: 'Klasik bir roman...', description: 'Kitap açıklaması' })
  description?: string;

  @ApiPropertyOptional({ example: 149.90, description: 'Fiyat (TL)' })
  price?: number;

  @ApiPropertyOptional({ example: 50, description: 'Stok adedi' })
  stock?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Kapak görseli URL' })
  imageUrl?: string;

  @ApiPropertyOptional({ example: '1866', description: 'Yayın yılı' })
  publicationYear?: string;

  @ApiPropertyOptional({ example: 'İş Bankası Kültür Yayınları', description: 'Yayınevi' })
  publisher?: string;

  @ApiPropertyOptional({ example: 'uuid-yazar-id', description: 'Yazarın ID\'si' })
  authorId?: string;
}
