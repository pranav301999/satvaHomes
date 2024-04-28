import { Body, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Category } from './category.interface';
import * as Grid from 'gridfs-stream';
import { UploadService } from 'src/upload/upload.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';




@Injectable()
export class CategoryService {

  constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>, private readonly uploadService: UploadService, private readonly configService:ConfigService) {}

  async create(@Body() formData: any, file: Buffer): Promise<Category> {
    // Upload file to S3 and get the file key or URL

    const createdCategory = new this.categoryModel({
      categoryName: formData.categoryName,
      description: formData.description,
    });

    const s3Client = new S3Client({region: this.configService.getOrThrow('AWS_S3_Region')});

    const fileData = new Uint8Array(file);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: 'satva-homes-img-upload',
        Key: `${formData.categoryName}_${Date.now()}`,
        Body: fileData
      }
    });

    const result = await upload.done();

    let imgageUrl= `https://satva-homes-img-upload.s3.amazonaws.com/${result.Key}`;
    
    // const key = `${category.categoryName}_${Date.now()}`;
    // const fileUrl = await this.uploadService.upload(key, file);
    // const fileKey = await this.uploadService.upload(category.categoryName, file);

    // Create a new category instance with the image URL
    

    console.log(createdCategory);
    
    // Save the category to MongoDB
    return createdCategory.save();
  }

  // private async uploadFileToS3(category: Category, file: Buffer): Promise<string> {
  //   // Generate a unique file key (e.g., using category name and timestamp)
  //   const fileKey = `${category.categoryName}_${Date.now()}`;

  //   // Upload the file to S3 and obtain the file key or URL
  //   await this.uploadService.upload(fileKey, file);

  //   // Return the file key or URL
  //   return fileKey; // Assuming fileKey is the URL obtained after uploading to S3
  // }

  

  // async findAll(): Promise<Category[]> {
  //   return this.categoryModel.find().exec();
  // }

  // async findOne(id: string): Promise<Category> {
  //   return this.categoryModel.findById(id).exec();
  // }

  // async update(id: string, category: Category): Promise<Category> {
  //   return this.categoryModel.findByIdAndUpdate(id, category, { new: true }).exec();
  // }

}
