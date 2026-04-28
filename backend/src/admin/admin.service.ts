import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Author, Book, Order } from '../entities';
import { DatabaseResetService } from '../database/database-reset.service';
import { DemoDataSeederService } from '../database/demo-data-seeder.service';

/**
 * Tek sorumluluk: Admin queries ve data aggregation
 * Database reset → DatabaseResetService
 * Demo data seeding → DemoDataSeederService
 */
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
    private databaseResetService: DatabaseResetService,
    private demoDataSeederService: DemoDataSeederService,
  ) {}

  async getStats() {
    const [users, authors, books, orders] = await Promise.all([
      this.userRepository.count(),
      this.authorRepository.count(),
      this.bookRepository.count(),
      this.orderRepository.count(),
    ]);

    return { users, authors, books, orders };
  }

  async resetDatabase(): Promise<{ message: string }> {
    await this.databaseResetService.cleanRandomData();
    return { message: 'Sadece test amacıyla eklenen random veriler temizlendi.' };
  }

  async seedDemoData(): Promise<{ message: string }> {
    return this.demoDataSeederService.seedDemoData();
  }
}
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
      const currentMonth = new Date().getMonth();
      
      // Sadece Ocak-Nisan (0-3) aylarına ait rastgele siparişler oluştur
      for (let month = 0; month <= Math.min(3, currentMonth); month++) {
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
