'use client';
import Link from 'next/link';
import { Button } from '@mantine/core';

export default function OrderSuccessPage() {
  return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">Thank you for your order!</h1>
      <p className="mb-8">Your order was placed successfully. You can view your order details in your <Link href="/profile" className="text-blue-600 underline">profile</Link>.</p>
      <Link href="/">
        <Button color="blue" fullWidth>
          Go back to Home
        </Button>
      </Link>
    </div>
  );
}
