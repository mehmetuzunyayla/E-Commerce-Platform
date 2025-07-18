import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './wishlist.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
  ) {}

  async getWishlistByUser(userId: string): Promise<WishlistDocument> {
    let wishlist = await this.wishlistModel
      .findOne({ user: userId })
      .populate('items')
      .exec();
    
    if (!wishlist) {
      wishlist = await this.wishlistModel.create({ user: userId, items: [] });
    }
    
    return wishlist;
  }

  async addToWishlist(userId: string, productId: string): Promise<WishlistDocument> {
    const wishlist = await this.getWishlistByUser(userId);
    
    if (!wishlist.items.some(item => item.toString() === productId)) {
      wishlist.items.push(new Types.ObjectId(productId));
      await wishlist.save();
    }
    
    return wishlist.populate('items');
  }

  async removeFromWishlist(userId: string, productId: string): Promise<WishlistDocument> {
    const wishlist = await this.getWishlistByUser(userId);
    
    wishlist.items = wishlist.items.filter(item => item.toString() !== productId);
    await wishlist.save();
    
    return wishlist.populate('items');
  }

  async updateWishlist(userId: string, productIds: string[]): Promise<WishlistDocument> {
    const wishlist = await this.getWishlistByUser(userId);
    
    wishlist.items = productIds.map(id => new Types.ObjectId(id));
    await wishlist.save();
    
    return wishlist.populate('items');
  }

  async clearWishlist(userId: string): Promise<WishlistDocument> {
    const wishlist = await this.getWishlistByUser(userId);
    
    wishlist.items = [];
    await wishlist.save();
    
    return wishlist;
  }
} 