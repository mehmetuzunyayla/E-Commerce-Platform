'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../features/store';
import { 
  Button, Table, Select, Text, Alert, Loader, Badge, 
  Card, Group, Stack, Collapse, ActionIcon, ScrollArea,
  Container, Title, Paper, Divider
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconTruck, IconUser, IconCalendar, IconPackage, IconCreditCard } from '@tabler/icons-react';
import RequireAdmin from '../../../components/RequireAdmin';
import api from '../../../lib/api';

export default function AdminOrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      return;
    }
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await api.patch(`/orders/${orderId}`, { status: newStatus });
      // Update the order in the local state
      setOrders(prev => prev.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'confirmed': return 'blue';
      case 'shipped': return 'orange';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <RequireAdmin>
        <Container size="xl" className="py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="lg" />
          </div>
        </Container>
      </RequireAdmin>
    );
  }

  if (error) {
    return (
      <RequireAdmin>
        <Container size="xl" className="py-8">
          <Alert color="red" title="Error" variant="light">
            {error}
          </Alert>
        </Container>
      </RequireAdmin>
    );
  }

  return (
    <RequireAdmin>
      <Container size="xl" className="py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title order={1} className="text-3xl font-bold text-gray-900 mb-2">
                Order Management
              </Title>
              <Text size="lg" color="dimmed" className="mb-4">
                Manage and track customer orders
              </Text>
            </div>
            <Badge size="xl" variant="light" className="text-lg px-4 py-2">
              {orders.length} Orders
            </Badge>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Paper className="p-8 text-center">
            <IconPackage size={48} className="mx-auto mb-4 text-gray-400" />
            <Title order={3} className="text-xl font-semibold text-gray-600 mb-2">
              No Orders Found
            </Title>
            <Text color="dimmed">
              There are no orders to display at the moment.
            </Text>
          </Paper>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <Paper key={order._id} shadow="sm" className="overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <Text fw={700} size="lg" className="text-gray-900">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </Text>
                          <Text size="sm" color="dimmed" className="mt-1">
                            Created: {new Date(order.createdAt || order.date).toISOString().slice(0, 19).replace('T', ' ')}
                          </Text>
                        </div>
                        
                        <Group gap="md">
                          <Group gap="xs">
                            <IconUser size={16} className="text-gray-500" />
                            <Text size="sm" className="text-gray-700">
                              {order.guestInfo ? 
                                `${order.guestInfo.email} (Guest)` : 
                                order.user?.email || order.user?.fullName || order.user || 'Unknown User'
                              }
                            </Text>
                          </Group>
                          
                                                      <Group gap="xs">
                              <IconCalendar size={16} className="text-gray-500" />
                              <Text size="sm" className="text-gray-700">
                                {new Date(order.createdAt || order.date).toISOString().slice(0, 10)}
                              </Text>
                            </Group>
                        </Group>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <Text fw={700} size="xl" className="text-gray-900">
                          ${order.totalPrice?.toFixed(2) || order.total?.toFixed(2) || '0.00'}
                        </Text>
                        <Text size="sm" color="dimmed">
                          Total Amount
                        </Text>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          color={getStatusColor(order.status)} 
                          size="lg"
                          variant="light"
                          className="px-3 py-1"
                        >
                          {getStatusLabel(order.status)}
                        </Badge>
                        
                        <select
                          value={order.status}
                          onChange={(e) => {
                            if (e.target.value !== order.status) {
                              handleStatusChange(order._id, e.target.value);
                            }
                          }}
                          disabled={updatingStatus === order._id}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          style={{ minWidth: '140px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        {updatingStatus === order._id && (
                          <div className="ml-2">
                            <Loader size="sm" />
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="subtle"
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {expandedOrder === order._id ? 
                          <IconChevronUp size={20} /> : 
                          <IconChevronDown size={20} />
                        }
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                <Collapse in={expandedOrder === order._id}>
                  <div className="p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Order Items */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <IconPackage size={20} className="text-gray-600" />
                          <Text fw={600} size="lg" className="text-gray-900">
                            Order Items
                          </Text>
                        </div>
                        <div className="space-y-3">
                          {order.items?.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-4">
                                {item.product?.images?.[0] && (
                                  <img 
                                    src={item.product.images[0].startsWith('http') ? item.product.images[0] : `http://localhost:3001${item.product.images[0]}`}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.png';
                                    }}
                                  />
                                )}
                                <div>
                                  <Text size="sm" fw={600} className="text-gray-900">
                                    {item.product?.name || 'Unknown Product'}
                                  </Text>
                                  <Text size="xs" color="dimmed" className="mt-1">
                                    Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                                  </Text>
                                </div>
                              </div>
                              <Text fw={700} size="sm" className="text-gray-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </Text>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <IconCreditCard size={20} className="text-gray-600" />
                          <Text fw={600} size="lg" className="text-gray-900">
                            Order Details
                          </Text>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Text size="sm" color="dimmed">Status:</Text>
                                <Badge color={getStatusColor(order.status)} size="sm" className="px-2">
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>
                              <Divider />
                              <div className="flex justify-between items-center">
                                <Text size="sm" color="dimmed">Payment Method:</Text>
                                <Text size="sm" fw={500} className="text-gray-900">
                                  {order.paymentMethod || 'Cash'}
                                </Text>
                              </div>
                              <Divider />
                              <div className="flex justify-between items-center">
                                <Text size="sm" color="dimmed">Payment Status:</Text>
                                <Badge color={order.isPaid ? 'green' : 'red'} size="sm" className="px-2">
                                  {order.isPaid ? 'Paid' : 'Unpaid'}
                                </Badge>
                              </div>
                              <Divider />
                              <div className="flex justify-between items-center">
                                <Text size="sm" color="dimmed">Total Amount:</Text>
                                <Text fw={700} size="sm" className="text-gray-900">
                                  ${order.totalPrice?.toFixed(2) || order.total?.toFixed(2) || '0.00'}
                                </Text>
                              </div>
                            </div>
                          </div>

                          {/* Shipping Address */}
                          {order.shippingAddress && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <IconTruck size={18} className="text-gray-600" />
                                <Text fw={600} size="sm" className="text-gray-900">
                                  Shipping Address
                                </Text>
                              </div>
                              <Text size="sm" color="dimmed" className="leading-relaxed">
                                {order.shippingAddress}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Collapse>
              </Paper>
            ))}
          </div>
        )}
      </Container>
    </RequireAdmin>
  );
}
