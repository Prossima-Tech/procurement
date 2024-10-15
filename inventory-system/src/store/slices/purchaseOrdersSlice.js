import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  purchaseOrders: [],
  status: 'idle',
  error: null,
};

const purchaseOrdersSlice = createSlice({
  name: 'purchaseOrders',
  initialState,
  reducers: {
    setPurchaseOrders: (state, action) => {
      state.purchaseOrders = action.payload;
    },
    addPurchaseOrder: (state, action) => {
      state.purchaseOrders.push(action.payload);
    },
    updatePurchaseOrder: (state, action) => {
      const index = state.purchaseOrders.findIndex(po => po.id === action.payload.id);
      if (index !== -1) {
        state.purchaseOrders[index] = action.payload;
      }
    },
    deletePurchaseOrder: (state, action) => {
      state.purchaseOrders = state.purchaseOrders.filter(po => po.id !== action.payload);
    },
  },
});

export const { setPurchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = purchaseOrdersSlice.actions;

export default purchaseOrdersSlice.reducer;