import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: Object, default: null })
  selectedVariant?: { size?: string; color?: string } | null;

  @Prop({ required: true })
  price: number; // snapshot price at order time
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user: Types.ObjectId;

  @Prop({ type: Object, required: false })
  guestInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    fullName: string;
  };

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  shippingAddress: string;

  @Prop()
  addressLabel: string;

  @Prop()
  addressId: string;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' })
  status: string;

  @Prop({ default: 'cash' })
  paymentMethod: string;

  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
