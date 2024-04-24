import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MulterModule } from '@nestjs/platform-express';
import { AppModule } from 'src/app.module';

// import { GridFSBucket, GridFSBucketReadStream } from 'mongodb';

@Module({
    imports:[MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema }]), MulterModule.register({
        dest: `https://cloud.mongodb.com/v2/60f603a9ff916931b8540484#/metrics/replicaSet/6608398e7f9a1e01e370de8d/explorer/test/categories/${process.env.filename}`, // Destination folder for uploaded files
      }),],
    providers: [CategoryService],
    controllers: [CategoryController],
})
export class CategoryModule {}


