import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Category } from './category.interface';
import * as Grid from 'gridfs-stream';
import { UploadService } from 'src/upload/upload.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';




@Injectable()
export class CategoryService {

  private readonly s3client = new S3Client({ region: this.configService.getOrThrow('AWS_S3_Region') });
  constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>, private readonly uploadService: UploadService, private readonly configService: ConfigService) { }

  async create(category: Category, file: Buffer): Promise<Category> {
    // Upload file to S3 and get the file key or URL

    const s3Client = new S3Client({ region: this.configService.getOrThrow('AWS_S3_Region') });

    const fileData = new Uint8Array(file);

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: 'satva-homes-img-upload',
        Key: `${category.categoryName}_${Date.now()}`,
        Body: fileData
      }
    });

    const result = await upload.done();

    const baseUrl = `https://satva-homes-img-upload.s3.ap-northeast-1.amazonaws.com/${result.Key}`

    // const key = `${category.categoryName}_${Date.now()}`;
    // const fileUrl = await this.uploadService.upload(key, file);
    // const fileKey = await this.uploadService.upload(category.categoryName, file);

    // Create a new category instance with the image URL
    const createdCategory = new this.categoryModel({
      categoryName: category.categoryName,
      description: category.description,
      category_img: baseUrl
    });

    console.log(createdCategory);

    // Save the category to MongoDB
    return createdCategory.save();
  }

  async uploadCatImage(file: Buffer) {


    const docId = uuidv4() 

    const docImage = await this.s3client.send(
      new PutObjectCommand({
        Bucket: 'sh-categories',
        Key: docId,
        Body: file

      }),
    );
    const obj = {
      docId:docId,
      docImage:docImage
    }

    return obj;

  }
}

