'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, PasswordInput, Button, Paper, Title, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { loginSchema, registerSchema, LoginFormData, RegisterFormData } from '../lib/zodSchemas';

interface Props {
  type: 'login' | 'register';
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: LoginFormData | RegisterFormData) => void;
}

export default function AuthForm({ type, loading, error, onSubmit }: Props) {
  const schema = type === 'login' ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
  });

  return (
    <Paper radius="md" p="xl" withBorder className="max-w-md mx-auto">
      <Title order={2} ta="center" mb="md">
        {type === 'login' ? 'Login' : 'Register'}
      </Title>
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          {...register('email')}
          error={errors.email?.message}
          required
        />
        <PasswordInput
          label="Password"
          placeholder="Password"
          {...register('password')}
          error={errors.password?.message}
          mt="md"
          required
        />
        <Button type="submit" fullWidth mt="xl" loading={loading}>
          {type === 'login' ? 'Login' : 'Register'}
        </Button>
      </form>
    </Paper>
  );
}
