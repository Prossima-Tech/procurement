// routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, authorize(['superadmin', 'admin']), userController.getAllUsers);
router.get('/:id', authenticate, authorize(['superadmin', 'admin']), userController.getUserById);
router.put('/:id', authenticate, authorize(['superadmin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['superadmin']), userController.deleteUser);

module.exports = router;