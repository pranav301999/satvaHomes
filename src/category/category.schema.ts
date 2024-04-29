import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Category extends Document {
  // @Prop({ type: Types.ObjectId, auto: true })
  // categoryId: Types.ObjectId;


  @Prop()
  categoryName: string;

  @Prop()
  description: string;

  @Prop()
  category_img: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
export type categoryDocument = Category & Document;


