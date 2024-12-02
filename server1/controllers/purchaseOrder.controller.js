const { calculateTotals, generatePoNumber } = require('../utils/purchaseOrderUtils');
const PurchaseOrder = require('../models/purchaseOrder.model');
const Project = require('../models/project.model'); // Import the Project model
const Unit = require('../models/unit.model'); // Import the Unit model
const { PartCode } = require('../models/part.model'); // Make sure to import this
const mongoose = require('mongoose');
const ItemPriceHistory = require('../models/itemPriceHistory');
const { sendEmail } = require('../services/emailService');
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

exports.getGRNHistory = async (req, res) => {
  try {
    const poId = req.params.id;

    const po = await PurchaseOrder.findById(poId)
      .populate({
        path: 'grns',
        select: 'grnNumber challanNumber receivedDate status items totalValue',
        options: { sort: { receivedDate: -1 } }
      });

    if (!po) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found'
      });
    }

    const grnHistory = po.items.map(item => {
      const deliveryHistory = item.grnReferences.map(ref => ({
        grnId: ref.grnId,
        receivedQuantity: ref.receivedQuantity,
        receivedDate: ref.receivedDate
      }));

      return {
        partCode: item.partCode,
        orderedQuantity: item.quantity,
        deliveredQuantity: item.deliveredQuantity,
        pendingQuantity: item.pendingQuantity,
        deliveryHistory
      };
    });

    res.status(200).json({
      success: true,
      data: {
        poCode: po.poCode,
        deliveryStatus: po.deliveryStatus,
        isFullyDelivered: po.isFullyDelivered,
        items: grnHistory,
        grns: po.grns
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    console.log(" Starting purchase order creation");
    console.log(" Request body:", JSON.stringify(req.body, null, 2));

    const {
      vendorId,
      projectId, // Changed from projectCode to projectId
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

    console.log(" Generating PO Code");
    const generatePoCode = async (unitId) => {
      const unit = await Unit.findById(unitId).select('unitCode');
      if (!unit) {
        throw new Error('Unit not found');
      }
      const randomNumber = Math.floor(10000 + Math.random() * 90000);
      return `${unit.unitCode}-${randomNumber}`;
    };

    const poCode = await generatePoCode(unitId);
    console.log(" Generated PO Code:", poCode);

    // Find project directly by ID instead of projectCode
    console.log(" Finding project by projectId:", projectId);
    const project = await Project.findById(projectId);
    if (!project) {
      console.log(" Project not found for projectId:", projectId);
      return res.status(400).json({ success: false, message: 'Project not found' });
    }
    console.log(" Found project:", project._id);

    console.log(" Processing items");
    const processedItems = await Promise.all(items.map(async (item, index) => {
      console.log(` Processing item ${index + 1}:`, JSON.stringify(item, null, 2));
      // Changed to find by ID instead of PartCodeNumber
      const part = await PartCode.findById(item.partCode);
      if (!part) {
        console.log(` Part not found for partCode:`, item.partCode);
        throw new Error(`Part with ID ${item.partCode} not found`);
      }
      console.log(` Found part:`, part._id);
      return {
        partCode: part._id,
        quantity: item.quantity,
        deliveredQuantity: 0, // Added for GRN tracking
        pendingQuantity: item.quantity, // Added for GRN tracking
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        grnDeliveries: [] // Added for GRN tracking
      };
    }));

    console.log(" Processed items:", JSON.stringify(processedItems, null, 2));

    console.log(" Creating new PurchaseOrder object");
    const newPurchaseOrder = new PurchaseOrder({
      vendorId,
      projectId: project._id,
      unitId,
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
      deliveryStatus: 'pending', // Added for GRN tracking
      isFullyDelivered: false, // Added for GRN tracking
      grns: [], // Added for GRN tracking
      createdBy: req.user?._id
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
        partId: item.partCode,
        partCode: item.partCode?.PartCodeNumber || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        masterItemName: item.partCode?.ItemCode?.ItemName || '',
        // Add delivery details
        deliveredQuantity: item.deliveredQuantity || 0,
        pendingQuantity: item.pendingQuantity || item.quantity,
        grnDeliveries: item.grnDeliveries || []
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
      status: 'created',
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

//send notifications to vendors
// exports.notifyVendors = async (req,res) =>{
//   try {
//       const {  } = req.body;

//       // Fetch RFQ details
//       const rfq = await RFQ.findById(rfqId)
//           .populate('items.indentItemId')
//           .populate('selectedVendors.vendor');

//       if (!rfq) {
//           return res.status(404).json({ success: false, message: 'RFQ not found' });
//       }

//       // Fetch vendor details
//       const vendors = await Vendor.find({ _id: { $in: vendorIds } });

//       // Send emails to each vendor
//       for (const vendor of vendors) {
//           const emailContent = {
//               to: vendor.email,
//               subject: `New RFQ Request - ${rfq._id}`,
//               html: `
//                   <h2>Request for Quotation</h2>
//                   <p>Dear ${vendor.name},</p>
//                   <p>You have been invited to submit a quotation for the following items:</p>
//                   <ul>
//                       ${rfq.items.map(item => `
//                           <li>
//                               ${item.name} - Quantity: ${item.quantity}
//                               ${item.itemCode ? `(Item Code: ${item.itemCode})` : ''}
//                           </li>
//                       `).join('')}
//                   </ul>
//                   <p><strong>Submission Deadline:</strong> ${new Date(submissionDeadline).toLocaleDateString()}</p>
//                   <p><strong>General Terms:</strong></p>
//                   <p>${generalTerms}</p>
//                   <p>Please log in to our portal to submit your quotation.</p>
//                   <p>Best regards,<br>Procurement Team</p>
//               `
//           };

//           // Send email using your email service
//           await sendEmail(emailContent);
//       }

//       res.json({ success: true, message: 'Vendors notified successfully' });
//   } catch (error) {
//       console.error('Error notifying vendors:', error);
//       res.status(500).json({ success: false, message: 'Failed to notify vendors' });
//   }
// }

exports.notifyVendors = async (req, res) => {
  try {
    const { purchaseOrderId } = req.params;
    const { customMessage } = req.body;

    const po = await PurchaseOrder.findById(purchaseOrderId)
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

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    // Add custom message to email content
    const emailContent = {
      to: po.vendorId.email,
      subject: `New Purchase Order - ${po.poCode}`,
      html: `
        <h2>Purchase Order Notification</h2>
        <p>Dear ${po.vendorId.name},</p>
        
        ${customMessage ? `<div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #007bff;">
          <p><strong>Message:</strong> ${customMessage}</p>
        </div>` : ''}
        
        <p>A new purchase order has been created with the following details:</p>
        
        <div style="margin: 20px 0;">
          <p><strong>PO Number:</strong> ${po.poCode}</p>
          <p><strong>Project:</strong> ${po.projectId.projectName}</p>
          <p><strong>Unit:</strong> ${po.unitId.unitName}</p>
          <p><strong>Delivery Date:</strong> ${new Date(po.deliveryDate).toLocaleDateString()}</p>
        </div>

        <h3>Ordered Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">Item</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Unit Price</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
          </tr>
          ${po.items.map(item => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.partCode.ItemCode?.ItemName || 'N/A'}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.unitPrice}</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${item.totalPrice}</td>
            </tr>
          `).join('')}
        </table>

        <div style="margin: 20px 0;">
          <p><strong>Sub Total:</strong> ${po.subTotal}</p>
          <p><strong>Tax:</strong> ${po.tax}</p>
          <p><strong>Total Amount:</strong> ${po.total}</p>
        </div>

        <div style="margin: 20px 0;">
          <p><strong>Payment Terms:</strong> ${po.paymentTerms}</p>
          <p><strong>Delivery Terms:</strong> ${po.deliveryTerms}</p>
        </div>

        <p>Please review the purchase order and proceed with the delivery as per the terms mentioned.</p>
        <p>Best regards,<br>Procurement Team</p>
      `
    };

    await sendEmail(emailContent);

    res.json({ 
      success: true, 
      message: 'Purchase Order notification sent successfully to vendor' 
    });
  } catch (error) {
    console.error('Error sending PO notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send Purchase Order notification' 
    });
  }
};