const { query } = require('../database');
const path = require('path');

// ===================================
// ABRIR CRUD PEDIDO
// ===================================
exports.abrirCrudPedido = (req, res) => {
  const usuario = req.cookies.usuarioLogado;
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/pedido/pedido.html'));
  } else {
    res.redirect('/login');
  }
};

// ===================================
// LISTAR PEDIDOS
// ===================================
exports.listarPedidos = async (req, res) => {
  try {
    const result = await query(`
      SELECT *
      FROM PEDIDO
      ORDER BY id_pedido
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// CRIAR PEDIDO (BACKOFFICE)
// ===================================
exports.criarPedido = async (req, res) => {
  try {
    const { data_pedido, id_pessoa, id_funcionario } = req.body;

    if (!data_pedido || !id_pessoa || !id_funcionario) {
      return res.status(400).json({
        error: 'data_pedido, id_pessoa e id_funcionario são obrigatórios'
      });
    }

    const result = await query(
      `
      INSERT INTO PEDIDO (data_pedido, id_pessoa, id_funcionario)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [data_pedido, id_pessoa, id_funcionario]
    );
    console.log("suco de banana",result)
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Pessoa ou funcionário não encontrado'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// OBTER PEDIDO POR ID
// ===================================
exports.obterPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await query(
      `SELECT * FROM PEDIDO WHERE id_pedido = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// ATUALIZAR PEDIDO
// ===================================
exports.atualizarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data_pedido, id_pessoa, id_funcionario } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const existing = await query(
      `SELECT * FROM PEDIDO WHERE id_pedido = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const result = await query(
      `
      UPDATE PEDIDO
      SET data_pedido = $1,
          id_pessoa = $2,
          id_funcionario = $3
      WHERE id_pedido = $4
      RETURNING *
      `,
      [data_pedido, id_pessoa, id_funcionario, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// DELETAR PEDIDO
// ===================================
exports.deletarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const existing = await query(
      `SELECT * FROM PEDIDO WHERE id_pedido = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    await query(
      `DELETE FROM PEDIDO WHERE id_pedido = $1`,
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Pedido possui dependências e não pode ser removido'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// CRIAR PEDIDO ONLINE (E-COMMERCE)
// ===================================
exports.criarPedidoOnline = async (req, res) => {
  const id_funcionario = '00000000000'; // funcionário padrão
  try {
    const { data_pedido, id_pessoa } = req.body;

    if (!data_pedido || !id_pessoa) {
      return res.status(400).json({
        error: 'data_pedido e id_pessoa são obrigatórios'
      });
    }

    const result = await query(
      `
      INSERT INTO PEDIDO (data_pedido, id_pessoa, id_funcionario)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [data_pedido, id_pessoa, id_funcionario]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido online:', error);

    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Pessoa ou funcionário padrão não encontrado'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
