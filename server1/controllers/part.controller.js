
const {PartCode, SizeName, ColourName, MakerName, MeasurementUnit} = require('../models/part.model');
const Item = require('../models/item.model');

exports.createPart = async (req, res) => {
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

    const item = await Item.findOne({ ItemCode });
    if (!item) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ItemCode'
      });
    }

    const newPart = await PartCode.create({
      PartCodeNumber,
      ItemCode,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 15;
    const startIndex = (page - 1) * limit;

    const totalDocs = await PartCode.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const parts = await PartCode.find()
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: parts.length,
      data: parts,
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

















// const router = require('express').Router();
// const {PartCode,SizeName,ColourName,MakerName,MeasurementUnit} = require('../model/part.model');
// const { Item } = require('../model/item.model');

// router.post('/createPart', async (req, res) => {
//   try {
//     const {
//       PartCodeNumber,
//       ItemCode,//should we use item name or itemCode?
//       SizeName,
//       ColourName,
//       SerialNumber,
//       ItemMakeName,
//       MeasurementUnit
//     } = req.body;

//     if (!PartCodeNumber || !ItemCode || !SerialNumber) {
//       return res.status(400).json({
//         success: false,
//         error: 'Missing required fields: PartCodeNumber, ItemCode, and SerialNumber are required'
//       });
//     }

//     // Check if PartCodeNumber already exists
//     const existingPart = await PartCode.findOne({ PartCodeNumber });
//     if (existingPart) {
//       return res.status(400).json({
//         success: false,
//         error: 'PartCodeNumber already exists'
//       });
//     }

//     // Validate ItemCode exists
//     const item = await Item.findOne({ ItemCode });
//     if (!item) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid ItemCode'
//       });
//     }

//     const newPart = await PartCode.create({
//       PartCodeNumber,
//       ItemCode,
//       SizeName,
//       ColourName,
//       SerialNumber,
//       ItemMakeName,
//       MeasurementUnit
//     });

//     res.status(201).json({
//       success: true,
//       data: newPart
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// }); //needs odification according to requirements

// router.get('/allParts', async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = 15;
//     const startIndex = (page - 1) * limit;

//     const totalDocs = await PartCode.countDocuments();
//     const totalPages = Math.ceil(totalDocs / limit);

//     const parts = await PartCode.find()
//       .skip(startIndex)
//       .limit(limit);

//     res.status(200).json({
//       success: true,
//       count: parts.length,
//       data: parts,
//       pagination: {
//         currentPage: page,
//         totalPages: totalPages,
//         totalItems: totalDocs,
//         itemsPerPage: limit
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// });//seems good

// router.get('/getPart/:partId', async (req, res) => {
//   try {
//     const id = req.params.partId;
//     const partData = await PartCode.findById(id);

//     if (!partData) {
//       return res.status(404).json({
//         success: false,
//         error: 'Part not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: partData
//     });
//   } catch (e) {
//     res.status(500).json({ "error": e.message });
//   }
// });

// router.delete('/deletePart/:id', async (req, res) => {
//   try {
//     const part = await PartCode.findById(req.params.id);
//     if (!part) {
//       return res.status(404).json({
//         success: false,
//         error: 'Part not found'
//       });
//     }
//     await part.deleteOne();
//     res.status(200).json({
//       success: true,
//       data: {}
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: 'Server Error'
//     });
//   }
// }); //seems good


// // router.put('/updatePart/:id', async (req, res) => {
// //   try {
// //     const id = req.params.id;
    
// //     const {
// //       PartCodeNumber,
// //       ItemCode,
// //       SizeName,
// //       ColourName,
// //       SerialNumber,
// //       ItemMakeName,
// //       MeasurementUnit
// //     } = req.body;

// //     // Construct update object with only defined fields
// //     const updateFields = {};
// //     if (PartCodeNumber !== undefined) updateFields.PartCodeNumber = PartCodeNumber;
// //     if (ItemCode !== undefined) updateFields.ItemCode = ItemCode;
// //     if (SizeName !== undefined) updateFields.SizeName = SizeName;
// //     if (ColourName !== undefined) updateFields.ColourName = ColourName;
// //     if (SerialNumber !== undefined) updateFields.SerialNumber = SerialNumber;
// //     if (ItemMakeName !== undefined) updateFields.ItemMakeName = ItemMakeName;
// //     if (MeasurementUnit !== undefined) updateFields.MeasurementUnit = MeasurementUnit;

// //     const updatedPart = await PartCode.findByIdAndUpdate(
// //       id,
// //       { $set: updateFields },
// //       { new: true, runValidators: true }
// //     );

// //     if (!updatedPart) {
// //       return res.status(404).json({ success: false, error: 'Part not found' });
// //     }

// //     res.status(200).json({ success: true, data: updatedPart });
// //   } catch (error) {
// //     res.status(400).json({ success: false, error: error.message });
// //   }
// // });



// ////////////////////////////  SizeName  //////////////////////////////////////  
// router.post('/createSizeName', async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res.status(400).json({ success: false, error: 'Name is required' });
//     }
//     const existingSize = await SizeName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
//     if (existingSize) {
//       return res.status(400).json({ success: false, error: 'Size name already exists' });
//     }
//     const newSize = await SizeName.create({ name });
//     res.status(201).json({ success: true, data: newSize });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// router.get('/allSizeNames', async (req, res) => {
//   try {
//     const sizes = await SizeName.find();
//     res.status(200).json({ success: true, data: sizes });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// router.get('/searchSizeNames', async (req, res) => {
//   try {
//     const { query } = req.query;
//     const regex = new RegExp(query, 'i');
//     const sizes = await SizeName.find({ name: regex });
//     res.status(200).json({ success: true, data: sizes });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// /////////////////////////  ColourName  //////////////////////////////////////  
// router.post('/createColourName', async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res.status(400).json({ success: false, error: 'Name is required' });
//     }
//      const existingColour = await ColourName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
//     if (existingColour) {
//       return res.status(400).json({ success: false, error: 'Colour name already exists' });
//     }
//     const newColour = await ColourName.create({ name });
//     res.status(201).json({ success: true, data: newColour });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// router.get('/allColourNames', async (req, res) => {
//   try {
//     const colours = await ColourName.find();
//     res.status(200).json({ success: true, data: colours });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// router.get('/searchColourNames', async (req, res) => {
//   try {
//     const { query } = req.query;
//     const regex = new RegExp(query, 'i');
//     const colours = await ColourName.find({ name: regex });
//     res.status(200).json({ success: true, data: colours });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });


// /////////////////////////  MakerName  //////////////////////////////////////  
// router.post('/createMakerName', async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res.status(400).json({ success: false, error: 'Name is required' });
//     }
//     const existingMaker = await MakerName.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
//     if (existingMaker) {
//       return res.status(400).json({ success: false, error: 'Maker name already exists' });
//     }
//     const newMaker = await MakerName.create({ name });
//     res.status(201).json({ success: true, data: newMaker });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });


// router.get('/allMakerNames', async (req, res) => {
//   try {
//     const makers = await MakerName.find();
//     res.status(200).json({ success: true, data: makers });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// router.get('/searchMakerNames', async (req, res) => {
//   try {
//     const { query } = req.query;
//     const regex = new RegExp(query, 'i');
//     const makers = await MakerName.find({ name: regex });
//     res.status(200).json({ success: true, data: makers });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// /////////////////////     MeasurementUnit  //////////////////////////////// 
// router.post('/createMeasurementUnit', async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       return res.status(400).json({ success: false, error: 'Name is required' });
//     }
//     const existingUnit = await MeasurementUnit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
//     if (existingUnit) {
//       return res.status(400).json({ success: false, error: 'Measurement unit already exists' });
//     }
//     const newUnit = await MeasurementUnit.create({ name });
//     res.status(201).json({ success: true, data: newUnit });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// router.get('/allMeasurementUnits', async (req, res) => {
//   try {
//     const units = await MeasurementUnit.find();
//     res.status(200).json({ success: true, data: units });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

// router.get('/searchMeasurementUnits', async (req, res) => {
//   try {
//     const { query } = req.query;
//     const regex = new RegExp(query, 'i');
//     const units = await MeasurementUnit.find({ name: regex });
//     res.status(200).json({ success: true, data: units });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });


// module.exports = router;

