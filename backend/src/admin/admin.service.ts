import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Author, Book, Order, OrderDetails, Cart } from '../entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async resetDatabase(): Promise<{ message: string }> {
    // Sil test verilerini
    await this.cartRepository.delete({});
    await this.orderDetailsRepository.delete({});
    await this.orderRepository.delete({});
    await this.bookRepository.delete({});
    await this.authorRepository.delete({});
    await this.userRepository.delete({});

    // Admin ve test customer oluştur
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = this.userRepository.create({
      email: 'admin@kitabevi.com',
      name: 'Admin Kullanıcı',
      password: adminPassword,
      role: 'admin',
    });
    await this.userRepository.save(admin);

    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = this.userRepository.create({
      email: 'musteri@kitabevi.com',
      name: 'Test Müşteri',
      password: customerPassword,
      role: 'customer',
    });
    await this.userRepository.save(customer);

    return {
      message: 'Veritabanı sıfırlandı. Admin ve test müşteri oluşturuldu.',
    };
  }

  async seedDemoData(): Promise<{ message: string }> {
    // Zaten veri varsa tekrar ekleme
    const existingCount = await this.authorRepository.count();
    if (existingCount > 0) {
      return { message: 'Demo veriler zaten mevcut, atlandı.' };
    }

    // Demo yazarlar
    const author1 = this.authorRepository.create({
      name: 'Orhan Pamuk',
      biography: 'Türk yazarı ve Nobel Ödülü sahibi',
      birthDate: '1952-06-07',
      nationality: 'Türkiye',
    });

    const author2 = this.authorRepository.create({
      name: 'Ahmet Ümit',
      biography: 'Türk yazarı ve senarist',
      birthDate: '1955-12-21',
      nationality: 'Türkiye',
    });

    const author3 = this.authorRepository.create({
      name: 'Elif Şafak',
      biography: 'Uluslararası ünlü Türk yazarı',
      birthDate: '1971-10-25',
      nationality: 'Türkiye',
    });

    const savedAuthor1 = await this.authorRepository.save(author1);
    const savedAuthor2 = await this.authorRepository.save(author2);
    const savedAuthor3 = await this.authorRepository.save(author3);

    // Demo kitaplar
    const books = [
      {
        title: 'Kar',
        author: savedAuthor1,
        description: 'Kars şehrinde geçen, tasavvufi bir roman',
        price: 45.99,
        stock: 20,
        isbn: '978-9753862745',
        publicationYear: '2002',
        publisher: 'İletişim',
        imageUrl:
          'https://via.placeholder.com/200x300?text=Kar',
      },
      {
        title: 'Beyaz Kale',
        author: savedAuthor1,
        description: 'Tarihsel ve fantastik unsurları bir araya getiren roman',
        price: 35.5,
        stock: 15,
        isbn: '978-9753860268',
        publicationYear: '1985',
        publisher: 'İletişim',
        imageUrl:
          'https://via.placeholder.com/200x300?text=Beyaz+Kale',
      },
      {
        title: 'Dehşet',
        author: savedAuthor2,
        description: 'Gerilim ve esrar dolu, polisiye bir roman',
        price: 28.75,
        stock: 25,
        isbn: '978-9753870894',
        publicationYear: '2004',
        publisher: 'Everest',
        imageUrl:
          'https://via.placeholder.com/200x300?text=Dehşet',
      },
      {
        title: '10 Dakika 38 Saniye',
        author: savedAuthor3,
        description: 'Felsefik ve duygusal bir aşk hikayesi',
        price: 32.0,
        stock: 18,
        isbn: '978-9753861452',
        publicationYear: '2001',
        publisher: 'İletişim',
        imageUrl:
          'https://via.placeholder.com/200x300?text=10+Dakika',
      },
      {
        title: 'İstanbul Müzesi',
        author: savedAuthor1,
        description: 'İstanbulun tarihini anlatışı',
        price: 50.0,
        stock: 12,
        isbn: '978-9753869873',
        publicationYear: '2012',
        publisher: 'İletişim',
        imageUrl:
          'https://via.placeholder.com/200x300?text=Istanbul+Muzesi',
      },
    ];

    for (const bookData of books) {
      const book = this.bookRepository.create(bookData);
      await this.bookRepository.save(book);
    }

    return { message: 'Demo veriler başarıyla eklendi' };
  }

  async getStats(): Promise<any> {
    const userCount = await this.userRepository.count();
    const bookCount = await this.bookRepository.count();
    const authorCount = await this.authorRepository.count();
    const orderCount = await this.orderRepository.count();

    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'total')
      .getRawOne();

    return {
      users: userCount,
      books: bookCount,
      authors: authorCount,
      orders: orderCount,
      totalRevenue: Number(totalRevenue?.total) || 0,
    };
  }

  async getAllUsers(): Promise<any[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'role', 'createdAt'],
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    await this.userRepository.delete(id);
    return { message: 'Kullanıcı silindi' };
  }
}
