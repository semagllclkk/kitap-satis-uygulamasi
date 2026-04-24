import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, Book, Cart, OrderDetails } from '../entities';
import { CreateAuthorDto, UpdateAuthorDto } from './authors.dto';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
  ) {}

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return this.authorRepository.save(author);
  }

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({ relations: ['books'] });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({
      where: { id },
      relations: ['books'],
    });

    if (!author) {
      throw new NotFoundException('Yazar bulunamadı');
    }

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    Object.assign(author, updateAuthorDto);
    return this.authorRepository.save(author);
  }

  async remove(id: string): Promise<{ message: string }> {
    const author = await this.findOne(id);

    // Yazara ait kitapları bul
    const books = await this.bookRepository.find({ where: { authorId: id } });

    for (const book of books) {
      // Kitaba bağlı sepet kayıtlarını sil
      await this.cartRepository.delete({ bookId: book.id });

      // Kitaba bağlı sipariş detaylarını sil
      await this.orderDetailsRepository.delete({ bookId: book.id });
    }

    // Kitapları sil
    if (books.length > 0) {
      await this.bookRepository.delete(books.map((b) => b.id));
    }

    // Yazarı sil
    await this.authorRepository.remove(author);
    return { message: 'Yazar ve ilgili kitaplar başarıyla silindi' };
  }
}
