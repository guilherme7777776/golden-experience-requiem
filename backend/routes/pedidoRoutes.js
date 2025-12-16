const express = require('express');
const router = express.Router();
const pedidoController = require('./../controllers/pedidoController');

// CRUD de Pedidos

router.get('/abrirCrudPedido', pedidoController.abrirCrudPedido);

router.post('/gerente', pedidoController.criarPedido);

router.get('/', pedidoController.listarPedidos)

// Rota exclusiva para pedidos online (AGORA COM CAMINHO ÚNICO)
router.post('/online', pedidoController.criarPedidoOnline); 

router.get('/:id', pedidoController.obterPedido);
router.put('/:id', pedidoController.atualizarPedido);
router.delete('/:id', pedidoController.deletarPedido);

module.exports = router;
