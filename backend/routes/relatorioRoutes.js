const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

router.get('/abrirRelatorio', relatorioController.abrirRelatorio);
router.get('/vendasMes', relatorioController.vendasPorMes);
router.get('/produtosMaisVendidos', relatorioController.produtosMaisVendidos);

module.exports = router;
