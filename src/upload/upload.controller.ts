import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { GetObjectCommand, GetObjectCommandOutput, PutObjectCommandInput, S3, S3Client } from '@aws-sdk/client-s3';


@Controller('image')
export class UploadController {

  constructor(private readonly uploadService:UploadService){}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // File upload logic, save file path to database, etc.
    await this.uploadService.upload(file.originalname, file.buffer)
    console.log(file);
  }
  

  @Get('retrieve-all')
    async getAllFiles(): Promise<string[]> {
        return this.uploadService.getAllFiles();
    }

    @Get('retrieve/:key')
    async getFileByKey(@Param('key') key: string): Promise<{ key: string, content: string }> {
        return this.uploadService.getFileByKey(key);
    }

}
