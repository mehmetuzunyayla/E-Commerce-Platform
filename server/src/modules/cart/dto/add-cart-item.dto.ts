import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AddCartItemSchema = z.object({
  product: z.string(),
  quantity: z.number().min(1),
  selectedVariant: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
});

export type AddCartItemDto = z.infer<typeof AddCartItemSchema>;
export class AddCartItemZodDto extends createZodDto(AddCartItemSchema) {}

export const UpdateCartItemSchema = AddCartItemSchema.partial();
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
export class UpdateCartItemZodDto extends createZodDto(UpdateCartItemSchema) {}
