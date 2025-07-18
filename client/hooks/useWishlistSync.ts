import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { RootState } from '../features/store';
import { fetchWishlist, syncWishlist } from '../features/wishlist/wishlistSlice';

export const useWishlistSync = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch wishlist from backend when user logs in
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      // Sync local wishlist to backend when user is authenticated
      dispatch(syncWishlist(items));
    }
  }, [isAuthenticated, items, dispatch]);

  return { isAuthenticated };
}; 