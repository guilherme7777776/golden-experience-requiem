const { query } = require('../database');
const path = require('path');

// ===================================
// ABRIR PÁGINA CRUD CLIENTE
// ===================================
exports.abrirCrudCliente = (req, res) => {
  console.log('Rota abrirCrudCliente acessada');
  
  
};

// ===================================
// LISTAR CLIENTES
// ===================================
exports.listarClientes = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.id_pessoa,
        p.nome_pessoa AS nome,
        p.email_pessoa AS email,
        p.telefone_pessoa AS telefone,
        c.renda_cliente,
        c.data_cadastro
      FROM CLIENTE c
      JOIN PESSOA p ON c.id_pessoa = p.id_pessoa
      ORDER BY c.id_pessoa;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// CRIAR CLIENTE (versão correta)
// ===================================
exports.criarCliente = async (req, res) => {
  try {
    const { id_pessoa, renda_cliente, data_cadastro } = req.body;

    if (!id_pessoa) {
      return res.status(400).json({ error: 'id_pessoa é obrigatório' });
    }

    const idInt = parseInt(id_pessoa);
    if (isNaN(idInt)) {
      return res.status(400).json({ error: 'id_pessoa deve ser numérico' });
    }

    // Verifica se pessoa existe
    const pessoa = await query(
      `SELECT * FROM PESSOA WHERE id_pessoa = $1`,
      [idInt]
    );

    if (pessoa.rows.length === 0) {
      return res.status(404).json({
        error: 'Pessoa não encontrada. Crie a pessoa antes de criar o cliente.'
      });
    }

    // Cria cliente
    const result = await query(
      `INSERT INTO CLIENTE (id_pessoa, renda_cliente, data_cadastro)
       VALUES ($1,$2,$3) RETURNING *`,
      [idInt, renda_cliente, data_cadastro]
    );

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao criar cliente:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Esta pessoa já é cliente.' });
    }

    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// OBTER CLIENTE POR ID
// ===================================
exports.obterCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const result = await query(`
      SELECT 
        c.id_pessoa,
        p.nome_pessoa AS nome,
        p.email_pessoa AS email,
        p.senha_pessoa AS senha,
        p.endereco_pessoa AS endereco,
        p.telefone_pessoa AS telefone,
        p.data_nascimento,
        c.renda_cliente,
        c.data_cadastro
      FROM CLIENTE c
      JOIN PESSOA p ON c.id_pessoa = p.id_pessoa
      WHERE c.id_pessoa = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// ATUALIZAR CLIENTE (Agora só CLIENTE, não PESSOA)
// ===================================
exports.atualizarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { renda_cliente, data_cadastro } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await query(`SELECT * FROM CLIENTE WHERE id_pessoa = $1`, [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Cliente não encontrado' });

    // Atualiza somente CLIENTE
    const result = await query(
      `UPDATE CLIENTE 
         SET renda_cliente=$1, data_cadastro=$2
       WHERE id_pessoa=$3 RETURNING *`,
      [renda_cliente, data_cadastro, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// DELETAR CLIENTE (agora só cliente)
// ===================================
exports.deletarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await query(`SELECT * FROM CLIENTE WHERE id_pessoa=$1`, [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Cliente não encontrado' });

    // Apaga somente o cliente
    await query(`DELETE FROM CLIENTE WHERE id_pessoa=$1`, [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Erro de integridade referencial - o cliente possui registros dependentes.'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor ao excluir o cliente.' });
  }
};
