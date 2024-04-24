import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Category extends Document {
  @Prop()
  categoryId: string;

  @Prop()
  categoryName: string;

  @Prop()
  description: string;

  @Prop()
  category_img: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type categoryDocument = Category & Document;