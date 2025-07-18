'use client';
import { useWishlistSync } from '../hooks/useWishlistSync';

export default function WishlistSync() {
  useWishlistSync();
  return null; // This component doesn't render anything
} 