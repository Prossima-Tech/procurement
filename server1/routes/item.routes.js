const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/', authenticate, authorize(['admin', 'manager']), itemController.createItem);
router.get('/', authenticate, itemController.getAllItems);
router.get('/:id', authenticate, itemController.getItemById);
router.put('/:id', authenticate, authorize(['admin', 'manager']), itemController.updateItem);
router.delete('/:id', authenticate, authorize(['admin']), itemController.deleteItem);

router.post('/createItemCategory', itemController.createItemCategory);
router.get('/searchItemCategories', itemController.searchItemCategories);
router.get('/allItemCategories', itemController.getAllItemCategories);

module.exports = router;
