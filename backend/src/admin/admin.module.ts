import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DatabaseResetService } from '../database/database-reset.service';
import { DemoDataSeederService } from '../database/demo-data-seeder.service';
import { User, Author, Book, Order, OrderDetails, Cart } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Author, Book, Order, OrderDetails, Cart])],
  controllers: [AdminController],
  providers: [AdminService, DatabaseResetService, DemoDataSeederService],
  exports: [AdminService],
})
export class AdminModule {}
