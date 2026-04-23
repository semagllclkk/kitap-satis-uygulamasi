import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'uuid-kitap-id', description: 'Sepete eklenecek kitabın ID\'si' })
  bookId: string;

  @ApiProperty({ example: 1, description: 'Eklenecek adet' })
  quantity: number;
}

export class UpdateCartQuantityDto {
  @ApiProperty({ example: 2, description: 'Yeni adet (0 veya altı ise ürün sepetten kaldırılır)' })
  quantity: number;
}
