const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');


// GET /api/vendors/searchVendors?query=:query
router.get('/searchVendors',
  // authenticate,
  // authorize(['admin', 'manager', 'employee'], ['read_vendors']),
  asyncHandler(vendorController.searchVendors)
);

// Create vendor
router.post('/',
  authenticate,
  authorize(['admin', 'manager'], ['create_vendor']),
  asyncHandler(vendorController.createVendor)
);

// Get all vendors
router.get('/',
  authenticate,
  authorize(['admin', 'manager', 'employee'], ['read_vendors']),
  asyncHandler(vendorController.getAllVendors)
);

// Get vendor by ID
router.get('/:id',
  authenticate,
  authorize(['admin', 'manager', 'employee'], ['read_vendors']),
  asyncHandler(vendorController.getVendorById)
);

// Update vendor
router.put('/:id',
  authenticate,
  authorize(['admin', 'manager'], ['update_vendor']),
  asyncHandler(vendorController.updateVendor)
);

// Delete vendor
router.delete('/:id',
  authenticate,
  authorize(['admin', 'manager'], ['delete_vendor']),
  asyncHandler(vendorController.deleteVendor)
);

// // GET /api/vendors/getByCode/:code
router.get('/getByCode/:code',
  // authenticate,
  // authorize(['admin', 'manager', 'employee'], ['read_vendors']),
  asyncHandler(vendorController.getVendorByCode)
);

// GET /api/vendors/getVendorByUserId/:userId
router.get('/getVendorByUserId/:userId',
  asyncHandler(vendorController.getVendorByUserId)
);

// GET /api/vendors/purchase-orders/:vendorId
router.get('/purchase-orders/:vendorId',
  asyncHandler(vendorController.getPurchaseOrdersByVendorId)
);

module.exports = router;