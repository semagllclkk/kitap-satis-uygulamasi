import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author, Book, Order, OrderDetails, Cart } from '../entities';

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
    // Demo kitaplar /uploads/ ile tanımlanır — title encoding sorunları yaşamamak için imageUrl kullan
    const randomBooks = await this.bookRepository
      .createQueryBuilder('book')
      .where("book.imageUrl NOT LIKE '/uploads/%'")
      .orWhere('book.imageUrl IS NULL')
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
            order.totalPrice = Math.max(0, Number(order.totalPrice) - Number(od.price) * od.quantity);
            order.totalQuantity = Math.max(0, order.totalQuantity - od.quantity);
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

    // Demo olmayan yazarlar: kitabı kalmamış olanları sil
    const authorsWithBooks = await this.bookRepository
      .createQueryBuilder('book')
      .select('DISTINCT book.authorId', 'authorId')
      .getRawMany();
    const activeAuthorIds = authorsWithBooks.map(r => r.authorId).filter(Boolean);

    if (activeAuthorIds.length > 0) {
      await this.authorRepository
        .createQueryBuilder()
        .where('id NOT IN (:...ids)', { ids: activeAuthorIds })
        .delete()
        .execute();
    }

    // totalQuantity 0 olan boş siparişleri temizle
    await this.orderRepository
      .createQueryBuilder()
      .where('totalQuantity <= 0')
      .delete()
      .execute();
  }
}
