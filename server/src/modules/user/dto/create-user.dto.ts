import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(5),
  addresses: z.array(
    z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string()
    })
  ).optional(),
  role: z.enum(['admin', 'customer']).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export class CreateUserZodDto extends createZodDto(CreateUserSchema) {}

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export class UpdateUserZodDto extends createZodDto(UpdateUserSchema) {}
