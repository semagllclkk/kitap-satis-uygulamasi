import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Allow users to update only their own profile
    if (req.user.id !== req.params.id) {
      throw new Error('Unauthorized');
    }
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Put(':id/password')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (req.user.id !== req.params.id) {
      throw new Error('Unauthorized');
    }
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteAccount(@Request() req, @Res() res: Response) {
    if (req.user.id !== req.params.id) {
      throw new Error('Unauthorized');
    }
    await this.usersService.deleteAccount(req.user.id);
    res.clearCookie('token');
    return res.json({ message: 'Account deleted successfully' });
  }
}
