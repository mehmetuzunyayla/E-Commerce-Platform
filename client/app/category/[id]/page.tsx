// client/app/category/[id]/page.tsx
import { fetchCategory, fetchProducts } from '../../../lib/api';
import ProductList from '../../../components/ProductList';
import { notFound } from 'next/navigation';
import { Container, Text, Badge } from '@mantine/core';
import { IconCategory } from '@tabler/icons-react';

interface Props {
  params: { id: string };
}

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  
  // Use native fetch for server components
  const categoryResponse = await fetch(`http://localhost:3001/api/categories/${id}`);
  if (!categoryResponse.ok) notFound();
  const category = await categoryResponse.json();

  const productsResponse = await fetch(`http://localhost:3001/api/products`);
  const allProducts = await productsResponse.json();
  const products = allProducts.filter((p: any) =>
    typeof p.category === 'object'
      ? p.category._id === id
      : p.category === id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="xl" className="py-8">
        {/* Category Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <IconCategory size={48} color="blue" />
              <Text size="4xl" fw={600} className="text-gray-900">
                {category.name}
              </Text>
            </div>
            <Text size="xl" color="dimmed" mb="lg">
              Discover our amazing {category.name.toLowerCase()} collection
            </Text>
            <Badge size="xl" color="blue" variant="light" className="text-lg px-6 py-2">
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-6xl mx-auto">
          <ProductList products={products} />
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <Text size="xl" fw={600} color="dimmed" mb="md">
                No products found in this category
              </Text>
              <Text size="md" color="dimmed">
                Check back later for new {category.name.toLowerCase()} products
              </Text>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
