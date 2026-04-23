import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  User,
  Author,
  Book,
  Order,
  OrderDetails,
  Cart,
} from '../entities';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'bookstore.db',
  entities: [User, Author, Book, Order, OrderDetails, Cart],
  synchronize: true,
  logging: false,
};
