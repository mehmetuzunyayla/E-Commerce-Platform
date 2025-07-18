'use client';
import { useState } from 'react';
import { Button, Text, Group, Image, Card } from '@mantine/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import api from '../lib/api';

interface ImageUploadProps {
  entityId: string;
  entityType: 'product' | 'category';
  onUploadSuccess?: (imagePath: string) => void;
  onUploadError?: (error: string) => void;
  currentImages?: string[];
}

export default function ImageUpload({ 
  entityId, 
  entityType, 
  onUploadSuccess, 
  onUploadError,
  currentImages = []
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(currentImages);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError?.('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      onUploadError?.('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in as admin.');
      }

      // Don't try to upload if entityId is "new" (for new categories)
      if (entityId === 'new') {
        onUploadError?.('Please save the category first before uploading images');
        return;
      }

      const response = await api.post(
        `/${entityType === 'category' ? 'categories' : 'products'}/${entityId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // The backend returns the updated category with the image field
      const newImagePath = response.data.image;
      if (newImagePath) {
        setUploadedImages(prev => [...prev, newImagePath]);
        onUploadSuccess?.(newImagePath);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Upload failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imagePath: string) => {
    setUploadedImages(prev => prev.filter(img => img !== imagePath));
  };

  return (
    <Card p="md" withBorder>
      <Text size="lg" fw={600} mb="md">
        {entityType === 'product' ? 'Product' : 'Category'} Images
      </Text>

      {/* Current Images */}
      {uploadedImages.length > 0 && (
        <div className="mb-4">
          <Text size="sm" fw={600} mb="xs">Current Images:</Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {uploadedImages.map((imagePath, index) => (
              <div key={index} className="relative">
                <Image
                  src={`http://localhost:3001${imagePath}`}
                  alt={`${entityType} image ${index + 1}`}
                  height={100}
                  className="rounded"
                />
                <Button
                  size="xs"
                  color="red"
                  variant="filled"
                  className="absolute top-1 right-1"
                  onClick={() => removeImage(imagePath)}
                >
                  <IconX size={12} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <Group>
        <Button
          component="label"
          leftSection={<IconUpload size={16} />}
          loading={uploading}
          disabled={uploading}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Button>
        {uploading && <Text size="sm" c="dimmed">Uploading...</Text>}
      </Group>

      <Text size="xs" c="dimmed" mt="xs">
        Supported formats: JPG, PNG, WebP, GIF (max 2MB)
      </Text>
    </Card>
  );
} 