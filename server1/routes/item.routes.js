const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/createCategory', itemController.createItemCategory);
router.get('/searchCategories', itemController.searchItemCategories);
router.get('/allCategories', itemController.getAllItemCategories);

router.post('/', authenticate, authorize(['admin', 'manager']), itemController.createItem);
router.get('/', authenticate, itemController.getAllItems);
router.get('/:id', authenticate, itemController.getItemById);
router.put('/:id', authenticate, authorize(['admin', 'manager']), itemController.updateItem);
router.delete('/:id', authenticate, authorize(['admin']), itemController.deleteItem);


module.exports = router;
