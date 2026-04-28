import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Author, Book, Order } from '../entities';
import { DatabaseResetService } from '../database/database-reset.service';
import { DemoDataSeederService } from '../database/demo-data-seeder.service';

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

  async seedRandomOrders(): Promise<{ message: string }> {
    return this.demoDataSeederService.seedRandomOrders();
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
