import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductSpecification {
  @Prop({ required: true })
  key: string;
  @Prop({ required: true })
  value: string;
}
const ProductSpecificationSchema = SchemaFactory.createForClass(ProductSpecification);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [{ type: String }], default: [] })
  images: string[]; // Array of image URLs

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true })
  stockQuantity: number;

  @Prop({ type: [ProductSpecificationSchema], default: [] })
  specifications: ProductSpecification[];

  @Prop({ type: [{ type: String }], default: [] })
  tags: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ type: [{ size: String, color: String }], default: [] })
  variants: { size: string; color: string }[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
