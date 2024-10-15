import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

export const fetchVendors = createAsyncThunk(
  'vendors/fetchVendors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/vendors');
      if (!response.ok) throw new Error('Failed to fetch vendors');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addVendor = createAsyncThunk(
  'vendors/addVendor',
  async (vendor, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      if (!response.ok) throw new Error('Failed to add vendor');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/updateVendor',
  async (vendor, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      if (!response.ok) throw new Error('Failed to update vendor');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/deleteVendor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete vendor');
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: {
    vendors: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        toast.error(`Failed to fetch vendors: ${action.payload}`);
      })
      .addCase(addVendor.fulfilled, (state, action) => {
        state.vendors.push(action.payload);
        toast.success('Vendor added successfully');
      })
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex(vendor => vendor.id === action.payload.id);
        if (index !== -1) {
          state.vendors[index] = action.payload;
        }
        toast.success('Vendor updated successfully');
      })
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter(vendor => vendor.id !== action.payload);
        toast.success('Vendor deleted successfully');
      });
  },
});

export default vendorsSlice.reducer;