import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  images: z.array(z.string()).optional(),
  category: z.string(),
  stockQuantity: z.number().min(0),
  specifications: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  ).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(
    z.object({
      size: z.string(),
      color: z.string()
    })
  ).optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export class CreateProductZodDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = CreateProductSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export class UpdateProductZodDto extends createZodDto(UpdateProductSchema) {}
