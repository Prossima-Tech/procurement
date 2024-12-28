const express = require('express');
const router = express.Router();
const indentController = require('../controllers/indent.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Create and manage indents
router.post('/', indentController.createIndent);
router.get('/', authenticate, indentController.getAllIndents);
router.post('/:id/manager-approval', 
  authenticate, 
  authorize('manager'),
  indentController.managerApproval
);
router.get('/getIndent/:id', authenticate, indentController.getIndentById);

// Add new route for manager indents
router.get('/manager/indents', authenticate, authorize('manager'), indentController.getManagerIndents);

module.exports = router;