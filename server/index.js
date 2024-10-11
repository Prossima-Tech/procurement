require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_DB_URL

try {
  mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });

  const connection = mongoose.connection;
  connection.once('open', () => {
      console.log('MongoDB connected.');
  });
} catch (err) {
  console.log('Error : ' + err);
}

app.get('/api', (req, res) => {
  res.send('Hello from the backend');
});

const vendorController =require('./controller/vendor.controller')
app.use('/vendor' , vendorController)

const authController = require('./controller/auth.controller')
app.use('/auth', authController)

app.listen(PORT, () => {
  
  console.log(`Server running on port ${PORT}`);
});
