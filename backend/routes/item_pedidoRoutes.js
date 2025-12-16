
const express = require('express');
const router = express.Router();
const item_pedidoController = require('./../controllers/item_pedidoController');

// ROTAS ESPECÍFICAS PRIMEIRO
router.get('/abrirCruditem_pedido', item_pedidoController.abrirCruditem_pedido);
router.post('/lote', item_pedidoController.criarItensPedidoEmLote);

// PK composta
router.get('/:id_pedido/:id_produto', item_pedidoController.obteritem_pedido);
router.put('/:id_pedido/:id_produto', item_pedidoController.atualizaritem_pedido);
router.delete('/:id_pedido/:id_produto', item_pedidoController.deletaritem_pedido);

// Rotas genéricas POR ÚLTIMO
router.get('/', item_pedidoController.listaritem_pedido);
router.get('/:idPedido', item_pedidoController.obterItensDeUmitem_pedido);
router.post('/', item_pedidoController.criaritem_pedido);




module.exports = router;
