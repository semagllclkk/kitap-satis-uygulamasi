import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Book } from './book.entity';

@Entity('order_details')
export class OrderDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.orderDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'varchar' })
  orderId: string;

  @ManyToOne(() => Book, (book) => book.orderDetails, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ type: 'varchar', nullable: true })
  bookId: string;
}
