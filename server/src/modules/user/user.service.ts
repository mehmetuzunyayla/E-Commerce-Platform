import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, Address } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    return this.userModel.create(userData);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ emailVerificationToken: token }).exec();
  }

  async update(id: string, update: Partial<User>): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('User not found');
  }

  // Address management methods
  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.findById(userId);
    return user.addresses || [];
  }

  async addAddress(userId: string, addressData: Partial<Address>): Promise<User> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { addresses: addressData } },
      { new: true }
    ).exec();
    
    if (!result) throw new NotFoundException('User not found');
    return result;
  }

  async updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Promise<User> {
    const result = await this.userModel.findOneAndUpdate(
      { 
        _id: userId, 
        'addresses._id': addressId 
      },
      { 
        $set: { 
          'addresses.$': { ...addressData, _id: addressId } 
        } 
      },
      { new: true }
    ).exec();
    
    if (!result) throw new NotFoundException('Address not found');
    return result;
  }

  async deleteAddress(userId: string, addressId: string): Promise<User> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).exec();
    
    if (!result) throw new NotFoundException('User not found');
    return result;
  }
}
