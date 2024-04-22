import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AdminModule,MongooseModule.forRoot("mongodb+srv://TEST_Dev:qwertyuiop@cluster0.yyerrbz.mongodb.net"), AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
