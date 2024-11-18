const { PartCode, SizeName, ColourName, MakerName, MeasurementUnit } = require('../models/part.model');
const { Item } = require('../models/item.model');

exports.createPart = async (req, res) => {
  console.log(req.body);
  try {
    const {
      PartCodeNumber,
      ItemCode,
      SizeName,
      ColourName,
      SerialNumber,
      ItemMakeName,
      MeasurementUnit
    } = req.body;

    if (!PartCodeNumber || !ItemCode || !SerialNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: PartCodeNumber, ItemCode, and SerialNumber are required'
      });
    }

    const existingPart = await PartCode.findOne({ PartCodeNumber });
    if (existingPart) {
      return res.status(400).json({
        success: false,
        error: 'PartCodeNumber already exists'
      });
    }

    const item = await Item.findOne({ ItemCode: ItemCode });
    if (!item) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ItemCode'
      });
    }

    const newPart = await PartCode.create({
      PartCodeNumber,
      ItemCode: item._id,
      SizeName,
      ColourName,
      SerialNumber,
      ItemMakeName,
      MeasurementUnit
    });

    res.status(201).json({
      success: true,
      data: newPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllParts = async (req, res) => {
  try {
    console.log("req received for ", req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = req.query.search || '';

    console.log("search", search);

    let query = {};
    if (search) {
      query = {
        $or: [
          { PartCodeNumber: { $regex: search, $options: 'i' } },
          { SerialNumber: { $regex: search, $options: 'i' } },
          { SizeName: { $regex: search, $options: 'i' } },
          { ColourName: { $regex: search, $options: 'i' } },
          { ItemMakeName: { $regex: search, $options: 'i' } },
          { MeasurementUnit: { $regex: search, $options: 'i' } },
        ],
      };
    }

    console.log("query", query);
    const total = await PartCode.countDocuments(query);
    const parts = await PartCode.find(query)
      .populate('ItemCode', 'ItemCode ItemName')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const formattedParts = parts.map(part => ({
      ...part.toObject(),
      ItemCode: part.ItemCode ? part.ItemCode.ItemCode : null,
      ItemName: part.ItemCode ? part.ItemCode.ItemName : null
    }));

    res.json({
      success: true,
      data: formattedParts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

exports.getPart = async (req, res) => {
  try {
    const id = req.params.partId;
    const partData = await PartCode.findById(id);

    if (!partData) {
      return res.status(404).json({
        success: false,
        error: 'Part not found'
      });
    }

    res.status(200).json({
      success: true,
      data: partData
    });
  } catch (e) {
    res.status(500).json({ "error": e.message });
  }
};

exports.deletePart = async (req, res) => {
  try {
    const part = await PartCode.findById(req.params.id);
    if (!part) {
      return res.status(404).json({
        success: false,
        error: 'Part not found'
      });
    }
    await part.deleteOne();
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
};

exports.getPartByCode = async (req, res) => {
  try {
    console.log("req recieved for ", req.params);
    const code = req.params.code;
    const part = await PartCode.findOne({ PartCodeNumber: code }).populate('ItemCode');
    // console.log(part);
    if (!part) {
      console.log("Part not found");
      return res.status(404).json({ success: false, error: 'Part not found' });
    }
    console.log("Part found", part);
    res.status(200).json({ success: true, data: part });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updatePart = async (req, res) => {
  try {
    const {
      PartCodeNumber,
      ItemCode,
      SizeName,
      ColourName,
      SerialNumber,
      ItemMakeName,
      MeasurementUnit
    } = req.body;

    if (!PartCodeNumber || !ItemCode || !SerialNumber) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: PartCodeNumber, ItemCode, and SerialNumber are required'
      });
    }

    // Check if the PartCodeNumber exists but belongs to a different part
    const existingPart = await PartCode.findOne({
      PartCodeNumber,
      _id: { $ne: req.params.id }
    });

    if (existingPart) {
      return res.status(400).json({
        success: false,
        error: 'PartCodeNumber already exists'
      });
    }

    // Verify ItemCode exists
    const item = await Item.findOne({ ItemCode: ItemCode });
    if (!item) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ItemCode'
      });
    }

    const updatedPart = await PartCode.findByIdAndUpdate(
      req.params.id,
      {
        PartCodeNumber,
        ItemCode: item._id,
        SizeName,
        ColourName,
        SerialNumber,
        ItemMakeName,
        MeasurementUnit
      },
      { new: true }
    ).populate('ItemCode', 'ItemCode ItemName');

    if (!updatedPart) {
      return res.status(404).json({
        success: false,
        error: 'Part not found'
      });
    }

    // Format the response to match the getAllParts format
    const formattedPart = {
      ...updatedPart.toObject(),
      ItemCode: updatedPart.ItemCode.ItemCode,
      ItemName: updatedPart.ItemCode.ItemName
    };

    res.status(200).json({
      success: true,
      data: formattedPart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getPartByItemCode = async (req, res) => {
  try {
    const itemCode = req.params.itemCode;
    console.log("itemCode",itemCode);
    const parts = await PartCode.find({ ItemCode: itemCode });
    console.log("parts",parts);
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// SizeName controllers
exports.createSizeName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const existingSize = await SizeName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSize) {
      return res.status(400).json({ success: false, error: 'Size name already exists' });
    }
    const newSize = await SizeName.create({ name });
    res.status(201).json({ success: true, data: newSize });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllSizeNames = async (req, res) => {
  try {
    const sizes = await SizeName.find();
    res.status(200).json({ success: true, data: sizes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.searchSizeNames = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');
    const sizes = await SizeName.find({ name: regex });
    res.status(200).json({ success: true, data: sizes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteSizeName = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSize = await SizeName.findByIdAndDelete(id);
    if (!deletedSize) {
      return res.status(404).json({ success: false, error: 'Size not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ColourName controllers
exports.createColourName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const existingColour = await ColourName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingColour) {
      return res.status(400).json({ success: false, error: 'Colour name already exists' });
    }
    const newColour = await ColourName.create({ name });
    res.status(201).json({ success: true, data: newColour });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllColourNames = async (req, res) => {
  try {
    const colours = await ColourName.find();
    res.status(200).json({ success: true, data: colours });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.searchColourNames = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');
    const colours = await ColourName.find({ name: regex });
    res.status(200).json({ success: true, data: colours });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteColourName = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedColour = await ColourName.findByIdAndDelete(id);
    if (!deletedColour) {
      return res.status(404).json({ success: false, error: 'Colour not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// MakerName controllers
exports.createMakerName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const existingMaker = await MakerName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingMaker) {
      return res.status(400).json({ success: false, error: 'Maker name already exists' });
    }
    const newMaker = await MakerName.create({ name });
    res.status(201).json({ success: true, data: newMaker });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllMakerNames = async (req, res) => {
  try {
    const makers = await MakerName.find();
    res.status(200).json({ success: true, data: makers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.searchMakerNames = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');
    const makers = await MakerName.find({ name: regex });
    res.status(200).json({ success: true, data: makers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteMakerName = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMaker = await MakerName.findByIdAndDelete(id);
    if (!deletedMaker) {
      return res.status(404).json({ success: false, error: 'Maker not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// MeasurementUnit controllers
exports.createMeasurementUnit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    const existingUnit = await MeasurementUnit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingUnit) {
      return res.status(400).json({ success: false, error: 'Measurement unit already exists' });
    }
    const newUnit = await MeasurementUnit.create({ name });
    res.status(201).json({ success: true, data: newUnit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllMeasurementUnits = async (req, res) => {
  try {
    const units = await MeasurementUnit.find();
    res.status(200).json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.searchMeasurementUnits = async (req, res) => {
  try {
    const { query } = req.query;
    const regex = new RegExp(query, 'i');
    const units = await MeasurementUnit.find({ name: regex });
    res.status(200).json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.deleteMeasurementUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUnit = await MeasurementUnit.findByIdAndDelete(id);
    if (!deletedUnit) {
      return res.status(404).json({ success: false, error: 'Measurement unit not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.searchParts = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const startIndex = (page - 1) * limit;

    const regex = new RegExp(query, 'i');
    const filter = {
      $or: [
        { PartCodeNumber: regex },
        { SerialNumber: regex },
        { 'ItemCode.ItemCode': regex },
        { 'ItemCode.ItemName': regex },
        { SizeName: regex },
        { ColourName: regex },
        { ItemMakeName: regex },
        { MeasurementUnit: regex }
      ]
    };

    const totalDocs = await PartCode.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    const parts = await PartCode.find(filter)
      .populate('ItemCode', 'ItemCode ItemName')
      .skip(startIndex)
      .limit(limit);

    const formattedParts = parts.map(part => ({
      ...part.toObject(),
      ItemCode: part.ItemCode.ItemCode,
      ItemName: part.ItemCode.ItemName
    }));

    res.status(200).json({
      success: true,
      count: formattedParts.length,
      data: formattedParts,
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
};

