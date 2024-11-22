const { calculateTotals, generatePoNumber } = require('../utils/purchaseOrderUtils');
const PurchaseOrder = require('../models/purchaseOrder.model');
const Project = require('../models/project.model'); // Import the Project model
const Unit = require('../models/unit.model'); // Import the Unit model
const { PartCode } = require('../models/part.model'); // Make sure to import this
const mongoose = require('mongoose');
const ItemPriceHistory = require('../models/itemPriceHistory');

// Add this function to handle price history updates
const updateItemPriceHistory = async (purchaseOrder) => {
    try {
        console.log('📊 Starting price history update for PO:', purchaseOrder._id);

        // Process each item in the purchase order
        for (const item of purchaseOrder.items) {
            console.log(`Processing item: ${item.partCode}`);

            // Create the price entry object
            const priceEntry = {
                vendor: purchaseOrder.vendorId,
                purchaseOrder: purchaseOrder._id,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                poDate: purchaseOrder.poDate || new Date(),
                metadata: {
                    project: purchaseOrder.projectId,
                    unit: purchaseOrder.unitId,
                    department: purchaseOrder.department
                }
            };

            // Find existing price history or create new one
            const existingHistory = await ItemPriceHistory.findOne({ item: item.partCode });

            if (existingHistory) {
                console.log('Updating existing price history');
                
                // Add new price entry to history array
                existingHistory.priceHistory.push(priceEntry);
                
                // Calculate new statistics
                const prices = existingHistory.priceHistory.map(entry => entry.unitPrice);
                existingHistory.statistics = {
                    averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
                    lowestPrice: Math.min(...prices),
                    highestPrice: Math.max(...prices),
                    lastPrice: item.unitPrice,
                    totalOrders: existingHistory.priceHistory.length
                };

                existingHistory.lastUpdated = new Date();
                await existingHistory.save();
                
                console.log(`✅ Updated price history for item: ${item.partCode}`);
            } else {
                console.log('Creating new price history record');
                
                // Create new price history document
                const newPriceHistory = new ItemPriceHistory({
                    item: item.partCode,
                    priceHistory: [priceEntry],
                    statistics: {
                        averagePrice: item.unitPrice,
                        lowestPrice: item.unitPrice,
                        highestPrice: item.unitPrice,
                        lastPrice: item.unitPrice,
                        totalOrders: 1
                    }
                });

                await newPriceHistory.save();
                console.log(`✅ Created new price history for item: ${item.partCode}`);
            }
        }

        console.log('✅ Price history update completed successfully');
    } catch (error) {
        console.error('❌ Error updating price history:', error);
        // Don't throw the error - we don't want to fail the PO creation
        // but we should log it for monitoring
    }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    console.log(" Starting purchase order creation");
    console.log(" Request body:", JSON.stringify(req.body, null, 2));

    const {
      vendorId,
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectCode,
      unitId,
      unitName,
      poDate,
      validUpto,
      status,
      invoiceTo,
      dispatchTo,
      items,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration
    } = req.body;

    console.log(" Generating PO Code");
    // const poCode = await generatePoNumber(unitId);
    // const generatePoCode = async (unitId) => {
    //   const unit = await Unit.findById(unitId).select('unitCode');
    //   if (!unit) {
    //     throw new Error('Unit not found');
    //   }
    //   const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
    //   return `${unit.unitCode}-${(lastNumber + 1).toString().padStart(5, '0')}`;
    // };
    // New function to generate PO code
    const generatePoCode = async (unitId) => {
      const unit = await Unit.findById(unitId).select('unitCode');
      if (!unit) {
        throw new Error('Unit not found');
      }
      const randomNumber = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
      return `${unit.unitCode}-${randomNumber}`;
    };
    // const generatePoCode = async (unitId, session) => {
    //   // Step 1: Find the unit
    //   const unit = await Unit.findById(unitId).select('unitCode');
    //   if (!unit) {
    //     throw new Error('Unit not found');
    //   }
    
    //   let attempts = 0;
    //   const maxAttempts = 5;
    
    //   while (attempts < maxAttempts) {
    //     // Step 2: Find the latest PO for this unit
    //     const latestPo = await PurchaseOrder.findOne({ unitId })
    //       .sort('-poCode')
    //       .select('poCode')
    //       .session(session);
    
    //     // Step 3: Determine the next number
    //     let nextNumber = 1;
    //     if (latestPo) {
    //       const lastNumber = parseInt(latestPo.poCode.split('-')[1]);
    //       nextNumber = lastNumber + 1;
    //     }
    
    //     // Step 4: Generate the new PO code
    //     const newPoCode = `${unit.unitCode}-${nextNumber.toString().padStart(5, '0')}`;
    
    //     try {
    //       // Step 5: Try to create a new PO with this code
    //       const newPo = new PurchaseOrder({ poCode: newPoCode, unitId });
    //       await newPo.save({ session });
    
    //       // Step 6: If successful, return the new PO code
    //       return newPoCode;
    //     } catch (error) {
    //       if (error.code === 11000) {
    //         // Step 7: Handle duplicate key error
    //         attempts++;
    //         console.log(`Attempt ${attempts}: PO code ${newPoCode} already exists. Retrying...`);
    //       } else {
    //         // Other error, throw it
    //         throw error;
    //       }
    //     }
    //   }
    
    //   // Step 8: If all attempts fail, throw an error
    //   throw new Error('Failed to generate a unique PO code after multiple attempts');
    // };

    const poCode = await generatePoCode(unitId);
    console.log(" Generated PO Code:", poCode);

    console.log(" Finding project by projectCode:", projectCode);
    const project = await Project.findOne({ projectCode });
    if (!project) {
      console.log(" Project not found for projectCode:", projectCode);
      return res.status(400).json({ success: false, message: 'Project not found' });
    }
    console.log(" Found project:", project._id);

    console.log(" Processing items");
    const processedItems = await Promise.all(items.map(async (item, index) => {
      console.log(` Processing item ${index + 1}:`, JSON.stringify(item, null, 2));
      const part = await PartCode.findOne({ PartCodeNumber: item.partCode });
      if (!part) {
        console.log(` Part not found for partCode:`, item.partCode);
        throw new Error(`Part with code ${item.partCode} not found`);
      }
      console.log(` Found part:`, part._id);
      return {
        partCode: part._id,
        // masterItemName: item.masterItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      };
    }));
    console.log(" Processed items:", JSON.stringify(processedItems, null, 2));

    console.log(" Creating new PurchaseOrder object");
    const newPurchaseOrder = new PurchaseOrder({
      vendorId: mongoose.Types.ObjectId(vendorId),
      vendorCode,
      vendorName,
      vendorAddress,
      vendorGst,
      projectId: project._id,
      unitId: mongoose.Types.ObjectId(unitId),
      unitName,
      poCode,
      poDate: poDate || new Date(),
      validUpto,
      status: status || 'draft',
      invoiceTo,
      dispatchTo,
      items: processedItems,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration,
      createdBy: req.user._id
    });

    console.log(" Calculating totals");
    const totals = calculateTotals(newPurchaseOrder.items);
    newPurchaseOrder.subTotal = totals.subTotal;
    newPurchaseOrder.tax = totals.tax;
    newPurchaseOrder.total = totals.total;
    console.log(" Calculated totals:", JSON.stringify(totals, null, 2));

    console.log(" Saving new PurchaseOrder");
    const savedPurchaseOrder = await newPurchaseOrder.save();
    console.log(" Saved PurchaseOrder:", savedPurchaseOrder._id);

    // Add price history update after PO is saved
    await updateItemPriceHistory(savedPurchaseOrder);

    res.status(201).json({
      success: true,
      message: 'Purchase Order created successfully',
      data: savedPurchaseOrder
    });
    console.log(" Purchase order creation completed successfully");
  } catch (error) {
    console.error('[createPurchaseOrder] Error creating purchase order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPurchaseOrders = await PurchaseOrder.countDocuments();
    const totalPages = Math.ceil(totalPurchaseOrders / limit);

    const purchaseOrders = await PurchaseOrder.find()
      .populate('vendorId', 'name code')
      .populate({
        path: 'items.partCode',
        populate: {
          path: 'ItemCode',
          select: 'ItemCode ItemName'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!purchaseOrders) {
      return res.status(404).json({ message: 'No purchase orders found' });
    }

    res.json({
      purchaseOrders,
      currentPage: page,
      totalPages,
      totalItems: totalPurchaseOrders
    });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendorId')
      .populate('projectId')
      .populate('unitId')
      .populate({
        path: 'items.partCode',
        populate: {
          path: 'ItemCode',
          select: 'ItemCode ItemName'
        }
      });

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    const formattedPO = {
      ...purchaseOrder.toObject(),
      vendorCode: purchaseOrder.vendorId.vendorCode,
      vendorName: purchaseOrder.vendorId.name,
      vendorAddress: `${purchaseOrder.vendorId.address.line1}, ${purchaseOrder.vendorId.address.line2}`,
      vendorGst: purchaseOrder.vendorId.gstNumber,
      projectCode: purchaseOrder.projectId.projectCode,
      projectName: purchaseOrder.projectId.projectName,
      unitCode: purchaseOrder.unitId.unitCode,
      unitName: purchaseOrder.unitId.unitName,
      items: purchaseOrder.items.map(item => ({
        partCode: item.partCode?.PartCodeNumber || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        masterItemName: item.partCode?.ItemCode?.ItemName || ''
      }))
    };

    res.json(formattedPO);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ message: error.message });
  }
};


exports.updatePurchaseOrder = async (req, res) => {
  try {
    const {
      vendorId,
      projectId,
      unitId,
      poDate,
      validUpto,
      status,
      invoiceTo,
      dispatchTo,
      items,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration
    } = req.body;

    // Process items
    const processedItems = await Promise.all(items.map(async (item) => {
      const part = await PartCode.findOne({ PartCodeNumber: item.partCode });
      if (!part) {
        throw new Error(`Part with code ${item.partCode} not found`);
      }
      return {
        partCode: part._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      };
    }));

    const updateData = {
      vendorId,
      projectId,
      unitId,
      poDate,
      validUpto,
      status,
      invoiceTo: {
        name: invoiceTo.name,
        branchName: invoiceTo.branchName,
        address: invoiceTo.address,
        city: invoiceTo.city,
        state: invoiceTo.state,
        pin: invoiceTo.pin
      },
      dispatchTo: {
        name: dispatchTo.name,
        branchName: dispatchTo.branchName,
        address: dispatchTo.address,
        city: dispatchTo.city,
        state: dispatchTo.state,
        pin: dispatchTo.pin
      },
      items: processedItems,
      deliveryDate,
      supplierRef,
      otherRef,
      dispatchThrough,
      destination,
      paymentTerms,
      deliveryTerms,
      poNarration
    };

    // Calculate totals
    const totals = calculateTotals(updateData.items);
    updateData.subTotal = totals.subTotal;
    updateData.tax = totals.tax;
    updateData.total = totals.total;

    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('items.partCode');

    if (!updatedPO) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    res.json({
      success: true,
      message: 'Purchase Order updated successfully',
      data: updatedPO
    });
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }
    res.json({ message: 'Purchase Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/:code
exports.getVendorByCode = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ code: req.params.code });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/vendors/search?query=:query
exports.searchVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      $or: [
        { code: { $regex: req.query.query, $options: 'i' } },
        { name: { $regex: req.query.query, $options: 'i' } }
      ]
    }).limit(10);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
