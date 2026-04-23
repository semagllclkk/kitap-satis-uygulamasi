import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User, Author, Book, Order, OrderDetails, Cart } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Author, Book, Order, OrderDetails, Cart])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
