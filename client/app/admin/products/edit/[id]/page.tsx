'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Button, TextInput, NumberInput, Text, Group, 
  Textarea, Switch, Card, Title, Alert,
  Image, FileInput, Stack, Divider, Loader,
  Container, Paper, Badge, ActionIcon, Box
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconX, IconTrash, IconUpload, IconPhoto } from '@tabler/icons-react';
import RequireAdmin from '../../../../../components/RequireAdmin';
import api from '../../../../../lib/api';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    stockQuantity: 0,
    isFeatured: false,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchCategories();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}`);
      const productData = res.data;
      
      setProduct(productData);
      setForm({
        name: productData.name || '',
        price: productData.price || 0,
        description: productData.description || '',
        category: productData.category?._id || productData.category || '',
        stockQuantity: productData.stockQuantity || 0,
        isFeatured: productData.isFeatured || false,
      });
      setExistingImages(productData.images || []);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setError(error.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  const handleImageUpload = async (files: File[] | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post(`/products/${productId}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.images[response.data.images.length - 1];
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      setNewImages(prev => [...prev, ...uploadedPaths]);
      
      // Refresh product data to get updated images
      await fetchProduct();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeExistingImage = async (imagePath: string) => {
    try {
      // Remove from existing images array
      setExistingImages(prev => prev.filter(img => img !== imagePath));
      
      // You might want to add an API endpoint to remove images from the backend
      // await api.delete(`/products/${productId}/images`, { data: { imagePath } });
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image');
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const productData = {
        ...form,
        images: [...existingImages, ...newImages],
      };

      await api.patch(`/products/${productId}`, productData);
      setSuccess(true);
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      router.push('/admin/products');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError(error.response?.data?.message || 'Failed to delete product');
    }
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

  if (!product) {
    return (
      <RequireAdmin>
        <div className="max-w-2xl mx-auto mt-10">
          <Alert color="red" title="Error">
            Product not found
          </Alert>
        </div>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <div className="max-w-4xl mx-auto mt-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleCancel}
            className="hover:bg-gray-50"
          >
            Back to Products
          </Button>
        </div>

        <Card shadow="md" p="xl" withBorder className="bg-white">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="p-3 bg-blue-50 rounded-lg">
              <IconDeviceFloppy size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product information and settings</p>
            </div>
            <div className="flex items-center gap-4">
              {existingImages.length > 0 && (
                <div className="flex-shrink-0">
                  <Image 
                    src={`http://localhost:3001${existingImages[0]}`}
                    width={80} 
                    height={80} 
                    fit="cover"
                    radius="lg"
                    className="border-2 border-gray-200"
                  />
                </div>
              )}
              <Button 
                color="red" 
                variant="light"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                className="hover:bg-red-50 border border-red-200"
                size="sm"
              >
                Delete Product
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert color="red" title="Error" mb="xl" variant="light" className="border border-red-200">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" title="Success" mb="xl" variant="light" className="border border-green-200">
              Product updated successfully! Redirecting to products list...
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextInput 
                  label="Product Name" 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  required 
                  placeholder="Enter product name"
                  size="md"
                  classNames={{
                    label: 'font-semibold text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }}
                />
                
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberInput
                  label="Price ($)"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(value) => setForm(prev => ({ ...prev, price: Number(value) || 0 }))}
                  min={0}
                  required
                  size="md"
                  leftSection={<Text size="sm" c="dimmed">$</Text>}
                  classNames={{
                    label: 'font-semibold text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }}
                />
                
                <NumberInput
                  label="Stock Quantity"
                  placeholder="0"
                  value={form.stockQuantity}
                  onChange={(value) => setForm(prev => ({ ...prev, stockQuantity: Number(value) || 0 }))}
                  min={0}
                  required
                  size="md"
                  classNames={{
                    label: 'font-semibold text-gray-700 mb-2',
                    input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }}
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <IconDeviceFloppy size={20} className="text-gray-600" />
                </div>
                <div>
                  <Text size="lg" fw={600} className="text-gray-900">Product Description</Text>
                  <Text size="sm" c="dimmed">Provide detailed information about the product</Text>
                </div>
              </div>
              
              <Textarea
                placeholder="Enter detailed product description..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                minRows={4}
                required
                size="md"
                classNames={{
                  input: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }}
              />
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <IconPhoto size={20} className="text-gray-600" />
                </div>
                <div>
                  <Text size="lg" fw={600} className="text-gray-900">Product Images</Text>
                  <Text size="sm" c="dimmed">Upload and manage product images</Text>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <IconUpload size={18} className="text-blue-500" />
                  <Text fw={500}>Upload New Images</Text>
                </div>
                <FileInput
                  placeholder="Click to upload or drag and drop images"
                  accept="image/*"
                  multiple
                  onChange={(files) => handleImageUpload(files)}
                  disabled={uploading}
                  size="md"
                  leftSection={<IconPhoto size={16} />}
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">Uploading images...</Text>
                  </div>
                )}
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge color="blue" variant="light">Current Images</Badge>
                    <Text size="sm" c="dimmed">({existingImages.length} images)</Text>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {existingImages.map((imagePath, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={`http://localhost:3001${imagePath}`}
                          width={120}
                          height={120}
                          fit="cover"
                          radius="md"
                          className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="filled"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(imagePath)}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {newImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge color="green" variant="light">New Images</Badge>
                    <Text size="sm" c="dimmed">({newImages.length} images)</Text>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {newImages.map((imagePath, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={`http://localhost:3001${imagePath}`}
                          width={120}
                          height={120}
                          fit="cover"
                          radius="md"
                          className="border-2 border-green-200 hover:border-green-300 transition-colors"
                        />
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="filled"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(index)}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <IconDeviceFloppy size={20} className="text-gray-600" />
                </div>
                <div>
                  <Text size="lg" fw={600} className="text-gray-900">Settings</Text>
                  <Text size="sm" c="dimmed">Configure product display options</Text>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Switch
                  label="Featured Product"
                  description="Show this product in featured sections and homepage"
                  checked={form.isFeatured}
                  onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.currentTarget.checked }))}
                  size="md"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={handleCancel}
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