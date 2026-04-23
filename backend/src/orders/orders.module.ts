import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderDetails, User, Book, Cart } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderDetails, User, Book, Cart])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
