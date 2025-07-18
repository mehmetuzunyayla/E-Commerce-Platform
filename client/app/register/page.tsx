'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../../lib/zodSchemas';
import { TextInput, PasswordInput, Button, Card, Title, Text, Stack, Alert, Group } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useSelector } from 'react-redux';
import { RootState } from '../../features/store';
import { registerThunk } from '../../features/auth/authSlice';
import { IconUser, IconMail, IconPhone, IconLock, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import Link from 'next/link';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(result)) {
      setRegistrationSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card shadow="xl" p="xl" radius="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title order={1} size="2rem" fw={700} c="blue" mb="xs">
            Create Account
          </Title>
          <Text c="dimmed" size="sm">
            Join our community and start shopping today
          </Text>
        </div>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="lg">
            {error}
          </Alert>
        )}

        {registrationSuccess && (
          <Alert icon={<IconCheck size={16} />} color="green" mb="lg">
            Registration successful! Please check your email to verify your account.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="John"
                leftSection={<IconUser size={16} />}
                {...register('firstName')}
                error={errors.firstName?.message}
                radius="md"
              />
              <TextInput
                label="Last Name"
                placeholder="Doe"
                leftSection={<IconUser size={16} />}
                {...register('lastName')}
                error={errors.lastName?.message}
                radius="md"
              />
            </Group>

            <TextInput
              label="Email Address"
              placeholder="john@example.com"
              leftSection={<IconMail size={16} />}
              {...register('email')}
              error={errors.email?.message}
              radius="md"
            />

            <TextInput
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              leftSection={<IconPhone size={16} />}
              {...register('phone')}
              error={errors.phone?.message}
              radius="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
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
            >
              Create Account
            </Button>
          </Stack>
        </form>

        <div className="text-center mt-6">
          <Text size="sm" c="dimmed">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </Text>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text size="xs" c="dimmed" ta="center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </div>
      </Card>
    </div>
  );
}
