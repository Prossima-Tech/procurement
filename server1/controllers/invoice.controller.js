const Invoice = require('../models/invoice.model');
const GRN = require('../models/grn.model');
const PurchaseOrder = require('../models/purchaseOrder.model');

class InvoiceController {
  async createInvoice(req, res) {
    try {
      const {
        grnId,
        invoiceNumber,
        invoiceDate,
        items,
        taxType,
        subTotal,
        cgstAmount,
        sgstAmount,
        utgstAmount,
        igstAmount,
        totalAmount
      } = req.body;
      console.log("req.body",req.body);
      // Fetch GRN with populated references
      const grn = await GRN.findById(grnId)

      console.log("grn",grn);
      if (!grn) {
        return res.status(404).json({
          success: false,
          message: 'GRN not found'
        });
      }
      if(grn.invoiceId){
        return res.status(400).json({
          success: false,
          message: 'Invoice already Exists'
        });
      }
      // Create invoice with all references
      const invoice = new Invoice({
        invoiceNumber,
        invoiceDate,
        grnId: grn._id,
        poId: grn.purchaseOrder._id,
        vendorId: grn.vendor.id, // Vendor ID from PO
        items: items.map(item => ({
          partId: item.partId,
          itemDetails: {
            partCode: item.partCode,
            itemName: item.itemName,
            sacHsnCode: item.sacHsnCode,
            uom: item.uom || item.itemDetails?.measurementUnit // Fallback to itemDetails if available
          },
          acceptedQuantity: item.acceptedQuantity,
          unitPrice: item.unitPrice,
          baseAmount: item.baseAmount,
          cgstRate: item.cgstRate,
          cgstAmount: item.cgstAmount,
          sgstRate: item.sgstRate,
          sgstAmount: item.sgstAmount,
          utgstRate: item.utgstRate,
          utgstAmount: item.utgstAmount,
          igstRate: item.igstRate,
          igstAmount: item.igstAmount,
          totalAmount: item.totalAmount
        })),
        taxType,
        subTotal,
        cgstAmount,
        sgstAmount,
        utgstAmount,
        igstAmount,
        totalAmount,
        status: 'pending'
      });

      await invoice.save();

      // Update GRN status
      await GRN.findByIdAndUpdate(grnId, {
        $set: { 
          status: 'invoice_created',
          invoiceId: invoice._id // Add reference to the created invoice
        },
        // $set: {
        //   status: 'invoice_created'
        // }
      });

      // Return success with populated data
      const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('vendorId', 'name email contactNumber gstin') // Add relevant vendor fields
        .populate('poId', 'poNumber date')
        .populate('grnId', 'grnNumber date');

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: populatedInvoice
      });

    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating invoice'
      });
    }
  }

  // Add method to get invoice details
  async getInvoiceById(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate('vendorId', 'name email contactNumber gstNumber')
        .populate('poId')
        .populate('grnId', 'grnNumber date')
        .lean();

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }
      console.log("invoice",invoice);
      res.status(200).json({
        success: true,
        data: invoice
      });

    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching invoice details'
      });
    }
  }
}

module.exports = new InvoiceController(); 