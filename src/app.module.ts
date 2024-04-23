import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

@Module({
  imports: [AdminModule,MongooseModule.forRoot("mongodb+srv://TEST_Dev:qwertyuiop@cluster0.yyerrbz.mongodb.net"), AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
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
