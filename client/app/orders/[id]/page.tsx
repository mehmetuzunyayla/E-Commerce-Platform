'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../lib/api';
import { Button } from '@mantine/core';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = Array.isArray(params?.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Order</h1>
      <div>Status: <span className="font-semibold">{order.status}</span></div>
      <div>Date: {new Date(order.createdAt).toLocaleString()}</div>
      {order.guestInfo && (
        <div className="my-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Guest Order</h3>
          <div className="space-y-1 text-sm">
            <div><strong>Name:</strong> {order.guestInfo.fullName || `${order.guestInfo.firstName} ${order.guestInfo.lastName}`}</div>
            <div><strong>Email:</strong> {order.guestInfo.email}</div>
            {order.guestInfo.phone && <div><strong>Phone:</strong> {order.guestInfo.phone}</div>}
          </div>
        </div>
      )}
      <div className="my-4">
        <h2 className="text-lg font-semibold">Shipping Address</h2>
        <div>
          <button 
            className="text-blue-600 underline"
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
      </div>
      <div>
        <h2 className="text-lg font-semibold">Order Items</h2>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.product._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              {item.product?.images?.[0] && (
                <img 
                  src={item.product.images[0].startsWith('http') ? item.product.images[0] : `http://localhost:3001${item.product.images[0]}`}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.png';
                  }}
                />
              )}
              <div className="flex-1">
                <div className="font-semibold">{item.product.name || 'Unknown Product'}</div>
                <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                <div className="text-sm text-gray-600">Price: ${item.price?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="font-bold">
                ${((item.price || 0) * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 font-bold">Total: ${order.totalPrice.toFixed(2)}</div>
      <Link href="/profile">
        <Button className="mt-8" color="blue">Back to Profile</Button>
      </Link>
    </div>
  );
}
