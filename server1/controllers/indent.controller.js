const Indent = require('../models/indent.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

// Helper function for error handling
const handleError = (res, error) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
};

// Create new indent
exports.createIndent = async (req, res) => {
    try {
      const {
        employeeId,  // User ObjectId
        managerId,   // User ObjectId
        existingItems,
        newItems,
        purpose,
        priority = 'medium',  // Default value if not provided
        status = 'draft'      // Default value if not provided
      } = req.body;
  
      // Basic validation
      if (!employeeId || !managerId || !purpose) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID, Manager ID, and Purpose are required fields'
        });
      }
  
      // Validate items (at least one item required)
      if ((!existingItems || existingItems.length === 0) && 
          (!newItems || newItems.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'At least one item (existing or new) is required'
        });
      }
  
      // Create new indent
      const indent = new Indent({
        employee: employeeId,
        manager: managerId,
        items: {
          existing: existingItems || [],
          new: newItems || []
        },
        purpose,
        priority,
        status
      });
  
      await indent.save();
  
      // Populate employee and manager references
      const populatedIndent = await Indent.findById(indent._id)
        .populate('employee', 'username email')  // Adjust fields based on your User model
        .populate('manager', 'username email');  // Adjust fields based on your User model
  
      res.status(201).json({
        success: true,
        message: 'Indent created successfully',
        data: populatedIndent
      });
  
    } catch (error) {
      // Handle specific MongoDB errors
      if (error.code === 11000) {  // Duplicate key error
        return res.status(400).json({
          success: false,
          message: 'Duplicate indent number'
        });
      }
      handleError(res, error);
    }
  };
  
  // Get all indents with optional filters
  exports.getAllIndents = async (req, res) => {
    try {
      const {
        status,
        priority,
        employeeId,
        managerId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;
  
      // Build filter object
      const filter = {};
  
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (employeeId) filter.employee = employeeId;
      if (managerId) filter.manager = managerId;
  
      // Add date range filter if provided
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }
  
      // Build sort object
      const sortObject = {};
      sortObject[sortBy] = order === 'desc' ? -1 : 1;
  
      const indents = await Indent.find(filter)
        .populate('employee', 'username email')  // Adjust fields based on your User model
        .populate('manager', 'username email')   // Adjust fields based on your User model
        .sort(sortObject);
  
      // Get total count for pagination if needed
      const totalCount = await Indent.countDocuments(filter);
  
      res.json({
        success: true,
        count: indents.length,
        totalCount,
        data: indents
      });
  
    } catch (error) {
      handleError(res, error);
    }
  };
  
  // Get single indent by ID
  exports.getIndentById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const indent = await Indent.findById(id)
        .populate('employee', 'username email')
        .populate('manager', 'username email');
  
      if (!indent) {
        return res.status(404).json({
          success: false,
          message: 'Indent not found'
        });
      }
  
      res.json({
        success: true,
        data: indent
      });
  
    } catch (error) {
      // Handle invalid ObjectId
      if (error.kind === 'ObjectId') {
        return res.status(400).json({
          success: false,
          message: 'Invalid indent ID format'
        });
      }
      handleError(res, error);
    }
  };

// exports.managerApproval = async (req, res) => {
//   try {
//     const { approved, remarks } = req.body;
    
//     // Find indent and verify manager
//     const indent = await Indent.findOne({
//       _id: req.params.id,
//       manager: req.user._id,
//       status: 'submitted'
//     });

//     if (!indent) {
//       return res.status(404).json({
//         success: false,
//         message: 'Indent not found or not pending approval'
//       });
//     }

//     // Update approval details
//     indent.status = approved ? 'manager_approved' : 'manager_rejected';
//     indent.approvalDetails.managerApproval = {
//       approved,
//       date: new Date(),
//       remarks
//     };

//     await indent.save();

//     res.json({
//       success: true,
//       message: `Indent ${approved ? 'approved' : 'rejected'} successfully`,
//       data: indent
//     });

//   } catch (error) {
//     handleError(res, error);
//   }
// };

// exports.adminApproval = async (req, res) => {
//   try {
//     const { approved, remarks } = req.body;

//     // Verify user is admin
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admin can perform this action'
//       });
//     }

//     // Find indent
//     const indent = await Indent.findOne({
//       _id: req.params.id,
//       status: 'manager_approved'
//     });

//     if (!indent) {
//       return res.status(404).json({
//         success: false,
//         message: 'Indent not found or not ready for admin approval'
//       });
//     }

//     // Update approval details
//     indent.status = approved ? 'admin_approved' : 'admin_rejected';
//     indent.approvalDetails.adminApproval = {
//       approved,
//       date: new Date(),
//       remarks
//     };

//     await indent.save();

//     res.json({
//       success: true,
//       message: `Indent ${approved ? 'approved' : 'rejected'} by admin`,
//       data: indent
//     });

//   } catch (error) {
//     handleError(res, error);
//   }
// };

// exports.saveDraft = async (req, res) => {
//   try {
//     const {
//       managerId,
//       existingItems,
//       newItems,
//       purpose,
//       priority
//     } = req.body;

//     const indent = new Indent({
//       employee: req.user._id,
//       manager: managerId,
//       items: {
//         existing: existingItems || [],
//         new: newItems || []
//       },
//       purpose,
//       priority,
//       status: 'draft'
//     });

//     await indent.save();

//     res.status(201).json({
//       success: true,
//       message: 'Indent saved as draft',
//       data: indent
//     });

//   } catch (error) {
//     handleError(res, error);
//   }
// };

// exports.updateDraft = async (req, res) => {
//   try {
//     const indent = await Indent.findOne({
//       _id: req.params.id,
//       employee: req.user._id,
//       status: 'draft'
//     });

//     if (!indent) {
//       return res.status(404).json({
//         success: false,
//         message: 'Draft not found'
//       });
//     }

//     const updatedIndent = await Indent.findByIdAndUpdate(
//       req.params.id,
//       { 
//         ...req.body,
//         status: 'draft' 
//       },
//       { new: true, runValidators: true }
//     );

//     res.json({
//       success: true,
//       message: 'Draft updated successfully',
//       data: updatedIndent
//     });

//   } catch (error) {
//     handleError(res, error);
//   }
// };

// exports.deleteDraft = async (req, res) => {
//   try {
//     const indent = await Indent.findOne({
//       _id: req.params.id,
//       employee: req.user._id,
//       status: 'draft'
//     });

//     if (!indent) {
//       return res.status(404).json({
//         success: false,
//         message: 'Draft not found'
//       });
//     }

//     await indent.remove();

//     res.json({
//       success: true,
//       message: 'Draft deleted successfully'
//     });

//   } catch (error) {
//     handleError(res, error);
//   }
// };