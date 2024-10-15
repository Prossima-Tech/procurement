import { configureStore } from '@reduxjs/toolkit';
import vendorsReducer from './slices/vendorsSlice';
import itemsReducer from './slices/itemsSlice';
import purchaseOrdersReducer from './slices/purchaseOrdersSlice';

export const store = configureStore({
  reducer: {
    vendors: vendorsReducer,
    items: itemsReducer,
    purchaseOrders: purchaseOrdersReducer,
  },
});