'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import { RootState } from '../features/store';
import { logout } from '../features/auth/authSlice';
import { Button } from '@mantine/core';

export default function Navbar() {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow mb-8">
        <div>
          <Link href="/" className="text-lg font-bold text-blue-600">
            E-Commerce
          </Link>
        </div>
        <div className="flex gap-4 items-center">
          <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow mb-8">
      <div>
        <Link href="/" className="text-lg font-bold text-blue-600">
          E-Commerce
        </Link>
      </div>
      <div className="flex gap-4 items-center">
        {isAuthenticated ? (
          <>
            <Link href="/cart" className="hover:underline">
              Cart
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            
            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <div className="flex gap-2 items-center">
                <Link href="/admin" className="hover:underline text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/products" className="hover:underline">
                  Products
                </Link>
                <Link href="/admin/categories" className="hover:underline">
                  Categories
                </Link>
                <Link href="/admin/orders" className="hover:underline">
                  Orders
                </Link>
                <Link href="/admin/users" className="hover:underline">
                  Users
                </Link>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span>{user?.email}</span>
              {user?.role === 'admin' && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
            <Button onClick={() => dispatch(logout())} color="red" variant="light">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/cart" className="hover:underline">
              Cart
            </Link>
            <Link href="/login" className="hover:underline">
              Login
            </Link>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
