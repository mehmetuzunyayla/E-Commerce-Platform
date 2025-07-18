import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Base schema for common product fields
const ProductBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  images: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.number().min(0, 'Stock quantity must be non-negative'),
  specifications: z.array(
    z.object({
      key: z.string().min(1, 'Specification key is required'),
      value: z.string().min(1, 'Specification value is required')
    })
  ).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.string().optional()
    })
  ).optional(),
});

// Create schema - all required fields must be present
export const CreateProductSchema = ProductBaseSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.number().min(0, 'Stock quantity must be non-negative'),
});

// Update schema - all fields are optional but maintain validation when present
export const UpdateProductSchema = ProductBaseSchema.partial().extend({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  stockQuantity: z.number().min(0, 'Stock quantity must be non-negative').optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export class CreateProductZodDto extends createZodDto(CreateProductSchema) {}

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export class UpdateProductZodDto extends createZodDto(UpdateProductSchema) {}
