'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Image, Button, TextInput, Title, Text, Badge } from '@mantine/core';
import api from '../lib/api';

import Recommendations from '../components/Recommendations';

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [featuredRes, categoriesRes, newArrivalsRes, popularRes] = await Promise.all([
        api.get('/products?featured=true').catch(() => ({ data: [] })),
        api.get('/categories', { 
          params: { _t: Date.now(), _r: Math.random() },
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }).catch(() => ({ data: [] })),
        api.get('/products?sort=newest&limit=4').catch(() => ({ data: [] })),
        api.get('/products?sort=popular&limit=4').catch(() => ({ data: [] }))
      ]);
      
      setFeatured(featuredRes.data);
      setCategories(categoriesRes.data);
      setNewArrivals(newArrivalsRes.data);
      setPopular(popularRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Refresh data when page becomes visible (for new categories)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);





  if (loading) {
    return (
      <div className="space-y-12">
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-4 text-center rounded-lg">
          <Title order={1} size="3rem" fw={900} mb="md">Shop the Best Products</Title>
          <Text size="xl" mb="xl">Discover top deals, new arrivals, and exclusive items for every category!</Text>
          <Button component={Link} href="/products" size="lg" color="blue">Shop Now</Button>
        </section>
        
        <div className="text-center py-12">
          <Text size="xl">Loading products...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-12">
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-4 text-center rounded-lg">
          <Title order={1} size="3rem" fw={900} mb="md">Shop the Best Products</Title>
          <Text size="xl" mb="xl">Discover top deals, new arrivals, and exclusive items for every category!</Text>
          <Button component={Link} href="/products" size="lg" color="blue">Shop Now</Button>
        </section>
        
        <Card p="md" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
          <Title order={3} c="red" mb="md">Error Loading Data</Title>
          <Text c="red" mb="md">{error}</Text>
          <Text size="sm" mb="md">Please make sure the backend server is running on http://localhost:3001</Text>
          <Button component={Link} href="/test-api" color="red" variant="outline">
            Test API Connection
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100 py-16 px-4 text-center rounded-lg">
        <Title order={1} size="3rem" fw={900} mb="md">Shop the Best Products</Title>
        <Text size="xl" mb="xl">Discover top deals, new arrivals, and exclusive items for every category!</Text>
        <Button component={Link} href="/products" size="lg" color="blue">Shop Now</Button>
      </section>

      {/* Categories Grid */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <Text size="4rem" fw={900} style={{ fontSize: '2rem', fontWeight: 900 }}>Categories</Text>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              fetchData();
            }}
          >
            Refresh Categories
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 12).map((cat: any) => (
            <Link key={cat._id} href={`/category/${cat._id}`}>
              <Card shadow="md" p="xs" className="hover:shadow-xl cursor-pointer h-full">
                <Text fw={700} size="md" mb="xs">{cat.name}</Text>
                <Text size="sm" c="dimmed" lineClamp={2} mb="xs">{cat.description}</Text>
                <div className="overflow-hidden rounded">
                  {cat.image ? (
                    <Image 
                      src={`http://localhost:3001${cat.image}`} 
                      height={80} 
                      width="100%"
                      fit="cover"
                      alt={cat.name}
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                    />
                  ) : (
                    <div className="h-20 bg-gray-100 flex items-center justify-center rounded">
                      <Text size="sm" c="dimmed">No Image</Text>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <Text size="4rem" fw={900} mb="lg" style={{ fontSize: '2rem', fontWeight: 900 }}>Featured Products</Text>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featured.map((prod: any) => (
            <Link key={prod._id} href={`/products/${prod._id}`}>
              <Card shadow="md" p="md" className="hover:shadow-xl cursor-pointer">
                <Image src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} height={120} alt={prod.name} />
                <Text fw={700} mt="md">{prod.name}</Text>
                <Text c="dimmed" size="sm" mb="sm" lineClamp={2}>{prod.description}</Text>
                <Text fw={700}>${prod.price}</Text>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <Title order={2} size="xl" mb="md">New Arrivals</Title>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {newArrivals.map((prod: any) => (
            <Link key={prod._id} href={`/products/${prod._id}`}>
              <Card shadow="sm" p="md" className="hover:shadow-lg cursor-pointer">
                <Image src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} height={100} alt={prod.name} />
                <Text fw={700} mt="md">{prod.name}</Text>
                <Text c="dimmed" size="sm" mb="sm" lineClamp={2}>{prod.description}</Text>
                <Text fw={700}>${prod.price}</Text>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section>
        <Title order={2} size="xl" mb="md">Popular Products</Title>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {popular.map((prod: any) => (
            <Link key={prod._id} href={`/products/${prod._id}`}>
              <Card shadow="sm" p="md" className="hover:shadow-lg cursor-pointer">
                <Image src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} height={100} alt={prod.name} />
                <Text fw={700} mt="md">{prod.name}</Text>
                <Text c="dimmed" size="sm" mb="sm" lineClamp={2}>{prod.description}</Text>
                <Text fw={700}>${prod.price}</Text>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <Recommendations type="popular" limit={8} title="You May Also Like" />
      </section>


    </div>
  );
}
