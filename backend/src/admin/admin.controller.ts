import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('reset')
  resetDatabase() {
    return this.adminService.resetDatabase();
  }

  @Post('seed-demo')
  seedDemoData() {
    return this.adminService.seedDemoData();
  }

  @Post('seed-random')
  seedRandomOrders() {
    return this.adminService.seedRandomOrders();
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
