'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, TextInput, NumberInput, Text, Group, 
  Textarea, Switch, Card, Title, Alert,
  Image, FileInput, Stack, Divider, Loader, Badge, ActionIcon
} from '@mantine/core';
import { IconArrowLeft, IconPlus, IconX, IconDeviceFloppy, IconPhoto, IconUpload } from '@tabler/icons-react';
import RequireAdmin from '../../../../components/RequireAdmin';
import api from '../../../../lib/api';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: 0,
    description: '',
    category: '',
    stockQuantity: 0,
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

        const response = await api.post('/products/temp-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data.imagePath;
      });

      const uploadedPaths = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...uploadedPaths]);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setError(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        ...form,
        images: uploadedImages,
      };

      await api.post('/products', productData);
      setSuccess(true);
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/products');
  };

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
              <IconPlus size={24} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product with all necessary information</p>
            </div>
            {uploadedImages.length > 0 && (
              <div className="flex-shrink-0">
                <Image 
                  src={`http://localhost:3001${uploadedImages[0]}`}
                  width={80} 
                  height={80} 
                  fit="cover"
                  radius="lg"
                  className="border-2 border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <Alert color="red" title="Error" mb="xl" variant="light" className="border border-red-200">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" title="Success" mb="xl" variant="light" className="border border-green-200">
              Product created successfully! Redirecting to products list...
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
                  <Text size="sm" c="dimmed">Upload images for the product</Text>
                </div>
              </div>
              
              {/* Upload Section */}
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <IconUpload size={18} className="text-blue-500" />
                  <Text fw={500}>Upload Images</Text>
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

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge color="green" variant="light">Uploaded Images</Badge>
                    <Text size="sm" c="dimmed">({uploadedImages.length} images)</Text>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedImages.map((imagePath, index) => (
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
                          onClick={() => removeImage(index)}
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
                loading={loading}
                leftSection={<IconPlus size={16} />}
                size="md"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Product
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </RequireAdmin>
  );
} 