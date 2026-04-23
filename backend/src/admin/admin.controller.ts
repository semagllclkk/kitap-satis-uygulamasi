import { Controller, Post, Get, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('reset')
  @ApiOperation({ summary: '⭐ Veritabanını sıfırla ve temiz veriler oluştur' })
  resetDatabase() {
    return this.adminService.resetDatabase();
  }

  @Post('seed-demo')
  @ApiOperation({ summary: 'Demo verilerini ekle (Yazarlar + Kitaplar)' })
  seedDemoData() {
    return this.adminService.seedDemoData();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Sistem istatistikleri' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
