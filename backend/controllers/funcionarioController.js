const { query } = require('../database');
const path = require('path');

// ===================================
// ABRIR PÁGINA CRUD FUNCIONÁRIO
// ===================================
exports.abrirCrudFuncionario = (req, res) => {
  const usuario = req.cookies.usuarioLogado;

  if (usuario) {
    res.sendFile(
      path.join(__dirname, '../../frontend/funcionario/funcionario.html')
    );
  } else {
    res.redirect('/login');
  }
};

// ===================================
// LISTAR FUNCIONÁRIOS
// ===================================
exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        f.id_pessoa,
        p.nome_pessoa,
        p.email_pessoa,
        p.endereco_pessoa,
        p.telefone_pessoa,
        p.data_nascimento,
        f.salario_funcionario,
        f.carga_horaria,
        f.comissao,
        f.id_cargo,
        c.nome_cargo
      FROM funcionario f
      JOIN pessoa p ON f.id_pessoa = p.id_pessoa
      LEFT JOIN cargo c ON f.id_cargo = c.id_cargo
      ORDER BY f.id_pessoa
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// CRIAR FUNCIONÁRIO
// ===================================
exports.criarFuncionario = async (req, res) => {
  try {
    const {
      id_pessoa,
      salario_funcionario,
      carga_horaria,
      comissao,
      id_cargo
    } = req.body;

    // ---------- ID ----------
    if (
      id_pessoa === undefined ||
      !Number.isInteger(id_pessoa) ||
      id_pessoa <= 0
    ) {
      return res.status(400).json({
        error: 'id_pessoa inválido. Deve ser inteiro positivo.'
      });
    }

    // ---------- SALÁRIO ----------
    if (
      salario_funcionario === undefined ||
      isNaN(salario_funcionario) ||
      salario_funcionario < 0
    ) {
      return res.status(400).json({
        error: 'salario_funcionario inválido'
      });
    }

    // ---------- CARGA HORÁRIA ----------
    if (
      carga_horaria === undefined ||
      !Number.isInteger(carga_horaria) ||
      carga_horaria <= 0
    ) {
      return res.status(400).json({
        error: 'carga_horaria inválida'
      });
    }

    // ---------- COMISSÃO ----------
    if (
      comissao === undefined ||
      isNaN(comissao) ||
      comissao < 0
    ) {
      return res.status(400).json({
        error: 'comissao inválida'
      });
    }

    // ---------- PESSOA EXISTE ----------
    const pessoa = await query(
      'SELECT 1 FROM pessoa WHERE id_pessoa = $1',
      [id_pessoa]
    );

    if (pessoa.rows.length === 0) {
      return res.status(404).json({
        error: 'Pessoa não encontrada. Crie a pessoa antes.'
      });
    }

    // ---------- JÁ É FUNCIONÁRIO ----------
    const jaFuncionario = await query(
      'SELECT 1 FROM funcionario WHERE id_pessoa = $1',
      [id_pessoa]
    );

    if (jaFuncionario.rows.length > 0) {
      return res.status(400).json({
        error: 'Esta pessoa já é funcionária'
      });
    }

    const result = await query(
      `INSERT INTO funcionario
       (id_pessoa, salario_funcionario, carga_horaria, comissao, id_cargo)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        id_pessoa,
        salario_funcionario,
        carga_horaria,
        comissao,
        id_cargo ?? null
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// OBTER FUNCIONÁRIO POR ID
// ===================================
exports.obterFuncionario = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido. Deve ser inteiro positivo.'
    });
  }

  try {
    const result = await query(`
      SELECT 
        f.id_pessoa,
        p.nome_pessoa,
        p.email_pessoa,
        p.endereco_pessoa,
        p.telefone_pessoa,
        p.data_nascimento,
        f.salario_funcionario,
        f.carga_horaria,
        f.comissao,
        f.id_cargo
      FROM funcionario f
      JOIN pessoa p ON f.id_pessoa = p.id_pessoa
      WHERE f.id_pessoa = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// ATUALIZAR FUNCIONÁRIO
// ===================================
exports.atualizarFuncionario = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido. Deve ser inteiro positivo.'
    });
  }

  try {
    const {
      salario_funcionario,
      carga_horaria,
      comissao,
      id_cargo
    } = req.body;

    const existing = await query(
      'SELECT * FROM funcionario WHERE id_pessoa = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Funcionário não encontrado'
      });
    }

    if (
      salario_funcionario !== undefined &&
      (isNaN(salario_funcionario) || salario_funcionario < 0)
    ) {
      return res.status(400).json({ error: 'salario_funcionario inválido' });
    }

    if (
      carga_horaria !== undefined &&
      (!Number.isInteger(carga_horaria) || carga_horaria <= 0)
    ) {
      return res.status(400).json({ error: 'carga_horaria inválida' });
    }

    if (
      comissao !== undefined &&
      (isNaN(comissao) || comissao < 0)
    ) {
      return res.status(400).json({ error: 'comissao inválida' });
    }

    const atual = existing.rows[0];

    const result = await query(
      `UPDATE funcionario SET
        salario_funcionario = $1,
        carga_horaria = $2,
        comissao = $3,
        id_cargo = $4
       WHERE id_pessoa = $5
       RETURNING *`,
      [
        salario_funcionario ?? atual.salario_funcionario,
        carga_horaria ?? atual.carga_horaria,
        comissao ?? atual.comissao,
        id_cargo ?? atual.id_cargo,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// DELETAR FUNCIONÁRIO
// ===================================
exports.deletarFuncionario = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'ID inválido. Deve ser inteiro positivo.'
    });
  }

  try {
    const existing = await query(
      'SELECT 1 FROM funcionario WHERE id_pessoa = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: 'Funcionário não encontrado'
      });
    }

    await query('DELETE FROM pessoa WHERE id_pessoa = $1', [id]);

    res.status(204).send();

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
