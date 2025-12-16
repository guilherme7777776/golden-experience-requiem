const { query } = require('../database');
const path = require('path');

// ===============================
// ABRIR CRUD DE PESSOA
// ===============================
exports.abrirCrudPessoa = (req, res) => {
  const usuario = req.cookies.usuarioLogado;

  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
  } else {
    res.redirect('/login');
  }
};

// ===============================
// LISTAR PESSOAS
// ===============================
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY id_pessoa');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===============================
// CRIAR PESSOA
// ===============================
exports.criarPessoa = async (req, res) => {
  try {
    const {
      id_pessoa,
      nome_pessoa,
      data_nascimento,
      endereco_pessoa,
      senha_pessoa,
      email_pessoa
    } = req.body;

    // ---------- VALIDAÇÃO ID ----------
    if (
      id_pessoa === undefined ||
      !Number.isInteger(id_pessoa) ||
      id_pessoa <= 0
    ) {
      return res.status(400).json({
        error: 'id_pessoa inválido. Deve ser um inteiro positivo.'
      });
    }

    // ---------- CAMPOS OBRIGATÓRIOS ----------
    if (!nome_pessoa || !endereco_pessoa || !senha_pessoa || !email_pessoa) {
      return res.status(400).json({
        error: 'Nome, email, endereço e senha são obrigatórios'
      });
    }

    // ---------- EMAIL ----------
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_pessoa)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // ---------- ID DUPLICADO ----------
    const idExistente = await query(
      'SELECT 1 FROM pessoa WHERE id_pessoa = $1',
      [id_pessoa]
    );

    if (idExistente.rows.length > 0) {
      return res.status(400).json({
        error: 'Já existe uma pessoa com esse id_pessoa'
      });
    }

    const result = await query(
      `INSERT INTO pessoa 
       (id_pessoa, nome_pessoa, data_nascimento, endereco_pessoa, senha_pessoa, email_pessoa)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [
        id_pessoa,
        nome_pessoa,
        data_nascimento,
        endereco_pessoa,
        senha_pessoa,
        email_pessoa
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===============================
// OBTER PESSOA POR ID
// ===============================
exports.obterPessoa = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido. Deve ser inteiro positivo.'
    });
  }

  try {
    const result = await query(
      'SELECT * FROM pessoa WHERE id_pessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===============================
// ATUALIZAR PESSOA
// ===============================
exports.atualizarPessoa = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido. Deve ser inteiro positivo.'
    });
  }

  try {
    const {
      nome_pessoa,
      data_nascimento,
      endereco_pessoa,
      senha_pessoa,
      email_pessoa
    } = req.body;

    if (email_pessoa) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email_pessoa)) {
        return res.status(400).json({ error: 'Email inválido' });
      }
    }

    const existing = await query(
      'SELECT * FROM pessoa WHERE id_pessoa = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pessoa não encontrada' });
    }

    const atual = existing.rows[0];

    const result = await query(
      `UPDATE pessoa SET
        nome_pessoa = $1,
        data_nascimento = $2,
        endereco_pessoa = $3,
        senha_pessoa = $4,
        email_pessoa = $5
       WHERE id_pessoa = $6
       RETURNING *`,
      [
        nome_pessoa ?? atual.nome_pessoa,
        data_nascimento ?? atual.data_nascimento,
        endereco_pessoa ?? atual.endereco_pessoa,
        senha_pessoa ?? atual.senha_pessoa,
        email_pessoa ?? atual.email_pessoa,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar pessoa


// Buscar pessoa por email
exports.obterPessoaPorEmail = async (req, res) => {
  try {
    const { email_pessoa } = req.params;

    if (!email_pessoa) return res.status(400).json({ error: 'Email é obrigatório' });

    const result = await query('SELECT * FROM PESSOA WHERE email_pessoa = $1', [email_pessoa]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pessoa por email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar somente a senha
exports.atualizarSenha = async (req, res) => {
  try {
    const id = req.params.id;
    const { senha_atual, nova_senha } = req.body;

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    const result = await query('SELECT * FROM PESSOA WHERE id_pessoa = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pessoa não encontrada' });

    const pessoa = result.rows[0];
    if (pessoa.senha_pessoa !== senha_atual) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const updateResult = await query(
      'UPDATE PESSOA SET senha_pessoa = $1 WHERE id_pessoa = $2 RETURNING id_pessoa, nome_pessoa, endereco_pessoa, data_nascimento',
      [nova_senha, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
