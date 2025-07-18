import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  label: z.string().optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(5),
  addresses: z.array(AddressSchema).optional(),
  role: z.enum(['admin', 'customer']).optional(),
  favoriteCategories: z.array(z.string()).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export class CreateUserZodDto extends createZodDto(CreateUserSchema) {}

export const UpdateUserSchema = CreateUserSchema.partial();
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export class UpdateUserZodDto extends createZodDto(UpdateUserSchema) {}

// Separate schemas for address operations
export const CreateAddressSchema = AddressSchema;
export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export class CreateAddressZodDto extends createZodDto(CreateAddressSchema) {}

export const UpdateAddressSchema = AddressSchema.partial();
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
export class UpdateAddressZodDto extends createZodDto(UpdateAddressSchema) {}
