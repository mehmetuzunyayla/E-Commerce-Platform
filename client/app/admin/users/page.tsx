'use client';
import { useEffect, useState } from 'react';
import { 
  Button, Table, Select, Modal, Text, Card, 
  Badge, ActionIcon, Group, Stack, Container,
  Title, Paper, Divider, Loader, Alert
} from '@mantine/core';
import { 
  IconUser, IconTrash, IconMail, 
  IconShield, IconCheck, IconX, IconUsers 
} from '@tabler/icons-react';
import RequireAdmin from '../../../components/RequireAdmin';
import api from '../../../lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    setError(null);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);



  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <RequireAdmin>
      <Container size="xl" className="py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-50 rounded-lg">
            <IconUsers size={24} className="text-blue-600" />
          </div>
          <div>
            <Title order={1} className="text-gray-900">User Management</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Manage user accounts, roles, and permissions
            </Text>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="red" title="Error" mb="lg" variant="light" className="border border-red-200">
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader size="xl" />
          </div>
        )}

        {/* Users Table */}
        {!loading && (
          <Card shadow="sm" p="lg" withBorder className="bg-white">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <IconUser size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <Text size="sm" fw={500} className="text-gray-900">
                              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0]}
                            </Text>
                            <Text size="xs" c="dimmed" className="font-mono">
                              {user._id.slice(-8)}
                            </Text>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IconMail size={14} className="text-gray-400" />
                          <Text size="sm" className="text-gray-700">{user.email}</Text>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge 
                          color={user.role === 'admin' ? 'red' : 'blue'} 
                          variant="light"
                          leftSection={<IconShield size={12} />}
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <IconCheck size={14} className="text-green-500" />
                          ) : (
                            <IconX size={14} className="text-red-500" />
                          )}
                          <Text size="sm" className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                            {user.emailVerified ? 'Verified' : 'Unverified'}
                          </Text>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(user._id)}
                          className="hover:bg-red-50"
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}

      </Container>
    </RequireAdmin>
  );
}
