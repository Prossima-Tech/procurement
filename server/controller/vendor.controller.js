const router = require('express').Router();
const Vendor = require('../model/vendor.model')

router.get('/getVendor/:vendorId', async(req,res)=>{
  try{
    const id = req.params.vendorId;
    const vendorData = await Vendor.findById(id);

    if (!vendorData) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    console.log(vendorData);
    res.status(200).json({
      success: true,
      data: vendorData
    });

  }catch(e){
    console.log("err " + e  )
    res.json({"error": err});
  }
}) //testing completed

router.post('/createVendor' , async(req,res)=>{
  try {
    // console.log("req.body", req.body)
    const {
      VendorCode,
      VendorName,
      ContactPerson,
      MobileNumber,
      PINCode,
      POPrefix,
      ContactNumber,
      PANNumber,
      EmailID,
      GSTNumber,
      BankName,
      BankBranchName,
      BankAccountNumber,
      BankIFSCCode,
      Address,
      StateName,
      CityName,
      Remark
    } = req.body;

   
    if (!VendorCode || !VendorName || !ContactPerson || !MobileNumber || !PINCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: VendorID, VendorName, ContactPerson, MobileNumber, and PINCode are required'
      });
    }

    // Check if VendorCode already exists
    const existingVendor = await Vendor.findOne({ VendorCode });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        error: 'VendorCode already exists'
      });
    }
    
    const newVendor = await Vendor.create({
      VendorCode,
      VendorName,
      ContactPerson,
      MobileNumber,
      PINCode,
      POPrefix: POPrefix || '',
      ContactNumber: ContactNumber || null,
      PANNumber: PANNumber || '',
      EmailID: EmailID || '',
      GSTNumber: GSTNumber || '',
      BankName: BankName || '',
      BankBranchName: BankBranchName || '',
      BankAccountNumber: BankAccountNumber || null,
      BankIFSCCode: BankIFSCCode || '',
      Address: Address || '',
      StateName: StateName || '',
      CityName: CityName || '',
      Remark: Remark || ''
    });

    // await newVendor.save();
    res.status(201).json({
      success: true,
      data: newVendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
})//testing completed

router.post('/allVendors', async(req,res)=>{
  try {
    const page = parseInt(req.query.page, 10) || 1; 
    const limit =  15; 
    const startIndex = (page - 1) * limit;

    const totalDocs = await Vendor.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const vendors = await Vendor.find()
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: vendors.length,
      data: vendors,
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
})//testing completed

router.put('/updateVendor/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const {
      VendorID,
      VendorName,
      ContactPerson,
      MobileNumber,
      PINCode,
      POPrefix,
      ContactNumber,
      PANNumber,
      EmailID,
      GSTNumber,
      BankName,
      BankBranchName,
      BankAccountNumber,
      BankIFSCCode,
      Address,
      StateName,
      CityName,
      Remark
    } = req.body;

    // Construct update object with only defined fields
    const updateFields = {};
    if (VendorID !== undefined) updateFields.VendorID = VendorID;
    if (VendorName !== undefined) updateFields.VendorName = VendorName;
    if (ContactPerson !== undefined) updateFields.ContactPerson = ContactPerson;
    if (MobileNumber !== undefined) updateFields.MobileNumber = MobileNumber;
    if (PINCode !== undefined) updateFields.PINCode = PINCode;
    if (POPrefix !== undefined) updateFields.POPrefix = POPrefix;
    if (ContactNumber !== undefined) updateFields.ContactNumber = ContactNumber;
    if (PANNumber !== undefined) updateFields.PANNumber = PANNumber;
    if (EmailID !== undefined) updateFields.EmailID = EmailID;
    if (GSTNumber !== undefined) updateFields.GSTNumber = GSTNumber;
    if (BankName !== undefined) updateFields.BankName = BankName;
    if (BankBranchName !== undefined) updateFields.BankBranchName = BankBranchName;
    if (BankAccountNumber !== undefined) updateFields.BankAccountNumber = BankAccountNumber;
    if (BankIFSCCode !== undefined) updateFields.BankIFSCCode = BankIFSCCode;
    if (Address !== undefined) updateFields.Address = Address;
    if (StateName !== undefined) updateFields.StateName = StateName;
    if (CityName !== undefined) updateFields.CityName = CityName;
    if (Remark !== undefined) updateFields.Remark = Remark;

    // Validate input (example using Joi)
    // const schema = Joi.object({
    //   VendorID: Joi.string(),
    //   VendorName: Joi.string(),
    //   ContactPerson: Joi.string(),
    //   MobileNumber: Joi.string().pattern(/^[0-9]{10}$/),
    //   PINCode: Joi.string(),
    //   // ... other validations ...
    // });

    // const { error } = schema.validate(updateFields);
    // if (error) {
    //   return res.status(400).json({ success: false, error: error.details[0].message });
    // }

    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    res.status(200).json({ success: true, data: updatedVendor });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
})

router.delete('/deleteVendor/:id', async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    await vendor.deleteOne();
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
});//testing completed

module.exports = router