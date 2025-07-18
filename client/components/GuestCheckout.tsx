'use client';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { RootState } from '../features/store';
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice';
import { placeOrderAsync } from '../features/order/orderSlice';
import { 
  Button, NumberInput, TextInput, Textarea, Group, 
  Stack, Text, Divider, Badge, Card 
} from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const guestCheckoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
});

type GuestCheckoutForm = z.infer<typeof guestCheckoutSchema>;

export default function GuestCheckout() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { loading, error } = useSelector((state: RootState) => state.order);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GuestCheckoutForm>({
    resolver: zodResolver(guestCheckoutSchema),
  });

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleGuestCheckout = async (data: GuestCheckoutForm) => {
    if (!items.length) return;

    const guestOrder = {
      items,
      total,
      guestInfo: {
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      },
    };

    try {
      // Use the guest endpoint directly instead of Redux action
      const response = await fetch('http://localhost:3001/api/orders/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestOrder),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const orderResult = await response.json();

      
      dispatch(clearCart());
      router.push('/order-success');
    } catch (error) {
      console.error('Guest checkout error:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (!items.length) {
    return (
      <div className="text-center py-20">
        <Text size="xl" fw={700} mb="md">Your cart is empty</Text>
        <Text c="dimmed" mb="lg">Add some products to your cart to continue</Text>
        <Button component="a" href="/products">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="mb-6">
        <Text size="2xl" fw={700} ta="center" mb="xs">Checkout</Text>
        <Text c="dimmed" ta="center">Complete your purchase</Text>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Guest Checkout Form */}
        <div>
          <Card shadow="md" p="xl" radius="md">
            <Text size="xl" fw={700} mb="lg" c="blue">Guest Checkout</Text>
            
            <form onSubmit={handleSubmit(handleGuestCheckout)}>
              <Stack gap="md">
                {/* Personal Information */}
                <div>
                  <Text fw={600} mb="sm">Personal Information</Text>
                  <Group grow>
                    <TextInput
                      label="First Name"
                      placeholder="John"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </Group>
                  <Group grow mt="sm">
                    <TextInput
                      label="Email"
                      placeholder="john@example.com"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                    <TextInput
                      label="Phone"
                      placeholder="+1 (555) 123-4567"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </Group>
                </div>

                <Divider />

                {/* Shipping Address */}
                <div>
                  <Text fw={600} mb="sm">Shipping Address</Text>
                  <Textarea
                    label="Address"
                    placeholder="123 Main St, Apt 4B"
                    {...register('address')}
                    error={errors.address?.message}
                  />
                  <TextInput
                    label="City"
                    placeholder="New York"
                    {...register('city')}
                    error={errors.city?.message}
                  />
                  <Group grow mt="sm">
                    <TextInput
                      label="ZIP Code"
                      placeholder="10001"
                      {...register('zipCode')}
                      error={errors.zipCode?.message}
                    />
                    <TextInput
                      label="Country"
                      placeholder="United States"
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </Group>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  disabled={items.length === 0}
                  fullWidth
                  color="blue"
                  radius="md"
                  fw={600}
                >
                  Place Order - ${(total * 1.08).toFixed(2)}
                </Button>

                {error && (
                  <Text c="red" size="sm" ta="center">
                    {error}
                  </Text>
                )}
              </Stack>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card shadow="md" p="xl" radius="md">
            <Text size="xl" fw={700} mb="lg" c="green">Order Summary</Text>
            
            <Stack gap="md">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border shadow-sm">
                      {product.images?.[0] ? (
                        <img 
                          src={`http://localhost:3001${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Text size="xs" c="dimmed">No image</Text>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Text fw={600} size="sm" lineClamp={2}>{product.name}</Text>
                      <Text size="xs" c="dimmed" mt={4}>Qty: {quantity}</Text>
                      <Text size="xs" c="dimmed">${product.price} each</Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Text fw={700} size="md">${(product.price * quantity).toFixed(2)}</Text>
                  </div>
                </div>
              ))}

              <Divider />

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <Text size="sm">Subtotal</Text>
                  <Text size="sm">${total.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm">Shipping</Text>
                  <Text size="sm" c="green" fw={600}>Free</Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm">Tax (8%)</Text>
                  <Text size="sm">${(total * 0.08).toFixed(2)}</Text>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <Text fw={700} size="lg">Total</Text>
                  <Text fw={700} size="lg" c="blue">${(total * 1.08).toFixed(2)}</Text>
                </div>
              </div>

              <Badge color="blue" variant="light" size="sm">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Badge>
            </Stack>
          </Card>

          {/* Guest Checkout Benefits */}
          <Card shadow="sm" p="md" mt="md" radius="md" withBorder>
            <Text fw={600} mb="sm" c="blue">Guest Checkout Benefits</Text>
            <Stack gap="xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text size="sm">No account required</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text size="sm">Quick checkout process</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text size="sm">Order tracking available</Text>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <Text size="sm">Secure payment processing</Text>
              </div>
            </Stack>
          </Card>
        </div>
      </div>
    </div>
  );
} 