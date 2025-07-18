'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, Table, Text, Image, Group, ActionIcon, Alert, Loader,
  Paper, Container, Title
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconRefresh } from '@tabler/icons-react';
import RequireAdmin from '../../../components/RequireAdmin';
import api from '../../../lib/api';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories', {
        params: { _t: Date.now() } // Force cache busting
      });
      setCategories(res.data);
      
      // Force a re-render by updating state
      setTimeout(() => {
        setCategories([...res.data]);
      }, 100);
    } catch (err: any) {
      console.error('❌ Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Refresh categories when returning from edit/add pages
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing categories...');
      fetchCategories();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCategories();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleEdit = (category: any) => {
    router.push(`/admin/categories/edit/${category._id}`);
  };

  const handleAdd = () => {
    router.push('/admin/categories/add');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `http://localhost:3001/${cleanPath}`;
  };

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gray-50">
          <Container size="xl" className="py-12">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader size="lg" className="mb-4" />
                <Text size="lg" c="dimmed">Loading categories...</Text>
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
                  Category Management
                </Title>
                <Text size="md" c="dimmed" className="text-gray-600">
                  Manage product categories and organization
                </Text>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="subtle"
                  leftSection={<IconRefresh size={16} />}
                  onClick={fetchCategories}
                  className="hover:bg-gray-100 px-4"
                >
                  Refresh
                </Button>
                <Button 
                  onClick={handleAdd} 
                  leftSection={<IconPlus size={16} />}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  Add Category
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

          {/* Categories Table */}
          {categories.length === 0 ? (
            <Paper shadow="sm" p="xl" className="bg-white border border-gray-200">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconPlus size={24} className="text-gray-400" />
                </div>
                <Title order={3} className="text-gray-900 mb-2">No categories found</Title>
                <Text size="md" c="dimmed" className="text-gray-600 mb-6">
                  Get started by adding your first category
                </Text>
                <Button 
                  onClick={handleAdd} 
                  leftSection={<IconPlus size={16} />}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add Your First Category
                </Button>
              </div>
            </Paper>
          ) : (
            <Paper shadow="sm" className="bg-white border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Image</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category Details</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map(cat => (
                      <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {cat.image ? (
                            <Image 
                              src={getImageUrl(cat.image)}
                              width={60} 
                              height={60} 
                              fit="cover"
                              radius="md"
                              fallbackSrc="/placeholder-category.png"
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
                            <Text fw={600} size="lg" className="text-gray-900 mb-1">
                              {cat.name}
                            </Text>
                            <Text size="xs" c="dimmed" className="text-gray-500">
                              ID: {cat._id}
                            </Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <Text size="sm" className="text-gray-700 line-clamp-2">
                              {cat.description || 'No description available'}
                            </Text>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Group gap="xs">
                            <ActionIcon 
                              size="md" 
                              color="blue" 
                              variant="light"
                              onClick={() => handleEdit(cat)}
                              className="hover:bg-blue-50"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              size="md" 
                              color="red" 
                              variant="light"
                              onClick={() => handleDelete(cat._id)}
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
          )}

          {/* Summary Info */}
          {categories.length > 0 && (
            <Paper shadow="sm" p="md" mt="lg" className="bg-white border border-gray-200">
              <div className="text-center">
                <Text size="sm" c="dimmed" className="text-gray-600">
                  {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} total
                </Text>
              </div>
            </Paper>
          )}
        </Container>
      </div>
    </RequireAdmin>
  );
}
