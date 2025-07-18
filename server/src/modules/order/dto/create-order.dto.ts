import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const OrderItemSchema = z.object({
  product: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema),
  shippingAddress: z.string(),
  addressLabel: z.string().optional(),
  addressId: z.string().optional(),
  totalPrice: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).optional(),
  paymentMethod: z.string().optional(),
  isPaid: z.boolean().optional(),
  paidAt: z.date().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export class CreateOrderZodDto extends createZodDto(CreateOrderSchema) {}

// Separate schema for status updates
export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
export class UpdateOrderStatusZodDto extends createZodDto(UpdateOrderStatusSchema) {}

export const UpdateOrderSchema = CreateOrderSchema.partial();
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export class UpdateOrderZodDto extends createZodDto(UpdateOrderSchema) {}
