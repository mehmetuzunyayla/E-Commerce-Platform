'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, TextInput, Textarea, Group, Stack, Alert } from '@mantine/core';
import { useDispatch } from 'react-redux';
import { addAddress, fetchAddresses } from '../features/address/addressSlice';
import { useState } from 'react';

const addressSchema = z.object({
  label: z.string().min(2, 'Label must be at least 2 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  zip: z.string().min(2, 'ZIP code must be at least 2 characters'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
});

type AddressInput = z.infer<typeof addressSchema>;

export default function AddressForm() {
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = async (data: AddressInput) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      await dispatch(addAddress(data) as any);
      setSuccess(true);
      reset();
      // Refresh the address list
      dispatch(fetchAddresses() as any);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      {success && (
        <Alert color="green" title="Success">
          Address saved successfully!
        </Alert>
      )}
      
      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}
      
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
        <Button type="submit" loading={submitting} fullWidth>
          Save Address
        </Button>
      </Stack>
    </form>
  );
}