const express = require('express');
const crudController = require('../controllers/crudController');

const router = express.Router();

router.get('/', crudController.listItems);
router.get('/:id', crudController.getItem);
router.post('/', crudController.createItem);
router.put('/:id', crudController.updateItem);
router.delete('/:id', crudController.deleteItem);

module.exports = router;
