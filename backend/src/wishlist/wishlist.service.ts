import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { User } from '../entities/user.entity';
import { Book } from '../entities/book.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  async getWishlist(userId: string): Promise<Book[]> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['books', 'books.author'],
    });

    return wishlist?.books || [];
  }

  async addToWishlist(userId: string, bookId: string): Promise<Wishlist> {
    let wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['books'],
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { id: userId } as User,
        books: [],
      });
    }

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if book is already in wishlist
    const isAlreadyAdded = wishlist.books.some((b) => b.id === bookId);
    if (!isAlreadyAdded) {
      wishlist.books.push(book);
    }

    return this.wishlistRepository.save(wishlist);
  }

  async removeFromWishlist(userId: string, bookId: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['books'],
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    wishlist.books = wishlist.books.filter((b) => b.id !== bookId);
    return this.wishlistRepository.save(wishlist);
  }

  async isBookInWishlist(userId: string, bookId: string): Promise<boolean> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['books'],
    });

    return wishlist ? wishlist.books.some((b) => b.id === bookId) : false;
  }

  async getWishlistCount(userId: string): Promise<number> {
    const wishlist = await this.wishlistRepository.findOne({
      where: { user: { id: userId } },
      relations: ['books'],
    });

    return wishlist?.books.length || 0;
  }
}
