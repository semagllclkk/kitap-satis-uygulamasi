import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, Book } from '../entities';

/**
 * Tek sorumluluk: Demo data seeding
 * AdminService'den ayrıştırıldı - data initialization logic'i ayrı tutmak
 */
@Injectable()
export class DemoDataSeederService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async seedDemoData(): Promise<{ message: string }> {
    const existingCount = await this.authorRepository.count();
    if (existingCount > 0) {
      return { message: 'Demo veriler zaten mevcut, atlandı.' };
    }

    const authors = await this.createDemoAuthors();
    await this.createDemoBooks(authors);

    return { message: 'Demo veriler başarıyla yüklendi.' };
  }

  private async createDemoAuthors() {
    const authorsData = [
      {
        name: 'Orhan Pamuk',
        biography: 'Türk yazarı ve Nobel Ödülü sahibi',
        birthDate: '1952-06-07',
        nationality: 'Türkiye',
      },
      {
        name: 'Ahmet Ümit',
        biography: 'Türk yazarı ve senarist',
        birthDate: '1955-12-21',
        nationality: 'Türkiye',
      },
      {
        name: 'Elif Şafak',
        biography: 'Uluslararası ünlü Türk yazarı',
        birthDate: '1971-10-25',
        nationality: 'Türkiye',
      },
    ];

    const authors = await Promise.all(
      authorsData.map(data => this.authorRepository.save(this.authorRepository.create(data))),
    );
    return authors;
  }

  private async createDemoBooks(authors: Author[]) {
    const booksData = [
      {
        title: 'Kar',
        description: 'Kars şehrinde geçen, tasavvufi bir roman',
        price: 45.99,
        stock: 20,
        isbn: '978-9753862745',
        publicationYear: '2002',
        publisher: 'İletişim',
        author: authors[0],
      },
      {
        title: 'Beyaz Kale',
        description: 'Tarihsel ve fantastik unsurları bir araya getiren roman',
        price: 35.5,
        stock: 15,
        isbn: '978-9753860268',
        publicationYear: '1985',
        publisher: 'İletişim',
        author: authors[0],
      },
      {
        title: 'Dehşet',
        description: 'Gerilim ve esrar dolu, polisiye bir roman',
        price: 28.75,
        stock: 25,
        isbn: '978-9753870894',
        publicationYear: '2004',
        publisher: 'Everest',
        author: authors[1],
      },
    ];

    await Promise.all(
      booksData.map(data => this.bookRepository.save(this.bookRepository.create(data))),
    );
  }
}
