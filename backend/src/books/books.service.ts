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

  async search(
    query?: string,
    authorId?: string,
    genre?: string,
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean,
    sort?: string,
    page: number = 1,
    limit: number = 12,
  ): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.author', 'author');

    // Search by title or author name
    if (query && query.trim()) {
      queryBuilder.andWhere(
        '(book.title ILIKE :query OR author.name ILIKE :query OR book.description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // Filter by author
    if (authorId) {
      queryBuilder.andWhere('book.authorId = :authorId', { authorId });
    }

    // Filter by genre
    if (genre && genre.trim()) {
      queryBuilder.andWhere('book.genre ILIKE :genre', { genre: `%${genre}%` });
    }

    // Filter by price range
    if (minPrice !== undefined && minPrice !== null) {
      queryBuilder.andWhere('book.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      queryBuilder.andWhere('book.price <= :maxPrice', { maxPrice });
    }

    // Filter by stock availability
    if (inStock === true) {
      queryBuilder.andWhere('book.stock > 0');
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Sorting
    switch (sort) {
      case 'price_asc':
        queryBuilder.orderBy('book.price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('book.price', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('book.createdAt', 'DESC');
        break;
      case 'rating':
        queryBuilder.orderBy('book.rating', 'DESC');
        break;
      default:
        queryBuilder.orderBy('book.createdAt', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    };
  }
}
