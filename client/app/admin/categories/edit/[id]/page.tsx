'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, TextInput, Text, Image, Group, Alert, Loader, Card } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import RequireAdmin from '../../../../../components/RequireAdmin';
import ImageUpload from '../../../../../components/ImageUpload';
import api from '../../../../../lib/api';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Array.isArray(params?.id) ? params.id[0] : params.id;
  
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);



  const fetchCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/categories/${categoryId}`);
      setCategory(res.data);
      setForm({
        name: res.data.name,
        description: res.data.description,
        image: res.data.image || '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await api.patch(`/categories/${categoryId}`, form);
      
      // Show success message
      alert('Category updated successfully!');
      
      // Use replace instead of push to avoid navigation issues
      router.replace('/admin/categories');
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save category. Please try again.';
      alert(errorMessage);
    } finally {
      setSaving(false);
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
        <div className="max-w-2xl mx-auto mt-10 flex justify-center">
          <Loader size="lg" />
        </div>
      </RequireAdmin>
    );
  }

  if (error) {
    return (
      <RequireAdmin>
        <div className="max-w-2xl mx-auto mt-10">
          <Alert color="red" title="Error">
            {error}
          </Alert>
        </div>
      </RequireAdmin>
    );
  }

  if (!category) {
    return (
      <RequireAdmin>
        <div className="max-w-2xl mx-auto mt-10">
          <Alert color="red" title="Category Not Found">
            The category you're looking for doesn't exist.
          </Alert>
        </div>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <div className="max-w-3xl mx-auto mt-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/admin/categories')}
            className="hover:bg-gray-50"
          >
            Back to Categories
          </Button>
        </div>

        <Card shadow="md" p="xl" withBorder className="bg-white">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="p-3 bg-blue-50 rounded-lg">
              <IconDeviceFloppy size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
              <p className="text-gray-600 mt-1">Update category information and settings</p>
            </div>
            {category.image && (
              <div className="flex-shrink-0">
                <Image 
                  src={getImageUrl(category.image)}
                  width={80} 
                  height={80} 
                  fit="cover"
                  radius="lg"
                  fallbackSrc="/placeholder-category.png"
                  className="border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          <form className="space-y-8" onSubmit={e => { 
            e.preventDefault(); 
            handleSubmit(); 
          }}>
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput 
                  label="Category Name" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  required 
                  placeholder="Enter category name"
                  size="md"
                  classNames={{
                    label: 'font-semibold text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }}
                />
                
                <TextInput 
                  label="Description" 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  required 
                  placeholder="Enter category description"
                  size="md"
                  classNames={{
                    label: 'font-semibold text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }}
                />
              </div>
            </div>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <IconDeviceFloppy size={20} className="text-gray-600" />
                </div>
                <div>
                  <Text size="lg" fw={600} className="text-gray-900">Category Image</Text>
                  <Text size="sm" c="dimmed">Update the image for this category</Text>
                </div>
              </div>
              
              {form.image && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <Text size="sm" fw={500} mb="xs" className="text-gray-700">Current Image</Text>
                  <Image 
                    src={getImageUrl(form.image)}
                    width={200} 
                    height={200} 
                    fit="cover"
                    radius="md"
                    fallbackSrc="/placeholder-category.png"
                    className="border border-gray-200"
                  />
                </div>
              )}
              
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <ImageUpload
                  entityId={categoryId || ''}
                  entityType="category"
                  currentImages={form.image ? [form.image] : []}
                  onUploadSuccess={(imagePath) => {
                    setForm(f => ({ ...f, image: imagePath }));
                  }}
                  onUploadError={(error) => {
                    alert(`Upload failed: ${error}`);
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/categories')}
                size="md"
                className="hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={saving}
                leftSection={<IconDeviceFloppy size={16} />}
                size="md"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RequireAdmin>
  );
} 