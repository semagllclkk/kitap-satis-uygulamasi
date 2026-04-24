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
    const demoAuthors = ['Orhan Pamuk', 'Ahmet Ümit', 'Elif Şafak'];
    const demoBooks = ['Kar', 'Beyaz Kale', 'Dehşet', '10 Dakika 38 Saniye', 'İstanbul Müzesi'];

    // 1. Random Kitapları Sil
    const randomBooks = await this.bookRepository.createQueryBuilder('book')
      .where('book.title NOT IN (:...titles)', { titles: demoBooks })
      .getMany();

    if (randomBooks.length > 0) {
      const bookIds = randomBooks.map((b) => b.id);

      const orderDetails = await this.orderDetailsRepository.createQueryBuilder('od')
        .where('od.bookId IN (:...bookIds)', { bookIds })
        .getMany();

      if (orderDetails.length > 0) {
        for (const od of orderDetails) {
          const order = await this.orderRepository.findOne({ where: { id: od.orderId } });
          if (order) {
            order.totalPrice -= Number(od.price) * od.quantity;
            order.totalQuantity -= od.quantity;
            await this.orderRepository.save(order);
          }
        }
        await this.orderDetailsRepository.delete(orderDetails.map((od) => od.id));
      }

      await this.cartRepository.createQueryBuilder()
        .where('bookId IN (:...bookIds)', { bookIds })
        .delete()
        .execute();

      await this.bookRepository.delete(bookIds);
    }

    // 2. Random Yazarları Sil
    const randomAuthors = await this.authorRepository.createQueryBuilder('author')
      .where('author.name NOT IN (:...names)', { names: demoAuthors })
      .getMany();

    if (randomAuthors.length > 0) {
      await this.authorRepository.delete(randomAuthors.map((a) => a.id));
    }

    // 3. İçi boşalan siparişleri sil
    await this.orderRepository.createQueryBuilder()
      .where('totalQuantity <= 0')
      .delete()
      .execute();

    // Not: Artık kullanıcıları veya geçerli siparişleri silmiyoruz!

    return {
      message: 'Sadece test amacıyla eklenen random veriler temizlendi.',
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

    const savedBooks: Book[] = [];
    for (const bookData of books) {
      const book = this.bookRepository.create(bookData);
      savedBooks.push(await this.bookRepository.save(book));
    }

    // Demo Siparişler (Satış verisi grafikleri için)
    const customer = await this.userRepository.findOne({ where: { email: 'musteri@kitabevi.com' } });
    if (customer && savedBooks.length > 0) {
      const orders = [];
      const currentYear = new Date().getFullYear();
      
      // Geçmiş aylara ait rastgele siparişler oluştur
      for (let month = 0; month < 12; month++) {
        // Her ay için 1-3 arası rastgele sipariş
        const numOrders = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numOrders; i++) {
          const book1 = savedBooks[Math.floor(Math.random() * savedBooks.length)];
          const book2 = savedBooks[Math.floor(Math.random() * savedBooks.length)];
          
          const orderDate = new Date(currentYear, month, Math.floor(Math.random() * 28) + 1);
          
          const order = this.orderRepository.create({
            user: customer,
            userId: customer.id,
            status: 'completed',
            totalPrice: Number(book1.price) + Number(book2.price),
            totalQuantity: 2,
            createdAt: orderDate,
            updatedAt: orderDate,
          });
          
          const savedOrder = await this.orderRepository.save(order);
          
          await this.orderDetailsRepository.save([
            this.orderDetailsRepository.create({
              order: savedOrder,
              orderId: savedOrder.id,
              book: book1,
              bookId: book1.id,
              quantity: 1,
              price: book1.price,
            }),
            this.orderDetailsRepository.create({
              order: savedOrder,
              orderId: savedOrder.id,
              book: book2,
              bookId: book2.id,
              quantity: 1,
              price: book2.price,
            })
          ]);
        }
      }
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
