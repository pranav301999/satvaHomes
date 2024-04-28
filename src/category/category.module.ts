import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AppModule } from 'src/app.module';
import { UploadService } from 'src/upload/upload.service';

// import { GridFSBucket, GridFSBucketReadStream } from 'mongodb';

@Module({
    imports:[MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]), MulterModule.register({
        dest: `./uploads`, // Destination folder for uploaded files
      }),],
    providers: [CategoryService, UploadService],
    controllers: [CategoryController],
})
export class CategoryModule {}


