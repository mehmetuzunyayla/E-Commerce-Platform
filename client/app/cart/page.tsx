'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { Button, Group, Text, Card, Stack, NumberInput, ActionIcon } from '@mantine/core';
import { IconUser, IconUserOff, IconTrash } from '@tabler/icons-react';
import AddressList from '../../components/AddressList';
import RequireAuth from '../../components/RequireAuth';
import GuestCheckout from '../../components/GuestCheckout';
import Recommendations from '../../components/Recommendations';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { removeFromCart, updateQuantity } from '../../features/cart/cartSlice';

const Cart = dynamic(() => import('../../components/Cart'), { ssr: false });

export default function CartPage() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'authenticated'>('guest');
  const dispatch = useAppDispatch();

  // Set checkout mode based on authentication status
  useEffect(() => {
    setCheckoutMode(isAuthenticated ? 'authenticated' : 'guest');
  }, [isAuthenticated]);

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-center">
        <Text size="xl" fw={700} mb="md">Your cart is empty</Text>
        <Text c="dimmed" mb="lg">Add some products to your cart to continue</Text>
        <Button component="a" href="/products">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Checkout Mode Selection - Only show if user is not authenticated */}
      {!isAuthenticated && (
        <Card shadow="sm" p="lg" mb="lg" className="border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Text size="xl" fw={700} className="text-gray-900 mb-2">Checkout Options</Text>
              <Text size="sm" color="dimmed">
                Choose how you'd like to complete your purchase
              </Text>
            </div>
          </div>
          <Group gap="md">
            <Button
              variant={checkoutMode === 'authenticated' ? 'filled' : 'outline'}
              leftSection={<IconUser size={16} />}
              onClick={() => setCheckoutMode('authenticated')}
              size="lg"
            >
              Sign In & Checkout
            </Button>
            <Button
              variant={checkoutMode === 'guest' ? 'filled' : 'outline'}
              leftSection={<IconUserOff size={16} />}
              onClick={() => setCheckoutMode('guest')}
              size="lg"
            >
              Guest Checkout
            </Button>
          </Group>
          
          <Stack gap="xs" mt="md">
            <Text size="sm" color="dimmed">
              {checkoutMode === 'authenticated' 
                ? 'Sign in to use your saved addresses and track orders'
                : 'Checkout without creating an account'
              }
            </Text>
          </Stack>
        </Card>
      )}

      {/* Checkout Content */}
      {checkoutMode === 'authenticated' ? (
        <RequireAuth>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Cart />
            </div>
            
            {/* Shipping Address */}
            <div className="lg:col-span-1">
              <Card shadow="sm" p="lg" className="border border-gray-200">
                <div className="mb-6">
                  <Text size="lg" fw={600} className="text-gray-900 mb-2">
                    Shipping Address
                  </Text>
                  <Text size="sm" color="dimmed">
                    Select your delivery address
                  </Text>
                </div>
                <AddressList selectable />
              </Card>
            </div>
          </div>
        </RequireAuth>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Guest Cart Display */}
          <div>
            <Card shadow="md" p="xl" radius="md">
              <Text size="xl" fw={700} mb="lg" c="blue">Your Cart</Text>
              <div className="space-y-4">
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
                        <Text size="xs" c="dimmed" mt={4}>${product.price} each</Text>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <NumberInput
                        value={quantity}
                        min={1}
                        max={product.stockQuantity || 999}
                        onChange={(val) => {
                          const newQuantity = Number(val);
                          if (newQuantity > 0 && newQuantity <= (product.stockQuantity || 999)) {
                            handleUpdateQuantity(product._id, newQuantity);
                          }
                        }}
                        styles={{
                          input: {
                            width: '60px',
                            minWidth: '60px',
                            maxWidth: '60px'
                          }
                        }}
                        size="xs"
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemoveItem(product._id)}
                        size="sm"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      <div className="text-right min-w-[80px]">
                        <Text fw={700} size="md">${(product.price * quantity).toFixed(2)}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <Text fw={600} size="lg" c="blue" ta="center">
                  Total: ${items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                </Text>
              </div>
              
              <div className="mt-4">
                <Button 
                  component="a" 
                  href="/products" 
                  variant="outline" 
                  fullWidth
                  size="md"
                >
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Guest Checkout Form */}
          <div>
            <GuestCheckout />
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-12">
        <Recommendations type="popular" limit={4} title="Complete Your Order" />
      </div>
    </div>
  );
}
