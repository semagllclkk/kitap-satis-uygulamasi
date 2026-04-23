import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderDetails, User, Book, Cart } from '../entities';
import { AddToCartDto, UpdateCartQuantityDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) { }

  // ===== CART OPERATIONS =====

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { bookId, quantity } = addToCartDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Kitap bulunamadı');
    }

    if (book.stock < quantity) {
      throw new BadRequestException('Yeterli stok yok');
    }

    let cartItem = await this.cartRepository.findOne({
      where: { userId, bookId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartRepository.create({
        user,
        book,
        quantity,
        userId,
        bookId,
      });
    }

    return this.cartRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['book', 'book.author'],
    });
  }

  async removeFromCart(userId: string, cartId: string): Promise<{ message: string }> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    await this.cartRepository.remove(cartItem);
    return { message: 'Sepetten kaldırıldı' };
  }

  async updateCartQuantity(
    userId: string,
    cartId: string,
    updateDto: UpdateCartQuantityDto,
  ): Promise<Cart | null> {
    const { quantity } = updateDto;
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartId, userId },
      relations: ['book'],
    });

    if (!cartItem) {
      throw new NotFoundException('Sepet öğesi bulunamadı');
    }

    if (quantity <= 0) {
      await this.cartRepository.remove(cartItem);
      return null;
    }

    if (cartItem.book.stock < quantity) {
      throw new BadRequestException('Yeterli stok yok');
    }

    cartItem.quantity = quantity;
    return this.cartRepository.save(cartItem);
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    await this.cartRepository.delete({ userId });
    return { message: 'Sepet boşaltıldı' };
  }

  // ===== ORDER OPERATIONS =====

  async checkout(userId: string): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['book'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Sepet boş');
    }

    let totalPrice = 0;
    let totalQuantity = 0;

    for (const cartItem of cartItems) {
      const book = cartItem.book;
      if (book.stock < cartItem.quantity) {
        throw new BadRequestException(`${book.title} için yeterli stok yok`);
      }
      totalPrice += Number(book.price) * cartItem.quantity;
      totalQuantity += cartItem.quantity;
    }

    const order = this.orderRepository.create({
      user,
      status: 'completed',
      totalPrice,
      totalQuantity,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const cartItem of cartItems) {
      const book = await this.bookRepository.findOne({
        where: { id: cartItem.bookId },
      });

      if (!book) {
        throw new NotFoundException('Kitap bulunamadı');
      }

      const orderDetail = this.orderDetailsRepository.create({
        order: savedOrder,
        book,
        quantity: cartItem.quantity,
        price: book.price,
      });

      await this.orderDetailsRepository.save(orderDetail);
      book.stock -= cartItem.quantity;
      await this.bookRepository.save(book);
    }

    await this.cartRepository.delete({ userId });

    const finalOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['orderDetails', 'orderDetails.book'],
    });

    if (!finalOrder) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return finalOrder;
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderDetails', 'orderDetails.book'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'orderDetails', 'orderDetails.book'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderDetails', 'orderDetails.book'],
    });

    if (!order) {
      throw new NotFoundException('Sipariş bulunamadı');
    }

    return order;
  }
}
