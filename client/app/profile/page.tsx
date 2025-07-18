'use client';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '../../features/store';
import { fetchOrdersAsync } from '../../features/order/orderSlice';
import AddressForm from '../../components/AddressForm';
import AddressList from '../../components/AddressList';
import Link from 'next/link';
import ProfileEditForm from '../../components/ProfileEditForm';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector((state: RootState) => state.order);

  useEffect(() => {
    dispatch(fetchOrdersAsync() as any);
  }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="mb-8">
        <span className="font-semibold">Email:</span> {user?.email}
      </div>
      <div>
      <h2 className="text-xl font-bold mb-2">Edit Profile</h2>
      <ProfileEditForm />
      </div>
      {/* Addresses Section */}
      <div>
        <h2 className="text-xl font-bold mb-2">Your Addresses</h2>
        <AddressList />
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Add Address</h3>
          <AddressForm />
        </div>
      </div>
      <Link href="/profile/wishlist" className="text-blue-600 underline">My Wishlist</Link>

      {/* Orders Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Order History</h2>
        {loading && <div>Loading orders...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!orders.length && !loading ? (
          <div>No orders yet.</div>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order._id} className="border-b py-4">
                <div>
                  <Link href={`/orders/${order._id}`} className="text-blue-600 underline font-semibold">
                    Order
                  </Link>
                  {' - '}
                  {new Date(order.createdAt).toLocaleString()}
                </div>
                <div>Status: {order.status}</div>
                <div>
                  Shipping Address: 
                  <button 
                    className="text-blue-600 underline ml-1"
                    onClick={() => {
                      // Handle both old and new order formats
                      if (order.addressLabel && order.shippingAddress) {
                        // New format: show label and full address
                        const fullAddress = order.shippingAddress;
                        const addressLabel = order.addressLabel;
                        alert(`${addressLabel}\n\n${fullAddress}`);
                      } else if (order.shippingAddress && order.shippingAddress.includes('Address ID:')) {
                        // Old format: extract address ID and show it
                        const addressIdMatch = order.shippingAddress.match(/Address ID: ([a-f0-9]+)/);
                        if (addressIdMatch) {
                          const addressId = addressIdMatch[1];
                          alert(`Address ID: ${addressId}\n\nThis is an older order. The full address details are not available.`);
                        } else {
                          alert(order.shippingAddress);
                        }
                      } else {
                        // Fallback: show whatever address info we have
                        alert(order.shippingAddress || 'No address information available');
                      }
                    }}
                  >
                    {order.addressLabel || 'View Address Details'}
                  </button>
                </div>
                <ul className="ml-4">
                  {order.items.map(({ product, quantity }) => (
                    <li key={product._id}>
                      {product.name || 'Unknown Product'} x {quantity} = ${(product.price || 0) * quantity}
                    </li>
                  ))}
                </ul>
                <div className="mt-1 font-bold">Total: ${order.totalPrice.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
