import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.interface';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminDocument } from './admin.schema';

@Injectable()
export class AdminService {
    constructor(@InjectModel('Admin') private adminModel: Model<Admin>) {}

    async create(admin: Admin): Promise<Admin> {
        const hashedPassword = await bcrypt.hash(admin.password, 10); 
        const createdAdmin = new this.adminModel({
            adminName: admin.adminName,
            password: hashedPassword, // Store the hashed password
          });
      return createdAdmin.save();
    }

    async findByAdminName(adminName: string): Promise<AdminDocument> {
        return this.adminModel.findOne({ adminName }).exec();
      }
}
