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

  @Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService, @InjectModel('Category') private readonly categoryModel: Model<Category>) {}


  @Post('add')
  async createCategory(@Body() category: Category, @Body() file: Buffer) {
    try {
      const createdCategory = await this.categoryService.create(category, file);
      return createdCategory;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create category');
    }
  }

  // async createCategory(@Body() categoryData: { category: Category, file: Buffer }): Promise<Category> {
  //   const { category, file } = categoryData;
  //   return this.categoryService.create(category, file);
  // }
  }

//   @Post('/add')
  
//   @UseInterceptors(FileInterceptor('category_img')) // 'category_img' is the name of the field in the form-data
//   async createCategory(@UploadedFile() Image: Express.Multer.File, @Body() createCategoryDto: any): Promise<Category> {
//        console.log(createCategoryDto);
       
//     // Handle file upload
//     const { categoryId, categoryName, description } = createCategoryDto;
//     // Assuming categoryImage is an object with file information, you may need to adjust this based on Multer's output
//     const category_img = createCategoryDto.categoryImage ? createCategoryDto.categoryImage.path : null;

//     // Create a new category instance
//     const createdCategory = new this.categoryModel({
//       categoryId:createCategoryDto.categoryId,
//       categoryName:createCategoryDto.categoryName,
//       description:createCategoryDto.description,  
//       category_img:createCategoryDto.category_img   
//     });

//     // Save the category to the database
//     return createdCategory.save();
//   }
// }

  // @Get('/retrieve')
  // async findAll(): Promise<Category[]> {
  //   return this.categoryService.findAll();
  // }


