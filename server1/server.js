// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const vendorRoutes = require('./routes/vendor.routes');
const itemRoutes = require('./routes/item.routes');
const partRouter = require('./routes/part.router');
const purchaseOrderRoutes = require('./routes/purchaseOrder.routes');
const projectRoutes = require('./routes/project.routes');
const unitRoutes = require('./routes/unit.routes');
const indentRoutes = require('./routes/indent.routes');
const rfqRoutes = require('./routes/rfq.routes');
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/parts', partRouter);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/indents', indentRoutes);
app.use('/api/rfq', rfqRoutes);
// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));