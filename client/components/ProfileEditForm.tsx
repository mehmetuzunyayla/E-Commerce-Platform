'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../lib/zodSchemas';
import { TextInput, PasswordInput, Button } from '@mantine/core';
import { useSelector } from 'react-redux';
import { RootState } from '../features/store';
import api from '../lib/api';
import { useState } from 'react';

export default function ProfileEditForm() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setServerError('');
    setSuccess(false);
    try {
      await api.put('/auth/profile', data); // Your backend should support this endpoint
      setSuccess(true);
      reset({ ...data, password: '' });
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <TextInput label="Full Name" {...register('fullName')} error={errors.fullName?.message} />
      <TextInput label="Email" {...register('email')} error={errors.email?.message} />
      <PasswordInput label="New Password (optional)" {...register('password')} error={errors.password?.message} />
      <Button type="submit" loading={isSubmitting}>
        Save Changes
      </Button>
      {success && <div className="text-green-600">Profile updated!</div>}
      {serverError && <div className="text-red-600">{serverError}</div>}
    </form>
  );
}
