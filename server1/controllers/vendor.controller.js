const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
exports.createVendor = async (req, res) => {
  try {
    // Check if a vendor with the same email already exists
    const existingVendor = await Vendor.findOne({ email: req.body.email });
    if (existingVendor) {
      return res.status(400).json({ message: 'A vendor with this email already exists' });
    }
    const vendor = new Vendor(req.body);
    console.log(vendor);
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const searchQuery = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'address.city': { $regex: search, $options: 'i' } },
          { 'address.state': { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const total = await Vendor.countDocuments(searchQuery);
    const vendors = await Vendor.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalVendors: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    // If email is being updated, check if it already exists
    if (req.body.email) {
      const existingVendor = await Vendor.findOne({
        email: req.body.email,
        _id: { $ne: req.params.id } // Exclude the current vendor
      });
      if (existingVendor) {
        return res.status(400).json({ message: 'A vendor with this email already exists' });
      }
    }

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/:code
exports.getVendorByCode = async (req, res) => {
  try {
    console.log("code recieved", req.params.code);
    const vendor = await Vendor.findOne({ vendorCode: req.params.code }, 'name gstNumber address');
    if (vendor) {
      vendor.compiledInfo = `${vendor.name}, ${vendor.gstNumber}, ${vendor.address}`;
    }
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    console.log(vendor);
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/searchVendors?query=:query
exports.searchVendors = async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const isNumber = /^\d+$/.test(searchTerm);

    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        ...(isNumber ? [{ vendorCode: Number(searchTerm) }] : [])
      ]
    };

    const vendors = await Vendor.find(searchQuery)
      .select('vendorCode name gstNumber address email contactPerson mobileNumber')
      .limit(10);

    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorByUserId = async (req, res) => {
  try {
    // console.log("userId received", req.params.userId);
    const user = await User.findById(req.params.userId);
    // console.log("user",user);
    const vendor = await Vendor.findById(user.vendorId);
    // console.log("vendor",vendor);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchaseOrdersByVendorId = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find({ vendorId: req.params.vendorId });
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

