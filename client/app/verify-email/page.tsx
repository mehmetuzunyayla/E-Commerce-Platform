// client/app/verify-email/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Text, Button, Loader } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import api from '../../lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token found in URL');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage('Email verified successfully! You can now login.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleLogin = () => {
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <Card shadow="md" p="xl">
          <Loader size="lg" className="mb-4" />
          <Text size="lg" fw={500}>Verifying your email...</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card shadow="md" p="xl">
        <div className="text-center">
          {status === 'success' ? (
            <IconCheck size={48} color="green" className="mx-auto mb-4" />
          ) : (
            <IconX size={48} color="red" className="mx-auto mb-4" />
          )}
          
          <Text size="xl" fw={700} mb="md" c={status === 'success' ? 'green' : 'red'}>
            {status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </Text>
          
          <Text mb="lg" c="dimmed">
            {message}
          </Text>
          
          {status === 'success' && (
            <Button onClick={handleLogin} color="blue" fullWidth>
              Go to Login
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
