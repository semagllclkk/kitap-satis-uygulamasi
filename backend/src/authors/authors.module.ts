import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorsService } from './authors.service';
import { AuthorsController } from './authors.controller';
import { Author, Book, Cart, OrderDetails } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Author, Book, Cart, OrderDetails])],
  controllers: [AuthorsController],
  providers: [AuthorsService],
  exports: [AuthorsService],
})
export class AuthorsModule {}
