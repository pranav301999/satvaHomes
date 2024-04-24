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
  @UseInterceptors(FileInterceptor('image')) // 'image' is the name of the field in the form-data
  async createCategory(
    @UploadedFile() categoryImage: Express.Multer.File,
    @Body() categoryData: any
  ): Promise<Category> {
    // Handle file upload
    const { categoryId, categoryName, description } = categoryData;

    // Read the image file as binary data
    const imageData = fs.readFileSync(categoryImage.path);

    // Create a new category instance with image data
    const createdCategory = new this.categoryModel({
      categoryId,
      categoryName,
      description,
      category_img: imageData // Storing image data directly
    });

    // Save the category to the database
    return createdCategory.save();
  }

  @Get('images/:categoryId')
  async serveImage(@Param('categoryId') categoryId: string, @Res() res: any) {
    try {
      // Fetch the category from MongoDB based on the categoryId
      const category = await this.categoryModel.find();

      // Check if the category exists and has image data
      // if (!category || !category.category_img) {
      //   return res.send('Image not found');
      // }

      // Send the image data back to the frontend
      res.setHeader('Content-Type', 'image/jpeg'); // Adjust content type based on your image format
      res.send(category);
    } catch (error) {
      console.error('Error serving image:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

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


