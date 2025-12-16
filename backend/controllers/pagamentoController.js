//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirTelaPagamento = (req, res) => {
 // console.log('pagamentoController - Rota /abrirTelaPagamento - abrir a tela de pagamento');
  const usuario = req.cookies.usuarioLogado; // O cookie deve conter o nome/ID do usuário

  console.log('Cookie usuarioLogado:', usuario);

  // Se o cookie 'usuario' existe (o valor é uma string/nome do usuário)
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/visaoCliente/pagamento/pagamento.html'));
  } else {
    // Cookie não existe. Usuário NÃO está logado.
    res.redirect('/login');
  }
}

exports.abrirCrudPagamento = (req, res) => {
  // console.log('pagamentoController - Rota /abrirCrudPagamento - abrir o crudPagamento');
  const usuario = req.cookies.usuarioLogado; // O cookie deve conter o nome/ID do usuário

  // Se o cookie 'usuario' existe (o valor é uma string/nome do usuário)
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/pagamento/pagamento.html'));
  } else {
    // Cookie não existe. Usuário NÃO está logado.
    res.redirect('/login');
  }
}

exports.listarPagamentos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM PAGAMENTO ORDER BY id_pagamento');
    //  console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}


exports.criarPagamento = async (req, res) => {
  //  console.log('Criando pagamento com dados:', req.body);
  try {
    const { id_pagamento, nome_pagamento } = req.body;

    // Validação básica
    if (!nome_pagamento) {
      return res.status(400).json({
        error: 'O nome do pagamento é obrigatório'
      });
    }

    const result = await query(
      'INSERT INTO PAGAMENTO (id_pagamento, nome_pagamento) VALUES ($1, $2) RETURNING *',
      [id_pagamento, nome_pagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);



    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPagamento = async (req, res) => {
  try {
    console.log(req.params.id);
    const id = parseInt(req.params.id);

    // console.log("estou no obter pagamento id="+ id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM PAGAMENTO WHERE id_pagamento = $1',
      [id]
    );

    //console.log(result)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome_pagamento } = req.body;


    // Verifica se a pagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM PAGAMENTO WHERE id_pagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      nome_pagamento: nome_pagamento !== undefined ? nome_pagamento : currentPerson.nome_pagamento
    };

    // Atualiza a pagamento
    const updateResult = await query(
      'UPDATE PAGAMENTO SET nome_pagamento = $1 WHERE id_pagamento = $2 RETURNING *',
      [updatedFields.nome_pagamento, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);


    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a pagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM PAGAMENTO WHERE id_pagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrada' });
    }

    // Deleta a pagamento (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM PAGAMENTO WHERE id_pagamento = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pagamento com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.finalizarPagamento = async (req, res) => {
    const { id_pedido, valor_total, formas_pagamento } = req.body;
    console.log('BODY RECEBIDO:', req.body);

    if (!id_pedido || !valor_total || !Array.isArray(formas_pagamento) || formas_pagamento.length === 0) {
        return res.status(400).json({ erro: 'Dados inválidos' });
    }

    try {
        // 1) cria pagamento
        const pagamento = await query(
            `INSERT INTO PAGAMENTO (id_pedido, valor_total, data_pagamento)
             VALUES ($1, $2, NOW())
             RETURNING id_pagamento`,
            [id_pedido, valor_total]
        );

        const id_pagamento = pagamento.rows[0].id_pagamento;

        // 2) cria vínculos com formas de pagamento
        for (const forma of formas_pagamento) {
            await query(
                `INSERT INTO PAGAMENTO_HAS_FORMA_PAGAMENTO
                 (id_pagamento, id_forma_pagamento, valor_pago)
                 VALUES ($1, $2, $3)`,
                [id_pagamento, forma.id_forma_pagamento, forma.valor_pago]
            );
        }

        res.json({ sucesso: true, id_pagamento });

    } catch (err) {
        console.error('ERRO DO POSTGRES:', err);
        return res.status(500).json({ erro: err.message });
    }
};
