// controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../utils/validation');
require('dotenv').config();
const Vendor = require('../models/vendor.model');

exports.register = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};

exports.vendorRegister = async (req, res) => {
  try {
    const {
      poPrefix,
      name,
      contactPerson,
      contactNumber,
      mobileNumber,
      panNumber,
      email,
      gstNumber,
      bankDetails,
      address,
      remark,
      password // Additional field for authentication
    } = req.body;

    // Check if vendor with the same email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'A vendor with this email already exists' });
    }

    // Create vendor record
    const vendor = new Vendor({
      poPrefix,
      name,
      contactPerson,
      contactNumber,
      mobileNumber,
      panNumber,
      email,
      gstNumber,
      bankDetails: {
        name: bankDetails.name,
        branchName: bankDetails.branchName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode
      },
      address: {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode
      },
      remark,
      status: 'pending' // Optional: if you want to add approval workflow
    });

    // Create user account for vendor
    const user = new User({
      username: email, // Using email as username
      email,
      password,
      role: 'vendor',
      vendorId: vendor._id // Reference to vendor profile
    });

    await vendor.save();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      vendor: {
        id: vendor._id,
        vendorCode: vendor.vendorCode,
        name: vendor.name,
        email: vendor.email,
        status: vendor.status
      },
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ message: 'An error occurred during vendor registration' });
  }
};