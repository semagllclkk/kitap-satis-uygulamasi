import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import {
  User,
  Author,
  Book,
  Order,
  OrderDetails,
  Cart,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([User, Author, Book, Order, OrderDetails, Cart]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
