const express = require('express');
const router = express.Router();
const indentController = require('../controllers/indent.controller');

// Create and manage indents
router.post('/', indentController.createIndent);
// router.get('/', auth, indentController.getAllIndents);
// router.get('/:id', auth, indentController.getIndentById);

// // Draft management
// router.post('/draft', auth, indentController.saveDraft);
// router.put('/draft/:id', auth, indentController.updateDraft);
// router.delete('/draft/:id', auth, indentController.deleteDraft);

// // Approval routes
// router.patch('/:id/manager-approval', auth, indentController.managerApproval);
// router.patch('/:id/admin-approval', auth, indentController.adminApproval);

module.exports = router;