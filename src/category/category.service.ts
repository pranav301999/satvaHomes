import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Category } from './category.interface';
import { UploadService } from 'src/upload/upload.service';
import { GetObjectCommand, GetObjectOutput, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { promisify } from 'util';




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
  //   if (docImage) {
  //     console.log(docImage);
  //     const baseUrl = `https://satva-homes-img-upload.s3.ap-northeast-1.amazonaws.com/` 
  //     const objects = Array.isArray(docImage) ? docImage : [docImage];

      
  //     return objects.map(object => baseUrl + object.Key);
  // } else {
  //     return [];
  // }
    const obj = {
      docId:docId,
      docImage:docImage
    }

    return obj;

  }

  async getImageObjectUrl(bucketName: string, objectKey: string): Promise<string> {
    try {
      // Fetch the object (image) from S3
      const { Body } = await this.s3client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
      );

      // Construct the image object URL
      const imageUrl = `https://${bucketName}.s3.ap-northeast-1.amazonaws.com/${objectKey}`;
      console.log(imageUrl);
      
      return imageUrl;
    } catch (error) {
      console.error('Error fetching image object from S3:', error);
      throw error; // Handle or rethrow the error as needed
    }
  }

  async generatePDFWithImagesFromS3(): Promise<any> {
    const categories = await this.categoryModel.find().exec();
    const s3 = new S3Client({ region: this.configService.getOrThrow('AWS_S3_Region') }); // Replace 'your-region' with your S3 bucket region


    const { Contents } = await this.s3client.send(
      new ListObjectsV2Command({ Bucket: 'sh-categories' })
    );


    const doc = new PDFDocument();
    const stream = fs.createWriteStream('categories.pdf');

    doc.pipe(stream);

    // for (const category of categories) {
    //   // Fetch image from S3 based on category_img URL
    //   const imageUrl = await this.getImageObjectUrl('sh-categories', category.category_img);
    //   console.log(imageUrl);
      
    //   // Fetch image from S3
    //   const params = {
    //     Bucket: 'sh-categories',
    //     Key: imageUrl.split('/').pop(),
    //   };

    for (const object of Contents) {
      const params = {
        Bucket: 'sh-categories',
        Key: object.Key,
      };
    
      
      // const { Body } = await s3.send(new GetObjectCommand(params));
      const { Body } = await this.s3client.send(new GetObjectCommand(params));

      // Convert the ReadableStream to Buffer
      const chunks: Uint8Array[] = [];
      if (Body instanceof Readable) {
        Body.on('data', (chunk: Uint8Array) => {
          chunks.push(chunk);
        });

        await new Promise<void>((resolve, reject) => { // Specify Promise<void>
          Body.on('end', () => {
            resolve();
          });
          Body.on('error', (error: Error) => {
            reject(error);
          });
        });
      }

      const buffer = Buffer.concat(chunks);

      // Embed image in PDF
      doc.image(buffer, { width: 300 });
      doc.addPage(); // Add a new page for each image
    }

     doc.end(); // End PDF generation

     await promisify(stream.end).bind(stream)();

      // Return the path where the PDF is saved
      return 'categories.pdf';
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF!');
    }
  
  }

  


