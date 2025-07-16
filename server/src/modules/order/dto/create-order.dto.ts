import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const OrderItemSchema = z.object({
  product: z.string(),
  quantity: z.number().min(1),
  selectedVariant: z.object({
    size: z.string().optional(),
    color: z.string().optional(),
  }).optional(),
  price: z.number().min(0),
});

export const CreateOrderSchema = z.object({
  user: z.string(),
  items: z.array(OrderItemSchema),
  shippingAddress: z.string(),
  totalPrice: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered']).optional(),
  paymentMethod: z.string().optional(),
  isPaid: z.boolean().optional(),
  paidAt: z.date().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export class CreateOrderZodDto extends createZodDto(CreateOrderSchema) {}

export const UpdateOrderSchema = CreateOrderSchema.partial();
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
export class UpdateOrderZodDto extends createZodDto(UpdateOrderSchema) {}
