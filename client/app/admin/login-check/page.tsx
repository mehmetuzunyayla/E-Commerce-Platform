'use client';
import { useSelector } from 'react-redux';
import { RootState } from '../../../features/store';
import { Card, Title, Text, Button, Group, Badge } from '@mantine/core';
import { IconUser, IconShield, IconLogin } from '@tabler/icons-react';
import Link from 'next/link';
import TokenDebug from '../../../components/TokenDebug';

export default function LoginCheckPage() {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Text>Loading authentication status...</Text>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card p="md" withBorder>
          <Title order={2} mb="md" c="red">Authentication Required</Title>
          <Text mb="md">
            You need to be logged in as an admin to access this page.
          </Text>
          <Group>
            <Button component={Link} href="/login" leftSection={<IconLogin size={16} />}>
              Go to Login
            </Button>
            <Button component={Link} href="/" variant="outline">
              Go to Homepage
            </Button>
          </Group>
        </Card>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card p="md" withBorder>
          <Title order={2} mb="md" c="orange">Admin Access Required</Title>
          <Text mb="md">
            You are logged in as <strong>{user?.email}</strong> with role <strong>{user?.role}</strong>.
            Only admin users can access this page.
          </Text>
          <Group>
            <Button component={Link} href="/" variant="outline">
              Go to Homepage
            </Button>
            <Button component={Link} href="/profile" variant="outline">
              View Profile
            </Button>
          </Group>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card p="md" withBorder>
                  <Title order={2} mb="md" c="green">✅ Admin Access Confirmed</Title>
        
        <Group mb="md">
          <Badge color="green" size="lg">
            Authenticated as Admin
          </Badge>
        </Group>

        <div className="space-y-2 mb-6">
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>Role:</strong> {user?.role}</Text>
          <Text><strong>User ID:</strong> {user?._id}</Text>
        </div>

        <Group>
          <Button component={Link} href="/admin" leftSection={<IconShield size={16} />}>
            Go to Admin Dashboard
          </Button>
          <Button component={Link} href="/admin/products" variant="outline">
            Manage Products
          </Button>
          <Button component={Link} href="/admin/categories" variant="outline">
            Manage Categories
          </Button>
        </Group>

        {/* Token Debug */}
        <TokenDebug />
      </Card>
    </div>
  );
} 