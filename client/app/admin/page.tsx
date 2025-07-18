'use client';
import Link from 'next/link';
import { Card, Title, Text, Group, Button } from '@mantine/core';
import { IconPackage, IconCategory, IconTruck, IconUsers, IconUpload, IconChartBar } from '@tabler/icons-react';
import RequireAdmin from '../../components/RequireAdmin';

export default function AdminDashboard() {
  return (
    <RequireAdmin>
      <div className="max-w-6xl mx-auto p-6">
        <Title mb="xl">Admin Dashboard</Title>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products Management */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconPackage size={24} color="#3B82F6" />
              <Title order={3}>Products</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Manage product inventory, add new products, and upload product images.
            </Text>
            <Button component={Link} href="/admin/products" fullWidth>
              Manage Products
            </Button>
          </Card>

          {/* Categories Management */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconCategory size={24} color="#10B981" />
              <Title order={3}>Categories</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Organize products into categories and upload category images.
            </Text>
            <Button component={Link} href="/admin/categories" fullWidth>
              Manage Categories
            </Button>
          </Card>

          {/* Orders Management */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconTruck size={24} color="#F59E0B" />
              <Title order={3}>Orders</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              View and manage customer orders, track shipping status.
            </Text>
            <Button component={Link} href="/admin/orders" fullWidth>
              Manage Orders
            </Button>
          </Card>

          {/* Users Management */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconUsers size={24} color="#8B5CF6" />
              <Title order={3}>Users</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Manage user accounts, view customer information.
            </Text>
            <Button component={Link} href="/admin/users" fullWidth>
              Manage Users
            </Button>
          </Card>

          {/* Analytics Dashboard */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconChartBar size={24} color="#EF4444" />
              <Title order={3}>Analytics</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              View sales analytics, popular products, and business insights.
            </Text>
            <Button component={Link} href="/admin/dashboard" fullWidth>
              View Analytics
            </Button>
          </Card>

          {/* Image Status */}
          <Card p="md" withBorder className="hover:shadow-lg transition-shadow">
            <Group mb="md">
              <IconUpload size={24} color="#8B5CF6" />
              <Title order={3}>Image Status</Title>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              View which products and categories have images uploaded.
            </Text>
            <Button component={Link} href="/admin/image-status" fullWidth>
              View Status
            </Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card p="md" withBorder className="mt-8">
          <Title order={3} mb="md">Quick Actions</Title>
          <Group>
            <Button component={Link} href="/admin/products" variant="outline" leftSection={<IconPackage size={16} />}>
              Add New Product
            </Button>
            <Button component={Link} href="/admin/categories" variant="outline" leftSection={<IconCategory size={16} />}>
              Add New Category
            </Button>
            <Button component={Link} href="/admin/image-status" variant="outline" leftSection={<IconUpload size={16} />}>
              View Image Status
            </Button>
          </Group>
        </Card>
      </div>
    </RequireAdmin>
  );
}
