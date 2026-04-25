import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @UseGuards(JwtGuard)
  async getWishlist(@Request() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Get('count')
  @UseGuards(JwtGuard)
  async getWishlistCount(@Request() req) {
    const count = await this.wishlistService.getWishlistCount(req.user.id);
    return { count };
  }

  @Get('check/:bookId')
  @UseGuards(JwtGuard)
  async isInWishlist(@Request() req, @Param('bookId') bookId: string) {
    const isInWishlist = await this.wishlistService.isBookInWishlist(
      req.user.id,
      bookId,
    );
    return { isInWishlist };
  }

  @Post(':bookId')
  @UseGuards(JwtGuard)
  async addToWishlist(@Request() req, @Param('bookId') bookId: string) {
    if (!bookId) {
      throw new BadRequestException('Book ID is required');
    }
    return this.wishlistService.addToWishlist(req.user.id, bookId);
  }

  @Delete(':bookId')
  @UseGuards(JwtGuard)
  async removeFromWishlist(@Request() req, @Param('bookId') bookId: string) {
    if (!bookId) {
      throw new BadRequestException('Book ID is required');
    }
    return this.wishlistService.removeFromWishlist(req.user.id, bookId);
  }
}
