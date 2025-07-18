'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../features/store';
import { removeFromWishlist } from '../../../features/wishlist/wishlistSlice';
import Link from 'next/link';
import { Card, Image, Button, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const [products, setProducts] = useState<any[]>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch all products in the wishlist
    if (wishlist.length) {
      // Use the correct API endpoint
      fetch(`http://localhost:3001/api/products?ids=${wishlist.join(',')}`)
        .then(res => res.json())
        .then(data => {
          // Handle both array and object responses
          const products = Array.isArray(data) ? data : (data.products || []);
          setProducts(products);
        })
        .catch(error => {
          console.error('Error fetching wishlist products:', error);
          setProducts([]);
        });
    } else {
      setProducts([]);
    }
  }, [wishlist]);

  if (!wishlist.length) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-center">
        <Text size="xl" fw={700} mb="md">Your wishlist is empty</Text>
        <Text c="dimmed" mb="lg">Add some products to your wishlist to see them here</Text>
        <Button component="a" href="/products">
          Browse Products
        </Button>
      </div>
    );
  }

  if (products.length === 0 && wishlist.length > 0) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 text-center">
        <Text size="xl" fw={700} mb="md">Loading wishlist...</Text>
        <Text c="dimmed">Please wait while we load your wishlist items</Text>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="mb-6">
        <Text size="2xl" fw={700} mb="xs">My Wishlist</Text>
        <Text c="dimmed">Your saved products ({products.length} items)</Text>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(prod => (
          <Card key={prod._id} shadow="md" p="md" radius="md" withBorder>
            <div className="relative">
              <Image 
                src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} 
                height={200} 
                alt={prod.name}
                radius="sm"
                className="mb-3"
              />
              <Button
                size="xs"
                color="red"
                variant="filled"
                className="absolute top-2 right-2"
                onClick={() => dispatch(removeFromWishlist(prod._id))}
              >
                Remove
              </Button>
            </div>
            
            <Link href={`/products/${prod._id}`} className="block">
              <Text fw={600} size="md" className="mb-2 hover:text-blue-600 transition-colors">
                {prod.name}
              </Text>
            </Link>
            
            <Text c="dimmed" size="sm" mb="sm" lineClamp={2}>
              {prod.description}
            </Text>
            
            <Text fw={700} size="lg" c="blue" mb="sm">
              ${prod.price?.toFixed(2)}
            </Text>
            
            <Button
              component={Link}
              href={`/products/${prod._id}`}
              variant="outline"
              fullWidth
              size="sm"
            >
              View Details
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
