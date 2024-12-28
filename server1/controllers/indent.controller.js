const Indent = require('../models/indent.model');
const User = require('../models/user.model');
const Unit = require('../models/unit.model');
const Project = require('../models/project.model');

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

// Add this function at the top of the file
const getDepartmentCode = (unitName) => {
  const departmentCodes = {
    'finance': 'FIN',
    'human resource': 'HR',
    'supply chain management': 'SCM',
    'legal': 'LEG',
    'information technology': 'IT',
    'operations': 'OPS',
    'marketing': 'MKT',
    'research and development': 'RND',
    'quality assurance': 'QA',
    'administration': 'ADM',
    'procurement': 'PRO',
    'accounts': 'ACC'
    // Add more department mappings as needed
  };

  // Convert unit name to lowercase and find matching code
  const normalizedName = unitName.toLowerCase();
  
  // Check for exact matches first
  if (departmentCodes[normalizedName]) {
    return departmentCodes[normalizedName];
  }

  // Check for partial matches
  for (const [dept, code] of Object.entries(departmentCodes)) {
    if (normalizedName.includes(dept)) {
      return code;
    }
  }

  // If no match found, return first 3 letters in uppercase
  return unitName.slice(0, 3).toUpperCase();
};

// Create new indent
exports.createIndent = async (req, res) => {
  try {
    const {
      employeeId,
      managerId,
      unitId,
      projectId,
      items,
      purpose,
      priority = 'medium',
      status = 'draft'
    } = req.body;

    // Basic validation
    if (!employeeId || !managerId || !unitId || !projectId || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, Manager ID, Unit ID, Project ID, and Purpose are required fields'
      });
    }

    // Validate Unit exists and is active
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Unit ID or Unit not found'
      });
    }

    // Generate Indent Number
    const currentYear = new Date().getFullYear();
    
    // Get count of indents for this unit in current year
    const indentCount = await Indent.countDocuments({
      unit: unitId,
      createdAt: {
        $gte: new Date(currentYear, 0, 1),
        $lt: new Date(currentYear + 1, 0, 1)
      }
    });

    // Format: UnitName_Year_SerialNumber
    const indentNumber = `${getDepartmentCode(unit.unitName)}_${currentYear}_${(indentCount + 1).toString().padStart(3, '0')}`;

    // Create new indent
    const indent = new Indent({
      indentNumber,
      employee: employeeId,
      manager: managerId,
      unit: unitId,
      project: projectId,
      items: {
        existing: items.existing.map(item => ({
          name: item.name,
          quantity: item.quantity,
          reference: item.reference,
          itemCode: item.itemCode
        })),
        new: items.new || []
      },
      purpose,
      priority,
      status
    });

    await indent.save();

    // Populate all references
    const populatedIndent = await Indent.findById(indent._id)
      .populate('employee', 'username email')
      .populate('manager', 'username email')
      .populate('unit', 'unitName unitCode')
      .populate('project', 'projectName projectCode projectLocation');

    res.status(201).json({
      success: true,
      message: 'Indent created successfully',
      data: populatedIndent
    });

  } catch (error) {
    if (error.code === 11000) {
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
      unitId,
      projectId,
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
    if (unitId) filter.unit = unitId;
    if (projectId) filter.project = projectId;

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
      .populate('employee', 'username email')
      .populate('manager', 'username email')
      .populate('unit', 'unitName unitCode')
      .populate('project', 'projectName projectCode projectLocation')
      .sort(sortObject);

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
      .populate('manager', 'username email')
      .populate('unit', 'unitName unitCode')
      .populate('project', 'projectName projectCode projectLocation');

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
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid indent ID format'
      });
    }
    handleError(res, error);
  }
};

exports.managerApproval = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved, remarks } = req.body;
        
        // First check the current status
        const currentIndent = await Indent.findById(id);
        
        if (!currentIndent) {
            return res.status(404).json({
                success: false,
                message: 'Indent not found'
            });
        }

        if (currentIndent.status !== 'submitted') {
            return res.status(400).json({
                success: false,
                message: 'Invalid indent status for manager approval'
            });
        }

        // Proceed with update
        const updatedIndent = await Indent.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: approved ? 'manager_approved' : 'manager_rejected',
                    managerRemarks: remarks,
                    managerId: req.user._id,
                    managerActionDate: new Date()
                }
            },
            { 
                new: true,
                runValidators: false
            }
        );

        res.status(200).json({
            success: true,
            message: `Indent ${approved ? 'approved' : 'rejected'} successfully`,
            data: updatedIndent
        });

    } catch (error) {
        console.error('Manager approval error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing manager approval',
            error: error.message
        });
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

exports.getManagerIndents = async (req, res) => {
    try {
        const managerId = req.user._id;
        // console.log("managerId from auth:", managerId);

        // Build filter object with manager ID
        const filter = {
            manager: managerId
        };

        // Get indents for this manager
        const indents = await Indent.find(filter)
            .populate('employee', 'username email')
            .populate('manager', 'username email')
            .populate('unit', 'unitName unitCode')
            .populate('project', 'projectName projectCode projectLocation')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: indents
        });

    } catch (error) {
        console.error('Error fetching manager indents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching manager indents',
            error: error.message
        });
    }
};