import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CategoryModule } from './category/category.module';
// import { GridFsMulterConfigService } from './gridfs-multer-config.service';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { globalAgent } from 'http';


@Module({
  imports: [AdminModule,MongooseModule.forRoot("mongodb+srv://TEST_Dev:qwertyuiop@cluster0.yyerrbz.mongodb.net"), CategoryModule, UploadModule, ConfigModule.forRoot({isGlobal:true})],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {
  static MongooseModule: any;
  static async setupSwagger(app) {
    const options = new DocumentBuilder()
      .setTitle('SatvaHomes API')
      .setDescription('Api is working')
      .setVersion('1.0')
      .addTag('nestjs')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
