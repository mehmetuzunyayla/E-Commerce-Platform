// client/lib/api.ts
import axios from 'axios';



const api = axios.create({
  baseURL: process.env.BACKEND_URL || 'http://localhost:3001/api',
  withCredentials: true,
});


// Automatically add token to requests (if present) - only on client side
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function fetchProducts() {
  const { data } = await api.get('/products');
  return data;
}



export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return data;
}

export async function fetchProduct(id: string) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function fetchCategory(id: string) {
  const { data } = await api.get(`/categories/${id}`);
  return data;
}


export async function createOrder(orderData: any) {
  
  // Transform cart items to match backend expectations
  const items = orderData.items.map((item: any) => {
    const itemData: any = {
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price, // Add price snapshot
    };
    
    // Only add selectedVariant if it exists and has content
    if (item.selectedVariant && Object.keys(item.selectedVariant).length > 0) {
      itemData.selectedVariant = item.selectedVariant;
    }
    
    return itemData;
  });

  // Calculate total price
  const totalPrice = orderData.items.reduce(
    (sum: number, item: any) => sum + (item.product.price || 0) * item.quantity,
    0
  );

  // Get shipping address from addressId
  let shippingAddress = '';
  let addressLabel = '';
  if (orderData.addressId) {
    try {
      // Get current user ID from localStorage or state
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Decode token to get user ID (simplified approach)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.sub || payload.id;
        
        // Fetch the selected address
        const { data: addresses } = await api.get(`/users/${userId}/addresses`);
        const selectedAddress = addresses.find((addr: any) => addr._id === orderData.addressId);
        
        if (selectedAddress) {
          shippingAddress = `${selectedAddress.fullName}, ${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.zip}, ${selectedAddress.country}`;
          addressLabel = selectedAddress.label || 'Address';
        } else {
          shippingAddress = `Address ID: ${orderData.addressId}`;
          addressLabel = 'Unknown Address';
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      // If we can't fetch the address, use a fallback
      shippingAddress = `Address ID: ${orderData.addressId}`;
      addressLabel = 'Unknown Address';
    }
  }

  const orderPayload = {
    items,
    totalPrice,
    shippingAddress,
    addressLabel,
    addressId: orderData.addressId,
    paymentMethod: 'cash', // Default payment method
    status: 'pending'
  };

  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const { data } = await api.post('/orders', orderPayload, config);
  return data;
}

export async function fetchOrders() {
  // Get current user ID from token
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('User not authenticated');
  }
  
  // Decode token to get user ID
  const payload = JSON.parse(atob(token.split('.')[1]));
  
  // Try different possible field names for user ID
  const userId = payload.userId || payload.sub || payload.id;
  
  try {
    const { data } = await api.get(`/orders/user/${userId}`);
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}
export default api;
