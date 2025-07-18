'use client';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../features/store';
import { useEffect, useState } from 'react';
import { fetchAddresses, deleteAddress, selectAddress } from '../features/address/addressSlice';
import { Button, Modal, TextInput, Textarea, Group, Stack } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  fullName: z.string().min(1, 'Full name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(10, 'Phone number is required'),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function AddressList({ selectable = false }: { selectable?: boolean }) {
  const { addresses, selectedAddressId, loading } = useSelector((state: RootState) => state.address);
  const dispatch = useDispatch();
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    dispatch(fetchAddresses() as any);
  }, [dispatch]);

  const onSubmit = async (data: AddressForm) => {
    setSubmitting(true);
    try {
      await api.post('/addresses', data);
      dispatch(fetchAddresses() as any);
      setAddModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAddress = () => {
    // If we're already on profile page, open the modal instead
    if (typeof window !== 'undefined' && window.location.pathname === '/profile') {
      setAddModalOpen(true);
    } else {
      // Redirect to profile page for address management
      router.push('/profile');
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Shipping Addresses</h3>
        <Button 
          size="sm" 
          color="blue" 
          onClick={handleAddAddress}
        >
          Add Address
        </Button>
      </div>

      {!addresses.length ? (
        <div className="text-center py-8 text-gray-600">
          <p>No addresses found.</p>
          <p className="text-sm mt-2">Add an address to continue with checkout.</p>
          {typeof window !== 'undefined' && window.location.pathname !== '/profile' && (
            <Button 
              mt="md" 
              color="blue" 
              onClick={handleAddAddress}
            >
              Go to Profile to Add Address
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {addresses.map(addr => (
            <li
              key={addr._id}
              className={`p-4 border rounded flex justify-between items-center ${
                selectable && selectedAddressId === addr._id ? 'bg-blue-100' : ''
              }`}
            >
              <div>
                <div className="font-bold">{addr.label}</div>
                <div>{addr.fullName}, {addr.street}, {addr.city}, {addr.country}, {addr.zip}</div>
                <div>Phone: {addr.phone}</div>
              </div>
              <div className="flex gap-2">
                {selectable && (
                  <Button size="xs" color="blue" onClick={() => dispatch(selectAddress(addr._id))}>
                    {selectedAddressId === addr._id ? "Selected" : "Select"}
                  </Button>
                )}
                <Button size="xs" color="red" onClick={() => dispatch(deleteAddress(addr._id) as any)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Address Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Address"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Label (e.g., Home, Office)"
              placeholder="Home"
              {...register('label')}
              error={errors.label?.message}
            />
            
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            
            <Textarea
              label="Street Address"
              placeholder="123 Main St"
              {...register('street')}
              error={errors.street?.message}
            />
            
            <Group grow>
              <TextInput
                label="City"
                placeholder="New York"
                {...register('city')}
                error={errors.city?.message}
              />
              <TextInput
                label="Country"
                placeholder="United States"
                {...register('country')}
                error={errors.country?.message}
              />
            </Group>
            
            <Group grow>
              <TextInput
                label="ZIP Code"
                placeholder="10001"
                {...register('zip')}
                error={errors.zip?.message}
              />
              <TextInput
                label="Phone Number"
                placeholder="+1 (555) 123-4567"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </Group>
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Address
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
