const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

router.get('/abrirCadastro', cadastroController.abrirCadastro);
router.post('/cadastrar', cadastroController.cadastrar);

module.exports = router;
