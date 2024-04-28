import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, Param, Res } from '@nestjs/common';
import { Category } from './category.interface';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AppModule } from 'src/app.module';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import * as fs from 'fs';
// import { Category } from './category.schema';

  @Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService, @InjectModel('Category') private readonly categoryModel: Model<Category>) {}


  @Post('uploadcatimage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // File upload logic, save file path to database, etc.
    console.log(file);
    return await this.categoryService.uploadCatImage(file.buffer)
    
  }

  @Post('add-category')
  async createCategory(@Body() category: any): Promise<any> {
        const createdCategory = new this.categoryModel(category);
        console.log(createdCategory, category);
        
  return createdCategory.save();
}

//     // Save the category to the database
//     return createdCategory.save();
//   }
// }

  // @Get('/retrieve')
  // async findAll(): Promise<Category[]> {
  //   return this.categoryService.findAll();
  // }

}
