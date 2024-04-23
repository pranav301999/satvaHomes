// admin.controller.ts
import { Controller, Post, Body, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Admin } from './admin.interface';
import * as bcrypt from 'bcryptjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', { // 'file' is the name of the field in the form-data
    storage: diskStorage({
      destination: './uploads', // Destination folder for uploaded files
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // File upload logic, save file path to database, etc.
    console.log(file);
    return { filename: file.filename };
  }

}
