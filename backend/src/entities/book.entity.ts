import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Author } from './author.entity';
import { OrderDetails } from './order-details.entity';
import { Cart } from './cart.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  isbn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  publicationYear: string;

  @Column({ type: 'varchar', nullable: true })
  publisher: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Author, (author) => author.books, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @Column({ type: 'varchar' })
  authorId: string;

  @OneToMany(() => OrderDetails, (orderDetails) => orderDetails.book)
  orderDetails: OrderDetails[];

  @OneToMany(() => Cart, (cart) => cart.book)
  cartItems: Cart[];
}
