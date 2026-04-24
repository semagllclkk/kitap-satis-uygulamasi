import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book, Author } from '../entities';
import { CreateBookDto, UpdateBookDto } from './books.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const author = await this.authorRepository.findOne({
      where: { id: createBookDto.authorId },
    });

    if (!author) {
      throw new NotFoundException('Yazar bulunamadı');
    }

    const book = this.bookRepository.create({
      ...createBookDto,
      author,
      authorId: author.id,
    });

    return this.bookRepository.save(book);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.find({ relations: ['author'] });
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!book) {
      throw new NotFoundException('Kitap bulunamadı');
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);

    if (updateBookDto.authorId && updateBookDto.authorId !== book.authorId) {
      const author = await this.authorRepository.findOne({
        where: { id: updateBookDto.authorId },
      });
      if (!author) {
        throw new NotFoundException('Yazar bulunamadı');
      }
      book.author = author;
      book.authorId = author.id;
    }

    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<{ message: string }> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
    return { message: 'Kitap başarıyla silindi' };
  }
}
