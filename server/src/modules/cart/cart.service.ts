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
    let cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    return cart as CartDocument;
  }


async addItem(userId: string, item: any): Promise<Cart> {

  const cart = await this.getCartByUser(userId);
  const index = cart.items.findIndex(i =>
    i.product.toString() === item.product &&
    (!item.selectedVariant ||
      (i.selectedVariant &&
        i.selectedVariant.size === item.selectedVariant.size &&
        i.selectedVariant.color === item.selectedVariant.color))
  );
  if (index >= 0) {
    cart.items[index].quantity += item.quantity;
  } else {
    
    cart.items.push({
      product: item.product,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant || null,
    });
  }
  await cart.save();
  return cart;
}


  async updateItem(userId: string, productId: string, update: any): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) throw new NotFoundException('Item not found in cart');
    Object.assign(item, update);
    await cart.save();
    return cart;
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    return cart;
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCartByUser(userId);
    cart.items = [];
    await cart.save();
    return cart;
  }
}
