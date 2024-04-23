import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from './admin.schema';
import { MulterModule } from '@nestjs/platform-express';


@Module({
  imports:[MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema }]),MulterModule.register({
    dest: './uploads', // Destination folder for uploaded files
  }),],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
