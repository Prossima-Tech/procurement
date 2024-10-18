const {Item,ItemCategory} = require('../models/item.model');

// Get a single item by ID
exports.getItemById = async (req, res) => {
  try {
    const itemData = await Item.findById(req.params.itemId);

    if (!itemData) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: itemData
    });
  } catch (error) {
    console.error("Error in getItemById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const {
      ItemCode,
      ItemName,
      type,
      SAC_HSN_Code,
      ItemCategory,
      SerialNumber,
      Remarks,
      IGST_Rate,
      CGST_Rate,
      SGST_Rate,
      UTGST_Rate
    } = req.body;

    if (!ItemCode || !ItemName || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: ItemCode, ItemName, and type are required'
      });
    }
    console.log("ItemCode",ItemCode);
    const existingItem = await Item.findOne({ ItemCode: { $eq: ItemCode }  });
    
    if (existingItem) {
      // console.log("existingItem",existingItem);
      return res.status(400).json({
        success: false,
        error: 'ItemCode already exists'
      });
    }

    const newItem = await Item.create({
      ItemCode,
      ItemName,
      type,
      SAC_HSN_Code: SAC_HSN_Code || '',
      ItemCategory: ItemCategory || '',
      SerialNumber: SerialNumber || '',
      Remarks: Remarks || '',
      IGST_Rate: IGST_Rate || null,
      CGST_Rate: CGST_Rate || null,
      SGST_Rate: SGST_Rate || null,
      UTGST_Rate: UTGST_Rate || null
    });

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error("Error in createItem:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get all items with pagination
exports.getAllItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const startIndex = (page - 1) * limit;

    const totalDocs = await Item.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const items = await Item.find()
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalDocs,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error in getAllItems:", error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update an item
exports.updateItem = async (req, res) => {
  try {
    const updateFields = {};
    const fieldsToUpdate = [
      'ItemCode', 'ItemName', 'type', 'SAC_HSN_Code', 'ItemCategory',
      'SerialNumber', 'Remarks', 'IGST_Rate', 'CGST_Rate', 'SGST_Rate', 'UTGST_Rate'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
    });

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("Error in updateItem:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete an item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }
    await item.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error("Error in deleteItem:", error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new ItemCategory
exports.createItemCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: name is required'
      });
    }

    const newItemCategory = await ItemCategory.create({ name });

    res.status(201).json({
      success: true,
      data: newItemCategory
    });
  } catch (error) {
    console.error("Error in createItemCategory:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Search ItemCategories
exports.searchItemCategories = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');

    const categories = await ItemCategory.find({ name: regex });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error in searchItemCategories:", error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get all ItemCategories
exports.getAllItemCategories = async (req, res) => {
  try {
    console.log("reached endpoint")
    const categories = await ItemCategory.find();
    console.log("categories",categories);
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error in getAllItemCategories:", error);
    res.status(501).json({
      success: false,
      error: 'Server Error'
    });
  }
};
