import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, Book, Order, OrderDetails, Cart } from '../entities';

/**
 * Tek sorumluluk: Veritabanı reset işlemleri
 * AdminService'den ayrıştırıldı
 */
@Injectable()
export class DatabaseResetService {
  constructor(
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

  async cleanRandomData(): Promise<void> {
    const demoBooks = ['Kar', 'Beyaz Kale', 'Dehşet', '10 Dakika 38 Saniye', 'İstanbul Müzesi'];
    const demoAuthors = ['Orhan Pamuk', 'Ahmet Ümit', 'Elif Şafak'];

    const randomBooks = await this.bookRepository
      .createQueryBuilder('book')
      .where('book.title NOT IN (:...titles)', { titles: demoBooks })
      .getMany();

    if (randomBooks.length > 0) {
      const bookIds = randomBooks.map(b => b.id);
      const orderDetails = await this.orderDetailsRepository
        .createQueryBuilder('od')
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
        await this.orderDetailsRepository.delete(orderDetails.map(od => od.id));
      }

      await this.cartRepository
        .createQueryBuilder()
        .where('bookId IN (:...bookIds)', { bookIds })
        .delete()
        .execute();

      await this.bookRepository.delete(bookIds);
    }

    const randomAuthors = await this.authorRepository
      .createQueryBuilder('author')
      .where('author.name NOT IN (:...names)', { names: demoAuthors })
      .getMany();

    if (randomAuthors.length > 0) {
      await this.authorRepository.delete(randomAuthors.map(a => a.id));
    }

    await this.orderRepository
      .createQueryBuilder()
      .where('totalQuantity <= 0')
      .delete()
      .execute();
  }
}
