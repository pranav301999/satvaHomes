import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, Param, Res, NotFoundException } from '@nestjs/common';
import { Category } from './category.interface';
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';



@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService, @InjectModel('Category') private readonly categoryModel: Model<Category>) { }


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

  @Get(':categoryId/imageUrl')
  async getImageObjectUrl(@Param('categoryId') categoryId: string): Promise<string> {
    try {
      // Assuming the categoryId directly represents the image object key in S3
      const objectKey = categoryId;

      // Fetch the image object URL from S3
      const imageUrl = await this.categoryService.getImageObjectUrl('sh-categories', objectKey);

      return imageUrl;
    } catch (error) {
      console.error('Error fetching image URL:', error);
      throw new NotFoundException('Image not found');
    }
  }
  

  @Get('generate-pdf')
  async generatePDFWithImagesFromS3(): Promise<string> {
    try {
      const generatedPdf = await this.categoryService.generatePDFWithImagesFromS3();
      console.log(generatedPdf);
      
      return generatedPdf;
      
      // return 'PDF generated successfully!';
    } catch (error) {
      console.error('Error generating PDF:', error);
      return 'Failed to generate PDF!';
    }
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

