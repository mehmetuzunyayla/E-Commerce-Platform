'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Card, Image, Text, Button, Select, NumberInput, TextInput, 
  Pagination, Loader, Group, Badge, Stack, Collapse, 
  ActionIcon, Text as MantineText 
} from '@mantine/core';
import { IconFilter, IconSearch, IconX, IconStar } from '@tabler/icons-react';
import api from '../../lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters/sorts/search/pagination
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [inStock, setInStock] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    // Build query string
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (minPrice) params.append('minPrice', String(minPrice));
    if (maxPrice) params.append('maxPrice', String(maxPrice));
    if (minRating) params.append('minRating', String(minRating));
    if (inStock !== undefined) params.append('inStock', String(inStock));
    params.append('page', String(page));
    params.append('limit', '12');

    api.get(`/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data.products || res.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.total || res.data.length || 0);
      })
      .finally(() => setLoading(false));
  }, [category, search, sort, minPrice, maxPrice, minRating, inStock, page]);

  const clearFilters = () => {
    setCategory('');
    setSearch('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(undefined);
    setInStock(undefined);
    setPage(1);
  };

  const hasActiveFilters = category || search || minPrice || maxPrice || minRating !== undefined || inStock !== undefined;

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
            size={14}
            fill={star <= rating ? '#ffd700' : 'transparent'}
            color={star <= rating ? '#ffd700' : '#ddd'}
          />
        ))}
        <Text size="xs" c="dimmed">({rating})</Text>
      </Group>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <MantineText size="xl" fw={700}>Products</MantineText>
          <MantineText size="sm" c="dimmed">
            {totalProducts} products found
          </MantineText>
        </div>
        <Group>
          <Button
            variant="outline"
            leftSection={<IconFilter size={16} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
        </Group>
      </div>

      {/* Filter/Search Controls */}
      <Collapse in={filtersOpen}>
        <Card shadow="sm" p="md" mb="md">
          <Stack gap="md">
            <Group align="end" className="flex-wrap gap-4">
              <TextInput
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                leftSection={<IconSearch size={16} />}
                className="w-60"
              />
              <Select
                label="Category"
                value={category}
                onChange={v => { setCategory(v || ''); setPage(1); }}
                data={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c: any) => ({ value: c._id, label: c.name })),
                ]}
                className="w-48"
                clearable
              />
              <Select
                label="Sort"
                value={sort}
                onChange={v => setSort(v || 'newest')}
                data={[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                  { value: 'rating-desc', label: 'Rating: High to Low' },
                  { value: 'popular', label: 'Most Popular' },
                ]}
                className="w-48"
              />
            </Group>
            
            <Group align="end" className="flex-wrap gap-4">
                             <NumberInput
                 label="Min Price"
                 value={minPrice}
                 onChange={v => { setMinPrice(Number(v) || undefined); setPage(1); }}
                 min={0}
                 className="w-36"
               />
               <NumberInput
                 label="Max Price"
                 value={maxPrice}
                 onChange={v => { setMaxPrice(Number(v) || undefined); setPage(1); }}
                 min={0}
                 className="w-36"
               />
              <Select
                label="Min Rating"
                value={minRating?.toString() || ''}
                onChange={v => { setMinRating(v ? Number(v) : undefined); setPage(1); }}
                data={[
                  { value: '', label: 'Any Rating' },
                  { value: '4', label: '4+ Stars' },
                  { value: '3', label: '3+ Stars' },
                  { value: '2', label: '2+ Stars' },
                ]}
                className="w-36"
              />
              <Select
                label="Stock Status"
                value={inStock?.toString() || ''}
                onChange={v => { 
                  setInStock(v === '' ? undefined : v === 'true'); 
                  setPage(1); 
                }}
                data={[
                  { value: '', label: 'All Items' },
                  { value: 'true', label: 'In Stock' },
                  { value: 'false', label: 'Out of Stock' },
                ]}
                className="w-36"
              />
            </Group>
          </Stack>
        </Card>
      </Collapse>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Group mb="md" className="flex-wrap">
          {category && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setCategory('')}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Category: {categories.find(c => c._id === category)?.name}
            </Badge>
          )}
          {search && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setSearch('')}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Search: "{search}"
            </Badge>
          )}
          {minPrice && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setMinPrice(undefined)}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Min Price: ${minPrice}
            </Badge>
          )}
          {maxPrice && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setMaxPrice(undefined)}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Max Price: ${maxPrice}
            </Badge>
          )}
          {minRating && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setMinRating(undefined)}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              Min Rating: {minRating}+ Stars
            </Badge>
          )}
          {inStock !== undefined && (
            <Badge 
              variant="light" 
              rightSection={
                <ActionIcon size="xs" onClick={() => setInStock(undefined)}>
                  <IconX size={10} />
                </ActionIcon>
              }
            >
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Badge>
          )}
        </Group>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader size="xl" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <MantineText size="lg" c="dimmed" mb="md">No products found</MantineText>
          {hasActiveFilters && (
            <Button onClick={clearFilters}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((prod: any) => {
              const avgRating = getAverageRating(prod.reviews || []);
              const isOutOfStock = (prod.stockQuantity || 0) <= 0;
              
              return (
                <Link key={prod._id} href={`/products/${prod._id}`}>
                  <Card shadow="md" p="md" className="hover:shadow-xl cursor-pointer relative">
                    {isOutOfStock && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge color="red" size="sm">Out of Stock</Badge>
                      </div>
                    )}
                    {prod.isFeatured && (
                      <div className="absolute top-2 left-2 z-10">
                        <Badge color="yellow" size="sm">Featured</Badge>
                      </div>
                    )}
                    
                    <Image 
                      src={prod.images?.[0] ? `http://localhost:3001${prod.images[0]}` : '/placeholder.png'} 
                      height={200} 
                      alt={prod.name}
                      className={isOutOfStock ? 'opacity-50' : ''}
                    />
                    
                    <Stack gap="xs" mt="md">
                      <Text fw={700} size="sm" lineClamp={1}>{prod.name}</Text>
                      <Text c="dimmed" size="xs" lineClamp={2}>{prod.description}</Text>
                      
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1">
                          {renderStars(avgRating)}
                        </div>
                      )}
                      
                      <Group justify="space-between" align="center">
                        <Text fw={700} size="lg">${prod.price}</Text>
                        <Badge 
                          color={prod.stockQuantity > 10 ? 'green' : prod.stockQuantity > 0 ? 'yellow' : 'red'}
                          size="sm"
                        >
                          {prod.stockQuantity > 0 ? `${prod.stockQuantity} in stock` : 'Out of stock'}
                        </Badge>
                      </Group>
                    </Stack>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination value={page} onChange={setPage} total={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
