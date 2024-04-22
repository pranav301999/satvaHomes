// admin.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.interface';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('/register')
  async registerAdmin(@Body() createAdminDto: Admin): Promise<Admin> {
    return this.adminService.create(createAdminDto);
  }

  @Post('/login')
  async loginAdmin(@Body() admin: Admin): Promise<any> {
    // Retrieve admin by adminName from the database
    const foundAdmin = await this.adminService.findByAdminName(admin.adminName);
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const passwordMatch = await bcrypt.compare(admin.password, foundAdmin.password);

    if (foundAdmin && await bcrypt.compare(admin.password, foundAdmin.password)) {
        console.log(foundAdmin)
      return  'Login successful' 
    } else {
      return  'Incorrect admin name or password' 
    }
  }
}
