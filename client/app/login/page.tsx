'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../lib/zodSchemas';
import { TextInput, PasswordInput, Button, Card, Title, Text, Stack, Alert } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { loginThunk } from '../../features/auth/authSlice';
import { IconMail, IconLock, IconAlertCircle, IconUser } from '@tabler/icons-react';
import Link from 'next/link';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, error, loading } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    await dispatch(loginThunk(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <Card shadow="xl" p="xl" radius="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title order={1} size="2rem" fw={700} c="green" mb="xs">
            Welcome Back
          </Title>
          <Text c="dimmed" size="sm">
            Sign in to your account to continue shopping
          </Text>
        </div>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email Address"
              placeholder="your@email.com"
              leftSection={<IconMail size={16} />}
              {...register('email')}
              error={errors.email?.message}
              radius="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              leftSection={<IconLock size={16} />}
              {...register('password')}
              error={errors.password?.message}
              radius="md"
            />

            <Button 
              type="submit" 
              loading={loading || isSubmitting} 
              fullWidth 
              size="lg"
              radius="md"
              mt="md"
              color="green"
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <div className="text-center mt-6">
          <Text size="sm" c="dimmed">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Create one here
            </Link>
          </Text>
        </div>


      </Card>
    </div>
  );
}
