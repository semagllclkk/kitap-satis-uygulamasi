export class CreateBookDto {
  title: string;
  isbn?: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  publicationYear?: string;
  publisher?: string;
  authorId: string;
}

export class UpdateBookDto {
  title?: string;
  isbn?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  publicationYear?: string;
  publisher?: string;
  authorId?: string;
}
