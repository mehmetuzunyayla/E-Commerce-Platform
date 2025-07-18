import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import cartReducer from './cart/cartSlice';
import orderReducer from './order/orderSlice';
import addressReducer from './address/addressSlice';
import reviewReducer from './review/reviewSlice';
import wishlistReducer from './wishlist/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    address: addressReducer,
    review: reviewReducer,
    wishlist: wishlistReducer,  // 👈 Add this line!

    // ...other reducers
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
