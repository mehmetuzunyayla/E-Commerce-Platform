'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Image, Text, Badge, Button, Group, Stack, Notification, Loader, Grid, Container, Divider, Box } from '@mantine/core';
import ReviewForm from '../../../components/ReviewForm';
import ReviewsList from '../../../components/ReviewsList';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../features/store';
import api from '../../../lib/api';
import { addToWishlist, removeFromWishlist } from '../../../features/wishlist/wishlistSlice';
import { addToCartAsync } from '../../../features/cart/cartSlice';
import { IconHeart, IconHeartFilled, IconCheck, IconShoppingCart, IconStar, IconTruck, IconShield } from '@tabler/icons-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{ size?: string; color?: string } | null>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Wishlist
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const isWishlisted = product ? wishlist.includes(product._id) : false;

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    
    // Check if product has variants and one is selected
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      // Show error or auto-select first variant
      setSelectedVariant(product.variants[0]);
      return;
    }
    
    setAddingToCart(true);
    try {
      await dispatch(addToCartAsync({ product, selectedVariant }) as any);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  // Recommendations
  const [related, setRelated] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Load product
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/products/${productId}`)
      .then(res => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [productId]);

  // "Customers also viewed"
  useEffect(() => {
    if (product?.category) {
      api.get(`/products?category=${product.category}&limit=4`)
        .then(res => {
          setRelated((res.data.products || res.data).filter((p: any) => p._id !== product._id));
        });
    }
  }, [product]);

  // Track recently viewed
  useEffect(() => {
    if (product?._id) {
      let viewed: string[] = [];
      try {
        viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      } catch {
        viewed = [];
      }
      viewed = viewed.filter(id => id !== product._id);
      viewed.unshift(product._id);
      if (viewed.length > 8) viewed = viewed.slice(0, 8);
      localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
    }
  }, [product]);

  // Load recently viewed products
  useEffect(() => {
    let viewed: string[] = [];
    try {
      viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]').filter((id: string) => id !== productId);
    } catch {
      viewed = [];
    }
    if (viewed.length) {
      api.get(`/products?ids=${viewed.join(',')}`)
        .then(res => setRecentlyViewed(res.data.products || res.data));
    } else {
      setRecentlyViewed([]);
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <Text size="lg" mt="md">Loading product...</Text>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Text size="xl" fw={700} color="red">Product not found</Text>
          <Button mt="md" onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="xl" className="py-8">
        {/* Success Notification */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <IconCheck size={14} color="white" />
                </div>
                <div>
                  <Text fw={600} size="sm" c="green">Success!</Text>
                  <Text size="sm" c="dimmed">Item added to cart successfully!</Text>
                </div>
              </div>
              <Button 
                size="xs" 
                variant="subtle" 
                color="green"
                onClick={() => router.push('/cart')}
                leftSection={<IconShoppingCart size={14} />}
              >
                View Cart
              </Button>
            </div>
          </div>
        )}
        
        {/* Main Product Section */}
        <div className="max-w-6xl mx-auto">
          <Card shadow="lg" radius="xl" p="xl" withBorder className="bg-white">
            <Grid gutter="xl">
              {/* Product Images */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <div className="flex justify-center">
                  <Card shadow="sm" radius="lg" p={0} withBorder className="max-w-md w-full">
                    <Card.Section>
                      <Image
                        src={product.images?.[0] ? `http://localhost:3001${product.images[0]}` : '/placeholder.png'}
                        height={400}
                        alt={product.name}
                        className="object-cover w-full"
                        fallbackSrc="/placeholder.png"
                        fit="contain"
                      />
                    </Card.Section>
                  </Card>
                </div>
              </Grid.Col>

              {/* Product Details */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <div className="space-y-6">
                  {/* Product Header */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {product.isFeatured && (
                          <Badge color="yellow" variant="light" size="sm">
                            Featured
                          </Badge>
                        )}
                        <Badge 
                          color={product.stockQuantity > 10 ? 'green' : product.stockQuantity > 0 ? 'yellow' : 'red'}
                          variant="light"
                          size="sm"
                        >
                          {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                        </Badge>
                      </div>
                      {isAuthenticated && (
                        <Button
                          size="sm"
                          color={isWishlisted ? 'red' : 'gray'}
                          variant={isWishlisted ? 'filled' : 'outline'}
                          onClick={() =>
                            isWishlisted
                              ? dispatch(removeFromWishlist(product._id))
                              : dispatch(addToWishlist(product._id))
                          }
                          leftSection={isWishlisted ? <IconHeartFilled size={16}/> : <IconHeart size={16}/>}
                        >
                          {isWishlisted ? 'Remove' : 'Wishlist'}
                        </Button>
                      )}
                    </div>
                    
                    <Text fw={700} size="2xl" className="text-gray-900 mb-2">
                      {product.name}
                    </Text>
                    
                    <Text size="xl" fw={700} color="blue" mb="4">
                      ${product.price?.toFixed(2)}
                    </Text>
                  </div>

                  {/* Product Description */}
                  <div>
                    <Text size="md" className="text-gray-600 leading-relaxed">
                      {product.description}
                    </Text>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconTruck size={16} />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconShield size={16} />
                      <span>30-day return policy</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconStar size={16} />
                      <span>Customer satisfaction guaranteed</span>
                    </div>
                  </div>

                  {/* Variant Selection */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="space-y-4">
                      <Text fw={600} size="md" className="text-gray-900">
                        Select Options
                      </Text>
                      
                      {/* Size Selection */}
                      {product.variants.some((v: any) => v.size) && (
                        <div>
                          <Text size="sm" fw={500} className="text-gray-700 mb-2">
                            Size
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(product.variants.map((v: any) => v.size))).map((size: any) => (
                              <Button
                                key={size}
                                size="sm"
                                variant={selectedVariant?.size === size ? 'filled' : 'outline'}
                                color={selectedVariant?.size === size ? 'blue' : 'gray'}
                                onClick={() => setSelectedVariant(prev => ({ ...prev, size }))}
                                className="min-w-[60px] transition-all duration-200 hover:scale-105"
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Color Selection */}
                      {product.variants.some((v: any) => v.color) && (
                        <div>
                          <Text size="sm" fw={500} className="text-gray-700 mb-2">
                            Color
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(product.variants.map((v: any) => v.color))).map((color: any) => (
                              <Button
                                key={color}
                                size="sm"
                                variant={selectedVariant?.color === color ? 'filled' : 'outline'}
                                color={selectedVariant?.color === color ? 'blue' : 'gray'}
                                onClick={() => setSelectedVariant(prev => ({ ...prev, color }))}
                                className="min-w-[80px] transition-all duration-200 hover:scale-105"
                              >
                                {color}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <div className="pt-4">
                    <Button
                      color="blue"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={product.stockQuantity <= 0 || addingToCart}
                      loading={addingToCart}
                      leftSection={addingToCart ? <Loader size="sm" /> : <IconShoppingCart size={18} />}
                      fullWidth
                      className="h-12"
                    >
                      {addingToCart ? 'Adding to Cart...' : product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                    
                    {/* Selected Variants Display */}
                    {selectedVariant && (selectedVariant.size || selectedVariant.color) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Text size="sm" fw={600} color="blue" className="mb-2">
                          Selected Options:
                        </Text>
                        <div className="flex flex-wrap gap-2">
                          {selectedVariant.size && (
                            <Badge size="sm" color="blue" variant="light">
                              Size: {selectedVariant.size}
                            </Badge>
                          )}
                          {selectedVariant.color && (
                            <Badge size="sm" color="blue" variant="light">
                              Color: {selectedVariant.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </Card>
        </div>

        <Divider my="xl" />

        {/* Reviews Section */}
        <div className="max-w-6xl mx-auto">
          <Card shadow="lg" radius="xl" p="xl" withBorder className="bg-white">
            <div className="space-y-6">
              <div>
                <Text size="xl" fw={700} className="text-gray-900 mb-4">
                  Customer Reviews
                </Text>
                <ReviewsList productId={product._id} />
              </div>
              
              <Card shadow="sm" radius="lg" p="lg" withBorder>
                <Text size="lg" fw={600} className="text-gray-900 mb-4">
                  Add Your Review
                </Text>
                <ReviewForm productId={product._id} />
              </Card>
            </div>
          </Card>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="max-w-6xl mx-auto mt-8">
            <Card shadow="lg" radius="xl" p="xl" withBorder className="bg-white">
              <Text size="xl" fw={700} className="text-gray-900 mb-6">
                Customers Also Viewed
              </Text>
              <Grid gutter="md">
                {related.map((prod: any) => (
                  <Grid.Col key={prod._id} span={{ base: 6, sm: 4, md: 3 }}>
                    <Link href={`/products/${prod._id}`} className="block">
                      <Card shadow="sm" radius="lg" p="md" withBorder className="hover:shadow-lg transition-shadow">
                        <Card.Section>
                          <div className="flex justify-center">
                            <Image 
                              src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} 
                              height={120} 
                              width={120}
                              alt={prod.name}
                              className="object-contain"
                              fallbackSrc="/placeholder.png"
                              fit="contain"
                            />
                          </div>
                        </Card.Section>
                        <div className="mt-3">
                          <Text fw={600} size="sm" lineClamp={2} className="text-gray-900">
                            {prod.name}
                          </Text>
                          <Text size="xs" color="dimmed" lineClamp={2} mt={4}>
                            {prod.description}
                          </Text>
                          <Text fw={700} size="sm" color="blue" mt={4}>
                            ${prod.price?.toFixed(2)}
                          </Text>
                        </div>
                      </Card>
                    </Link>
                  </Grid.Col>
                ))}
              </Grid>
            </Card>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="max-w-6xl mx-auto mt-8">
            <Card shadow="lg" radius="xl" p="xl" withBorder className="bg-white">
              <Text size="xl" fw={700} className="text-gray-900 mb-6">
                Recently Viewed
              </Text>
              <Grid gutter="md">
                {recentlyViewed.map((prod: any) => (
                  <Grid.Col key={prod._id} span={{ base: 6, sm: 4, md: 3 }}>
                    <Link href={`/products/${prod._id}`} className="block">
                      <Card shadow="sm" radius="lg" p="md" withBorder className="hover:shadow-lg transition-shadow">
                        <Card.Section>
                          <div className="flex justify-center">
                            <Image 
                              src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} 
                              height={120} 
                              width={120}
                              alt={prod.name}
                              className="object-contain"
                              fallbackSrc="/placeholder.png"
                              fit="contain"
                            />
                          </div>
                        </Card.Section>
                        <div className="mt-3">
                          <Text fw={600} size="sm" lineClamp={2} className="text-gray-900">
                            {prod.name}
                          </Text>
                          <Text size="xs" color="dimmed" lineClamp={2} mt={4}>
                            {prod.description}
                          </Text>
                          <Text fw={700} size="sm" color="blue" mt={4}>
                            ${prod.price?.toFixed(2)}
                          </Text>
                        </div>
                      </Card>
                    </Link>
                  </Grid.Col>
                ))}
              </Grid>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}
