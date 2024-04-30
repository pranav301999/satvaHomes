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
import * as htmlToPdf from 'html-pdf';
import * as path from 'path';
import { Readable } from 'stream';
import { promisify } from 'util';
import puppeteer, { executablePath } from 'puppeteer-core';




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

  async htmlToImage(htmlContent: string, fileName: string): Promise<string> {
    const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome'
  });
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    // Adjust viewport size if needed
    // await page.setViewport({ width: 1920, height: 1080 });

    // Capture screenshot
    const screenshotBuffer = await page.screenshot();
    await browser.close();

    // Upload image to S3
    const uploadResult = await this.uploadToS3(fileName, screenshotBuffer);
    return uploadResult.Location;
  }

  private async uploadToS3(fileName: string, data: Buffer): Promise<any> {
    const params = {
      Bucket: 'html-img',
      Key: fileName,
      Body: data,
      ContentType: 'image/png' // adjust content type as needed
    };

    return this.s3client.send(new PutObjectCommand(params));
  }

  async generatePdf(htmlBuffer: Buffer): Promise<string> {
    const pdfBuffer = await this.createPdf(htmlBuffer);
    const fileName = `generated-pdf-${Date.now()}.pdf`;
    const pdfUrl = await this.uploadingToS3(fileName, pdfBuffer);
    return pdfUrl;
  }

  private async createPdf(htmlBuffer: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (buffer: Buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      doc.font('Helvetica');
      doc.text(htmlBuffer.toString('utf-8'));

      doc.end();
    });
  }

  private async uploadingToS3(fileName: string, data: Buffer): Promise<string> {
    const params = {
      Bucket: 'html-img',
      Key: fileName,
      Body: data,
      ContentType: 'application/pdf'
    };

    await this.s3client.send(new PutObjectCommand(params));
    return `https://html-img.s3.ap-northeast-1.amazonaws.com/${fileName}`;
  }

  // async generatePdf(htmlBuffer: Buffer): Promise<string> {
  //   const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'});
  //   const page = await browser.newPage();
  //   await page.setContent(htmlBuffer.toString('utf-8'));
  //   const pdfBuffer = await page.pdf();
  //   await browser.close();

  //   const fileName = `generated-pdf-${Date.now()}.pdf`;
  //   const pdfUrl = await this.uploadingToS3(fileName, pdfBuffer);

  //   return pdfUrl;
  // }

  // private async uploadingToS3(fileName: string, data: Buffer): Promise<string> {
  //   const params = {
  //     Bucket: 'html-img',
  //     Key: fileName,
  //     Body: data,
  //     ContentType: 'application/pdf'
  //   };

  //   await this.s3client.send(new PutObjectCommand(params));
  //   return `https://html-img.s3.ap-northeast-1.amazonaws.com/${fileName}`;
  // }

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

  

  }

  


