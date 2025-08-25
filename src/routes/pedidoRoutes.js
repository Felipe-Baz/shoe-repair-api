const express = require('express');
const pedidoController = require('../controllers/pedidoController');

const router = express.Router();

router.get('/', pedidoController.listPedidos);
router.get('/:id', pedidoController.getPedido);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;
