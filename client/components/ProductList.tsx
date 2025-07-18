'use client';
import { Product } from '../types/product';
import { Card, Image, Text, Button, Grid, Badge } from '@mantine/core';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCartAsync } from '../features/cart/cartSlice';
import { IconShoppingCart, IconEye } from '@tabler/icons-react';

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  const dispatch = useDispatch();
  
  return (
    <Card shadow="lg" radius="xl" p="xl" withBorder className="bg-white">
      <Grid gutter="lg">
        {products.map((product) => (
          <Grid.Col key={product._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card shadow="sm" radius="lg" p="md" withBorder className="h-full hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <Card.Section>
                <div className="flex justify-center p-4">
                  <Image
                    src={product.images?.[0] ? `http://localhost:3001${product.images[0]}` : '/placeholder.png'}
                    height={200}
                    width={200}
                    alt={product.name}
                    className="object-contain"
                    fallbackSrc="/placeholder.png"
                    fit="contain"
                  />
                </div>
              </Card.Section>

              {/* Product Info */}
              <div className="space-y-3">
                {/* Product Name */}
                <Text fw={600} size="md" lineClamp={2} className="text-gray-900">
                  {product.name}
                </Text>

                {/* Description */}
                <Text size="sm" color="dimmed" lineClamp={2}>
                  {product.description}
                </Text>

                {/* Price and Stock */}
                <div className="flex items-center justify-between">
                  <Text fw={700} size="lg" color="blue">
                    ${product.price?.toFixed(2)}
                  </Text>
                  <Badge 
                    color={(product.stockQuantity || 0) > 10 ? 'green' : (product.stockQuantity || 0) > 0 ? 'yellow' : 'red'}
                    variant="light"
                    size="sm"
                  >
                    {(product.stockQuantity || 0) > 0 ? `${product.stockQuantity || 0} in stock` : 'Out of stock'}
                  </Badge>
                </div>

                {/* Featured Badge */}
                {product.featured && (
                  <Badge color="yellow" variant="light" size="sm" className="w-fit">
                    Featured
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mt-4">
                  <Button 
                    component={Link} 
                    href={`/products/${product._id}`} 
                    variant="outline"
                    leftSection={<IconEye size={20} />}
                    fullWidth
                    size="md"
                    className="h-12 text-base font-medium"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => {
                  
                      dispatch(addToCartAsync({ product }) as any);
                    }}
                    variant="filled"
                    color="blue"
                    //leftSection={<IconShoppingCart size={20} />}
                    fullWidth
                    size="md"
                    className="h-12 text-base font-medium"
                    disabled={(product.stockQuantity || 0) <= 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );
}
