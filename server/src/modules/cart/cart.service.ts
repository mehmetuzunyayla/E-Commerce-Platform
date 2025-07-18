import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCartByUser(userId: string): Promise<CartDocument> {
    let cart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    
    // Clean up malformed items - only remove items that are clearly malformed
    let hasChanges = false;
    cart.items = cart.items.filter(i => {
      // Skip if product is populated (object) - these are valid
      if (typeof i.product === 'object' && i.product !== null && !(i.product instanceof Types.ObjectId)) {
        return true;
      }
      
      // Handle ObjectId or string cases
      const itemProductId = i.product.toString();
      // Only remove items that are clearly malformed (contain newlines or are too long)
      if (itemProductId.includes('\n') || itemProductId.length > 24) {
        hasChanges = true;
        return false;
      }
      return true;
    });
    
    if (hasChanges) {
      await cart.save();
    }
    
    return cart as CartDocument;
  }

  async addItem(userId: string, item: any): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    
    // Clean up any malformed items before processing
    let hasChanges = false;
    cart.items = cart.items.filter(i => {
      const itemProductId = (i.product as any).toString();
      if (itemProductId.includes('\n') || itemProductId.length > 24) {
        hasChanges = true;
        return false;
      }
      return true;
    });
    
    if (hasChanges) {
      await cart.save();
    }
    
    // Convert item.product to ObjectId for proper comparison
    const productId = new Types.ObjectId(item.product);
    
    const index = cart.items.findIndex(i => {
      let itemProductId: string;
      
      // Handle different product formats
      if (typeof i.product === 'object' && i.product !== null) {
        // If product is populated (object), extract the _id
        if ((i.product as any)._id) {
          itemProductId = (i.product as any)._id.toString();
        } else {
          // If it's an ObjectId
          itemProductId = (i.product as any).toString();
        }
      } else {
        // If product is a string or ObjectId
        itemProductId = (i.product as any).toString();
      }
      
      const match = itemProductId === productId.toString();
      return match;
    });
    
    if (index >= 0) {
      cart.items[index].quantity += item.quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
      });
    }
    
    await cart.save();
    
    // Return populated cart without running cleanup again
    const finalCart = await this.cartModel
      .findOne({ user: userId })
      .populate('items.product')
      .exec();
    return finalCart as Cart;
  }

  async updateItem(userId: string, productId: string, update: any): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    const productObjectId = new Types.ObjectId(productId);
    
    const item = cart.items.find(i => {
      let itemProductId: string;
      
      // Handle different product formats
      if (typeof i.product === 'object' && i.product !== null) {
        // If product is populated (object), extract the _id
        if ((i.product as any)._id) {
          itemProductId = (i.product as any)._id.toString();
        } else {
          // If it's an ObjectId
          itemProductId = (i.product as any).toString();
        }
      } else {
        // If product is a string or ObjectId
        itemProductId = (i.product as any).toString();
      }
      
      return itemProductId === productObjectId.toString();
    });
    
    if (!item) throw new NotFoundException('Item not found in cart');
    Object.assign(item, update);
    await cart.save();
    // Return populated cart
    return this.getCartByUser(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    const productObjectId = new Types.ObjectId(productId);
    
    cart.items = cart.items.filter(i => {
      let itemProductId: string;
      
      // Handle different product formats
      if (typeof i.product === 'object' && i.product !== null) {
        // If product is populated (object), extract the _id
        if ((i.product as any)._id) {
          itemProductId = (i.product as any)._id.toString();
        } else {
          // If it's an ObjectId
          itemProductId = (i.product as any).toString();
        }
      } else {
        // If product is a string or ObjectId
        itemProductId = (i.product as any).toString();
      }
      
      return itemProductId !== productObjectId.toString();
    });
    
    await cart.save();
    // Return populated cart
    return this.getCartByUser(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    cart.items = [];
    await cart.save();
    // Return populated cart
    return this.getCartByUser(userId);
  }
}
