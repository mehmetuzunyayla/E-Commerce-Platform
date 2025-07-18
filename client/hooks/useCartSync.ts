import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './useAppDispatch';
import { RootState } from '../features/store';
import { fetchCart } from '../features/cart/cartSlice';

export const useCartSync = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch cart from backend when user logs in
      dispatch(fetchCart() as any);
    }
  }, [isAuthenticated, dispatch]);

  return { isAuthenticated };
}; 