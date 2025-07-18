'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Image, Text, Badge, Group, Stack, Title } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import api from '../lib/api';

interface RecommendationsProps {
  type: 'popular' | 'frequently-bought' | 'similar';
  productId?: string;
  limit?: number;
  title?: string;
}

export default function Recommendations({ 
  type, 
  productId, 
  limit = 4, 
  title 
}: RecommendationsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let endpoint = '';
        
        switch (type) {
          case 'popular':
            endpoint = `/recommendations/popular?limit=${limit}`;
            break;
          case 'frequently-bought':
            endpoint = `/recommendations/frequently-bought-together/${productId}?limit=${limit}`;
            break;
          case 'similar':
            endpoint = `/products?category=${productId}&limit=${limit}`;
            break;
        }

        const response = await api.get(endpoint);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to popular products if recommendations fail
        if (type !== 'popular') {
          try {
            const response = await api.get(`/recommendations/popular?limit=${limit}`);
            setProducts(response.data);
          } catch (fallbackError) {
            console.error('Fallback recommendations failed:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (type === 'frequently-bought' && !productId) return;
    
    fetchRecommendations();
  }, [type, productId, limit]);

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };

  const renderStars = (rating: number) => {
    return (
      <Group gap={2}>
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStar
            key={star}
            size={12}
            fill={star <= rating ? '#ffd700' : 'transparent'}
            color={star <= rating ? '#ffd700' : '#ddd'}
          />
        ))}
        <Text size="xs" c="dimmed">({rating})</Text>
      </Group>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Title order={3} size="lg">{title || 'Recommendations'}</Title>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} shadow="sm" p="md" className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Title order={3} size="lg">
        {title || 
          (type === 'popular' && 'Popular Products') ||
          (type === 'frequently-bought' && 'Frequently Bought Together') ||
          (type === 'similar' && 'Similar Products') ||
          'Recommendations'
        }
      </Title>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const avgRating = getAverageRating(product.reviews || []);
          const isOutOfStock = (product.stockQuantity || 0) <= 0;
          
          return (
            <Link key={product._id} href={`/products/${product._id}`}>
              <Card shadow="sm" p="md" className="hover:shadow-md cursor-pointer transition-shadow">
                {isOutOfStock && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge color="red" size="xs">Out of Stock</Badge>
                  </div>
                )}

                
                <Image 
                  src={product.images?.[0] ? `http://localhost:3001${product.images[0]}` : '/placeholder.png'} 
                  height={120} 
                  alt={product.name}
                  className={isOutOfStock ? 'opacity-50' : ''}
                />
                
                <Stack gap="xs" mt="sm">
                  <Text fw={600} size="sm" lineClamp={1}>{product.name}</Text>
                  <Text c="dimmed" size="xs" lineClamp={2}>{product.description}</Text>
                  
                  {avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      {renderStars(avgRating)}
                    </div>
                  )}
                  
                  <Group justify="space-between" align="center">
                    <Text fw={700}>${product.price}</Text>
                    <Badge 
                      color={product.stockQuantity > 10 ? 'green' : product.stockQuantity > 0 ? 'yellow' : 'red'}
                      size="xs"
                    >
                      {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Out of stock'}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 