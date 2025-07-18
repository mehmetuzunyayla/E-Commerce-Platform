'use client';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { RootState } from '../features/store';
import { 
  removeFromCartAsync, 
  updateCartItemAsync, 
  clearCartAsync 
} from '../features/cart/cartSlice';
import { placeOrderAsync } from '../features/order/orderSlice';
import { Button, NumberInput, Text, Badge } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCart } from '../features/cart/cartSlice';

export default function Cart() {
  const { items, loading, error } = useSelector((state: RootState) => state.cart);
  const { loading: orderLoading, error: orderError } = useSelector((state: RootState) => state.order);
  const selectedAddressId = useSelector((state: RootState) => state.address.selectedAddressId);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const [ordered, setOrdered] = useState(false);
  const router = useRouter();
  
  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // Check if any items with variants are missing variant selection
  const hasUnselectedVariants = items.some(item => 
    item.product.variants && 
    item.product.variants.length > 0 && 
    !item.selectedVariant
  );

  // Fetch cart from backend when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart() as any);
    }
  }, [isAuthenticated, dispatch]);

  const handleCheckout = async () => {
    if (!items.length || !selectedAddressId) return;
    
    try {
      const result = await dispatch(placeOrderAsync({ items, total, addressId: selectedAddressId }));
      
      // Check if the order was created successfully
      if (placeOrderAsync.fulfilled.match(result)) {
        // Only clear cart and redirect if order was successful
        await dispatch(clearCartAsync() as any);
        setOrdered(true);
        router.push('/order-success');
      } else {
        // Order failed, don't clear cart or redirect
        console.error('Order creation failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // Don't clear cart or redirect on error
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const result = await dispatch(updateCartItemAsync({ productId, quantity }) as any);
    // Refetch cart after successful update to get latest state
    if (updateCartItemAsync.fulfilled.match(result)) {
      dispatch(fetchCart() as any);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const result = await dispatch(removeFromCartAsync(productId) as any);
    // Refetch cart after successful removal
    if (removeFromCartAsync.fulfilled.match(result)) {
      dispatch(fetchCart() as any);
    }
  };

  const handleClearCart = async () => {
    const result = await dispatch(clearCartAsync() as any);
    // Refetch cart after successful clear
    if (clearCartAsync.fulfilled.match(result)) {
      dispatch(fetchCart() as any);
    }
  };

  if (loading) return <div className="mt-10 text-lg font-semibold">Loading cart...</div>;
  
  if (!items.length)
    return <div className="mt-10 text-lg font-semibold">Your cart is empty.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <Text size="lg" color="dimmed" className="mb-4">
              Review your items and proceed to checkout
            </Text>
          </div>
          <div className="text-right">
            <Text size="sm" fw={600} className="text-gray-600">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </Text>
            <Text size="xs" color="dimmed">
              Total: ${total.toFixed(2)}
            </Text>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text size="sm" color="red" fw={500}>{error}</Text>
        </div>
      )}
      
      {/* Debug info - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600 font-medium">
            <div>Items count: {items.length}</div>
            <div>Total: ${total.toFixed(2)}</div>
            <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <div>Items: {items.map(item => `${item.product.name} (${item.quantity})`).join(', ')}</div>
            <div>Product IDs: {items.map(item => item.product._id).join(', ')}</div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {items.map(({ product, quantity, selectedVariant }, index) => (
          <div key={`${product._id}-${index}`} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            {/* Product Image */}
            <div className="flex-shrink-0">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:3001${product.images[0]}`}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {product.name || 'Unknown Product'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                ${product.price?.toFixed(2) || '0.00'} each
              </div>
              {/* Selected Variants */}
              {selectedVariant && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedVariant.size && (
                    <Badge size="xs" color="blue" variant="light">
                      Size: {selectedVariant.size}
                    </Badge>
                  )}
                  {selectedVariant.color && (
                    <Badge size="xs" color="blue" variant="light">
                      Color: {selectedVariant.color}
                    </Badge>
                  )}
                </div>
              )}
              {/* Missing Variants Warning */}
              {product.variants && product.variants.length > 0 && !selectedVariant && (
                <div className="mt-2">
                  <Text size="xs" color="red" fw={500}>
                    ⚠️ Please select size/color options
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="blue"
                    onClick={() => window.open(`/products/${product._id}`, '_blank')}
                    className="mt-1 p-0 h-auto"
                  >
                    Click to select options
                  </Button>
                </div>
              )}
              {product.stockQuantity !== undefined && (
                <Badge 
                  color={product.stockQuantity > 10 ? 'green' : product.stockQuantity > 0 ? 'yellow' : 'red'}
                  size="xs"
                  className="mt-2"
                >
                  {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                </Badge>
              )}
            </div>
            
            {/* Quantity and Actions */}
            <div className="flex items-center gap-2">
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
                disabled={loading}
                size="xs"
              />
              <Button 
                color="red" 
                size="sm"
                variant="outline"
                onClick={() => handleRemoveItem(product._id)}
                disabled={loading}
              >
                Remove
              </Button>
            </div>
            
            {/* Item Total */}
            <div className="text-right">
              <div className="font-bold text-gray-900">
                ${((product.price || 0) * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Cart Summary */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <Text fw={600} size="lg" className="text-gray-900">
                Order Summary
              </Text>
              <Text size="sm" color="dimmed" className="mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </Text>
            </div>
            <div className="text-right">
              <Text fw={700} size="xl" className="text-gray-900">
                ${total.toFixed(2)}
              </Text>
              <Text size="sm" color="dimmed">
                Total Amount
              </Text>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Checkout Button */}
            <Button
              color="blue"
              size="lg"
              onClick={handleCheckout}
              loading={orderLoading}
              disabled={!selectedAddressId || items.length === 0 || hasUnselectedVariants}
              fullWidth
            >
              {orderLoading ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
            
            {/* Address Selection Warning */}
            {!selectedAddressId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text size="sm" color="yellow" fw={500}>
                  Please select a shipping address to enable checkout.
                </Text>
              </div>
            )}
            
            {/* Variant Selection Warning */}
            {hasUnselectedVariants && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Text size="sm" color="yellow" fw={500}>
                  Please select size/color options for all products before checkout.
                </Text>
              </div>
            )}
            
            {/* Order Error */}
            {orderError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text size="sm" color="red" fw={500}>
                  {orderError}
                </Text>
              </div>
            )}
            
            {/* Order Success */}
            {ordered && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <Text size="sm" color="green" fw={500}>
                  Order placed successfully! You can view it in your profile.
                </Text>
              </div>
            )}
            
            {/* Clear Cart Button */}
            <Button 
              color="gray" 
              variant="outline"
              onClick={handleClearCart}
              disabled={loading}
              fullWidth
            >
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
