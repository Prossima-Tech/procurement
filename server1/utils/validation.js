const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('superadmin', 'admin', 'manager', 'employee')
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const vendorValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.object({
      line1: Joi.string(),
      line2: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      country: Joi.string(),
      pinCode: Joi.string()
    }),
    gstNumber: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    cinNumber: Joi.string(),
    paymentTerms: Joi.string(),
    deliveryTerms: Joi.string(),
    items: Joi.array().items(Joi.object({
      item: Joi.string().required(),
      unitPrice: Joi.number().required(),
      currency: Joi.string().default('INR'),
      leadTime: Joi.number()
    })),
    isActive: Joi.boolean()
  });
  return schema.validate(data);
};

const itemValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    unitOfMeasure: Joi.string(),
    isService: Joi.boolean(),
    parts: Joi.array().items(Joi.object({
      partNumber: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string()
    })),
    taxes: Joi.array().items(Joi.object({
      taxName: Joi.string().required(),
      rate: Joi.number().required()
    }))
  });
  return schema.validate(data);
};

const purchaseOrderValidation = (data) => {
  const schema = Joi.object({
    poNumber: Joi.string().required(),
    vendor: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      item: Joi.string().required(),
      quantity: Joi.number().required(),
      unitPrice: Joi.number().required()
    })).min(1).required(),
    totalAmount: Joi.number().required(),
    status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'completed'),
    deliveryDate: Joi.date()
  });
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  vendorValidation,
  itemValidation,
  purchaseOrderValidation
};