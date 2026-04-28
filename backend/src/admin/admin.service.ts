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

  async resetDatabase(): Promise<{ message: string }> {
    await this.databaseResetService.cleanRandomData();
    return { message: 'Sadece test amacıyla eklenen random veriler temizlendi.' };
  }

  async seedDemoData(): Promise<{ message: string }> {
    return this.demoDataSeederService.seedDemoData();
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
