import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export class CreateCategoryZodDto extends createZodDto(CreateCategorySchema) {}

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export class UpdateCategoryZodDto extends createZodDto(UpdateCategorySchema) {}
