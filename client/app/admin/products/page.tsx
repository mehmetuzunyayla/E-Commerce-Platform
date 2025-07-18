'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, Table, Text, Badge, 
  Group, Checkbox, ActionIcon, Image, Pagination, Text as MantineText,
  Card, Paper, Container, Title, Loader, Alert
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconRefresh, IconEye, IconSearch } from '@tabler/icons-react';
import RequireAdmin from '../../../components/RequireAdmin';
import api from '../../../lib/api';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      // Fetch all products at once for admin management - don't pass limit
      const url = `/products`;
      const res = await api.get(url);
      
      let allProducts = [];
      if (res.data.products) {
        // Paginated response
        allProducts = res.data.products;
        setTotalCount(res.data.totalCount || allProducts.length);
      } else if (Array.isArray(res.data)) {
        // Non-paginated response (array of products)
        allProducts = res.data;
        setTotalCount(allProducts.length);
      } else {
        // Fallback
        allProducts = res.data;
        setTotalCount(allProducts.length);
      }

      if (showAll) {
        // Show all products on one page
        setProducts(allProducts);
        setTotalPages(1);
      } else {
        // Apply pagination on the frontend
        const itemsPerPage = 10;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setTotalPages(Math.ceil(allProducts.length / itemsPerPage));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, showAll]);

  const handleEdit = (product: any) => {
    router.push(`/admin/products/edit/${product._id}`);
  };

  const handleAdd = () => {
    router.push('/admin/products/add');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(currentPage);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleBulkAction = async (action: 'delete') => {
    if (selectedProducts.length === 0) return;

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      if (action === 'delete') {
        await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)));
      }
      setSelectedProducts([]);
      fetchProducts(currentPage);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gray-50">
          <Container size="xl" className="py-12">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader size="lg" className="mb-4" />
                <Text size="lg" c="dimmed">Loading products...</Text>
              </div>
            </div>
          </Container>
        </div>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Container size="xl" className="py-8">
          {/* Header Section */}
          <Paper shadow="sm" p="xl" mb="xl" className="bg-white border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <Title order={1} className="text-gray-900 text-3xl font-bold mb-2">
                  Product Management
                </Title>
                <Text size="md" c="dimmed" className="text-gray-600">
                  {showAll 
                    ? `Managing all ${totalCount} products` 
                    : `Showing ${products.length} of ${totalCount} products • Page ${currentPage}`
                  }
                </Text>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="subtle"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => fetchProducts(currentPage)}
                  className="hover:bg-gray-100 px-4"
                >
                  Refresh
                </Button>
                <Button 
                  variant={showAll ? "filled" : "outline"}
                  color="blue"
                  onClick={() => {
                    setShowAll(!showAll);
                    setCurrentPage(1);
                  }}
                  className={showAll ? "bg-blue-600 hover:bg-blue-700" : "border-blue-300 text-blue-600 hover:bg-blue-50 px-4"}
                >
                  {showAll ? "Show Paginated" : "Show All"}
                </Button>
                <Button 
                  onClick={handleAdd} 
                  leftSection={<IconPlus size={16} />}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Add Product
                </Button>
              </div>
            </div>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert color="red" title="Error" mb="lg" variant="light" className="border border-red-200">
              {error}
            </Alert>
          )}



          {/* Products Table */}
          <Paper shadow="sm" className="bg-white border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(prod => (
                    <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        {prod.images?.[0] ? (
                          <Image 
                            src={`http://localhost:3001${prod.images[0]}`}
                            width={60} 
                            height={60} 
                            fit="cover"
                            radius="md"
                            className="border border-gray-200"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                            <Text size="xs" c="dimmed" className="text-gray-500">No image</Text>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <Text fw={600} size="sm" className="text-gray-900 mb-1">
                            {prod.name}
                          </Text>
                          <Text size="xs" c="dimmed" className="text-gray-600 line-clamp-2">
                            {prod.description || 'No description available'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Text fw={600} className="text-green-600 text-lg">
                          ${prod.price?.toFixed(2) || '0.00'}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          color={prod.stockQuantity > 10 ? 'green' : prod.stockQuantity > 0 ? 'yellow' : 'red'}
                          size="md"
                          variant="light"
                          className={
                            prod.stockQuantity > 10 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : prod.stockQuantity > 0 
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                          }
                        >
                          {prod.stockQuantity || 0} in stock
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Text size="sm" className="text-gray-700">
                          {prod.category?.name || 'Uncategorized'}
                        </Text>
                      </td>
                      <td className="px-6 py-4">
                        {prod.isFeatured ? (
                          <Badge color="yellow" size="md" variant="light" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                            Featured
                          </Badge>
                        ) : (
                          <Badge color="gray" size="md" variant="light" className="bg-gray-100 text-gray-600 border-gray-200">
                            Regular
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Group gap="xs">
                          <ActionIcon 
                            size="md" 
                            color="blue" 
                            variant="light"
                            onClick={() => handleEdit(prod)}
                            className="hover:bg-blue-50"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon 
                            size="md" 
                            color="red" 
                            variant="light"
                            onClick={() => handleDelete(prod._id)}
                            className="hover:bg-red-50"
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Paper>

          {/* Pagination */}
          {!showAll && totalPages > 1 && (
            <Paper shadow="sm" p="md" mt="lg" className="bg-white border border-gray-200">
              <div className="flex justify-between items-center">
                <Text size="sm" c="dimmed" className="text-gray-600">
                  Page {currentPage} of {totalPages} • {totalCount} total products
                </Text>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${currentPage === page 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </Paper>
          )}
          
          {/* Show All Mode Info */}
          {showAll && (
            <Paper shadow="sm" p="md" mt="lg" className="bg-white border border-gray-200">
              <div className="text-center">
                <Text size="sm" c="dimmed" className="text-gray-600">
                  All {totalCount} products displayed on this page
                </Text>
              </div>
            </Paper>
          )}

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <Paper shadow="sm" p="xl" className="bg-white border border-gray-200">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconSearch size={24} className="text-gray-400" />
                </div>
                <Title order={3} className="text-gray-900 mb-2">No products found</Title>
                <Text size="md" c="dimmed" className="text-gray-600 mb-6">
                  Get started by adding your first product
                </Text>
                <Button 
                  onClick={handleAdd} 
                  leftSection={<IconPlus size={16} />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Your First Product
                </Button>
              </div>
            </Paper>
          )}
        </Container>
      </div>
    </RequireAdmin>
  );
}
