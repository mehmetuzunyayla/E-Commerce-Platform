'use client';
import { useEffect, useState } from 'react';
import { Card, Title, Text, Group, Button, Image, Badge } from '@mantine/core';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import RequireAdmin from '../../../components/RequireAdmin';
import api from '../../../lib/api';

export default function ImageStatusPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const testImageUrl = (imagePath: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = `http://localhost:3001${imagePath}`;
    });
  };

  if (loading) {
    return (
      <RequireAdmin>
        <div className="p-8">
          <Text>Loading image status...</Text>
        </div>
      </RequireAdmin>
    );
  }

  const productsWithImages = products.filter(p => p.images && p.images.length > 0);
  const productsWithoutImages = products.filter(p => !p.images || p.images.length === 0);
  const categoriesWithImages = categories.filter(c => c.image);
  const categoriesWithoutImages = categories.filter(c => !c.image);

  return (
    <RequireAdmin>
      <div className="max-w-6xl mx-auto p-6">
        <Title mb="xl">Image Upload Status</Title>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products Status */}
          <Card p="md" withBorder>
            <Title order={3} mb="md">Products</Title>
            
            <Group mb="md">
              <Badge color="green" size="lg">
                {productsWithImages.length} with images
              </Badge>
              <Badge color="red" size="lg">
                {productsWithoutImages.length} without images
              </Badge>
            </Group>

            <Text size="sm" mb="md">
              Total products: {products.length}
            </Text>

            {/* Products with Images */}
            {productsWithImages.length > 0 && (
              <div className="mb-4">
                <Text size="sm" fw={600} mb="xs">Products with Images:</Text>
                <div className="space-y-2">
                  {productsWithImages.slice(0, 5).map(product => (
                    <div key={product._id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Image 
                        src={`http://localhost:3001${product.images[0]}`}
                        width={40}
                        height={40}
                        fit="cover"
                        radius="sm"
                      />
                      <div>
                        <Text size="sm" fw={500}>{product.name}</Text>
                        <Text size="xs" c="dimmed">{product.images.length} image(s)</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products without Images */}
            {productsWithoutImages.length > 0 && (
              <div>
                <Text size="sm" fw={600} mb="xs">Products without Images:</Text>
                <div className="space-y-1">
                  {productsWithoutImages.slice(0, 5).map(product => (
                    <div key={product._id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <IconX size={16} color="gray" />
                      </div>
                      <Text size="sm">{product.name}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Categories Status */}
          <Card p="md" withBorder>
            <Title order={3} mb="md">Categories</Title>
            
            <Group mb="md">
              <Badge color="green" size="lg">
                {categoriesWithImages.length} with images
              </Badge>
              <Badge color="red" size="lg">
                {categoriesWithoutImages.length} without images
              </Badge>
            </Group>

            <Text size="sm" mb="md">
              Total categories: {categories.length}
            </Text>

            {/* Categories with Images */}
            {categoriesWithImages.length > 0 && (
              <div className="mb-4">
                <Text size="sm" fw={600} mb="xs">Categories with Images:</Text>
                <div className="space-y-2">
                  {categoriesWithImages.slice(0, 5).map(category => (
                    <div key={category._id} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <Image 
                        src={`http://localhost:3001${category.image}`}
                        width={40}
                        height={40}
                        fit="cover"
                        radius="sm"
                      />
                      <Text size="sm" fw={500}>{category.name}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories without Images */}
            {categoriesWithoutImages.length > 0 && (
              <div>
                <Text size="sm" fw={600} mb="xs">Categories without Images:</Text>
                <div className="space-y-1">
                  {categoriesWithoutImages.slice(0, 5).map(category => (
                    <div key={category._id} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <IconX size={16} color="gray" />
                      </div>
                      <Text size="sm">{category.name}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Storage Information */}
        <Card p="md" withBorder className="mt-6">
          <Title order={3} mb="md">Storage Information</Title>
          <div className="space-y-2 text-sm">
            <Text><strong>File Storage:</strong> Images are saved to <code>server/uploads/products/</code> and <code>server/uploads/categories/</code></Text>
            <Text><strong>Database Storage:</strong> Image paths are saved in the database and persist across server restarts</Text>
            <Text><strong>URL Format:</strong> <code>http://localhost:3001/uploads/products/filename.jpg</code></Text>
            <Text><strong>File Size Limit:</strong> 2MB per image</Text>
            <Text><strong>Supported Formats:</strong> JPG, PNG, WebP, GIF</Text>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card p="md" withBorder className="mt-6">
          <Title order={3} mb="md">Quick Actions</Title>
          <Group>
            <Button component="a" href="/admin/upload-test" leftSection={<IconUpload size={16} />}>
              Upload Test
            </Button>
            <Button component="a" href="/admin/products" variant="outline">
              Manage Products
            </Button>
            <Button component="a" href="/admin/categories" variant="outline">
              Manage Categories
            </Button>
          </Group>
        </Card>
      </div>
    </RequireAdmin>
  );
} 