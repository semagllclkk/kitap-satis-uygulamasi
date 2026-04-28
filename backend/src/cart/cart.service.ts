import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, Book, User } from '../entities';
import { AddToCartDto, UpdateCartQuantityDto } from '../orders/orders.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { bookId, quantity } = addToCartDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Kitap bulunamadı');
    if (book.stock < quantity) throw new BadRequestException('Yeterli stok yok');

    let cartItem = await this.cartRepository.findOne({ where: { userId, bookId } });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepository.create({ user, book, quantity, userId, bookId });
    }

    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['book', 'book.author'],
    });
  }

  async removeFromCart(userId: string, cartId: string): Promise<void> {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartId, userId } });
    if (!cartItem) throw new NotFoundException('Sepet öğesi bulunamadı');
    await this.cartRepository.remove(cartItem);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}
