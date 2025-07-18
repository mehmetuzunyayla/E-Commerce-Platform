// client/lib/zodSchemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  phone: z.string().min(10, { message: 'Phone number is required' }),
});
export const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name required" }),
  email: z.string().email({ message: "Invalid email address" }),
  // Password change is optional
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
});
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(3, { message: "Comment required" }),
});

// For type safety in your app:
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;