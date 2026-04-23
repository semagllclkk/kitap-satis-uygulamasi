import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { AddToCartDto, UpdateCartQuantityDto } from './orders.dto';
import { Cart, Order } from '../entities';

@ApiTags('Orders & Cart')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ===== CART ENDPOINTS =====

  @Post('cart/:userId/add')
  @ApiOperation({ summary: 'Sepete kitap ekle' })
  addToCart(
    @Param('userId') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    return this.ordersService.addToCart(userId, addToCartDto);
  }

  @Get('cart/:userId')
  @ApiOperation({ summary: 'Kullanıcının sepetini göster' })
  getCart(@Param('userId') userId: string): Promise<Cart[]> {
    return this.ordersService.getCart(userId);
  }

  @Delete('cart/:userId/:cartId')
  @ApiOperation({ summary: 'Sepetten kitap kaldır' })
  removeFromCart(
    @Param('userId') userId: string,
    @Param('cartId') cartId: string,
  ): Promise<{ message: string }> {
    return this.ordersService.removeFromCart(userId, cartId);
  }

  @Put('cart/:userId/:cartId')
  @ApiOperation({ summary: 'Sepet öğesinin miktarını güncelle' })
  updateCartQuantity(
    @Param('userId') userId: string,
    @Param('cartId') cartId: string,
    @Body() updateDto: UpdateCartQuantityDto,
  ): Promise<Cart> {
    return this.ordersService.updateCartQuantity(userId, cartId, updateDto);
  }

  @Delete('cart/:userId')
  @ApiOperation({ summary: 'Sepeti boşalt' })
  clearCart(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.ordersService.clearCart(userId);
  }

  // ===== ORDER ENDPOINTS =====

  @Post('checkout/:userId')
  @ApiOperation({ summary: 'Sepeti siparişe çevir' })
  checkout(@Param('userId') userId: string): Promise<Order> {
    return this.ordersService.checkout(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Kullanıcının siparişlerini listele' })
  getUserOrders(@Param('userId') userId: string): Promise<Order[]> {
    return this.ordersService.getUserOrders(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm siparişleri listele (Admin)' })
  getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Siparişi ID ile getir' })
  getOrderById(@Param('id') id: string): Promise<Order> {
    return this.ordersService.getOrderById(id);
  }
}
