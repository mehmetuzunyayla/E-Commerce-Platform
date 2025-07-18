import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateReviewSchema = z.object({
  user: z.string(),
  product: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
export class CreateReviewZodDto extends createZodDto(CreateReviewSchema) {}

export const UpdateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
export class UpdateReviewZodDto extends createZodDto(UpdateReviewSchema) {}
