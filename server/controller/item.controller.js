const router = require('express').Router();
const Item = require('../model/item.model');

// Get a single item by ID
router.get('/getItem/:itemId', async (req, res) => {
  try {
    const id = req.params.itemId;
    const itemData = await Item.findById(id);

    if (!itemData) {
      return res.status(404).json({
        success: false,
        error: 'Item not found'
      });
    }

    console.log(itemData);
    res.status(200).json({
      success: true,
      data: itemData
    });

  } catch (e) {
    console.log("err " + e)
    res.status(500).json({ "error": e.message });
  }
});//tested completely

// Create a new item
router.post('/createItem', async (req, res) => {
  try {
    const {
      ItemCode,
      ItemName,
      type,
      SAC_HSN_Code,
      ItemCategory,
      SerialNumber,
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

    // Check if ItemCode already exists
    const existingItem = await Item.findOne({ ItemCode });
    if (existingItem) {
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
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}); //tested completely

// Get all items with pagination
router.get('/allItems', async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});//tested completely

// Update an item
router.put('/updateItem/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const {
      ItemCode,
      ItemName,
      type,
      SAC_HSN_Code,
      ItemCategory,
      SerialNumber,
      IGST_Rate,
      CGST_Rate,
      SGST_Rate,
      UTGST_Rate
    } = req.body;

    // Construct update object with only defined fields
    const updateFields = {};
    if (ItemCode !== undefined) updateFields.ItemCode = ItemCode;
    if (ItemName !== undefined) updateFields.ItemName = ItemName;
    if (type !== undefined) updateFields.type = type;
    if (SAC_HSN_Code !== undefined) updateFields.SAC_HSN_Code = SAC_HSN_Code;
    if (ItemCategory !== undefined) updateFields.ItemCategory = ItemCategory;
    if (SerialNumber !== undefined) updateFields.SerialNumber = SerialNumber;
    if (IGST_Rate !== undefined) updateFields.IGST_Rate = IGST_Rate;
    if (CGST_Rate !== undefined) updateFields.CGST_Rate = CGST_Rate;
    if (SGST_Rate !== undefined) updateFields.SGST_Rate = SGST_Rate;
    if (UTGST_Rate !== undefined) updateFields.UTGST_Rate = UTGST_Rate;

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete an item
router.delete('/deleteItem/:id', async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}); //tested completely

module.exports = router;

