import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(5),
});
export class RegisterZodDto extends createZodDto(RegisterSchema) {}

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export class LoginZodDto extends createZodDto(LoginSchema) {}
