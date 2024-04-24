import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Category } from './category.interface';
import * as Grid from 'gridfs-stream';




@Injectable()
export class CategoryService {

  constructor(@InjectModel('Category') private readonly categoryModel: Model<Category>) {}

  async create(category: Category): Promise<Category> {
    console.log(category);
    
    const createdCategory = new this.categoryModel({
      categoryId:category.categoryId,
      categoryName:category.categoryName,
      description:category.description,  
      category_img:category.category_img   
    });
    return createdCategory.save();
  }

  

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }

  async update(id: string, category: Category): Promise<Category> {
    return this.categoryModel.findByIdAndUpdate(id, category, { new: true }).exec();
  }

}
