require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
// Example rout

const mongoURI = "mongodb+srv://tanishq:fPRcY28gGTs4WLHm@procurement.yckca.mongodb.net/?retryWrites=true&w=majority&appName=Procurement";

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api', (req, res) => {
  res.send('Hello from the backend');
});

import vendorController from './controller/vendor.controller'
app.use('/vendor' , vendorController)

import authController from './controller/auth.controller'
app.use('/auth', authController)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
