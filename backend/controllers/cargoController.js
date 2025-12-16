const { query } = require('../database');
const path = require('path');

exports.abrirCrudCargo = (req, res) => {
  console.log('Rota abrirCrudcargo acessada');
  const usuario = req.cookies.usuarioLogado; 
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/cargo/cargo.html'));
  } else {
    // Cookie não existe. Usuário NÃO está logado.
    res.redirect('/login');
  }
};

// LISTAR CARGOS
exports.listarCargos = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM CARGO ORDER BY id_cargo`);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar cargos:", error);
    res.status(500).json({ error: "Erro ao listar cargos" });
  }
};

exports.criarCargo = async (req, res) => {
  try {
    const { id_cargo, nome_cargo } = req.body;

    if (!id_cargo || !nome_cargo) {
      return res.status(400).json({ error: 'Campos obrigatórios não fornecidos' });
    }

    const idInt = parseInt(id_cargo);
    if (isNaN(idInt)) return res.status(400).json({ error: 'idcargo deve ser numérico' });
  

    // Cria funcionário
    const result = await query(
      `INSERT INTO CARGO (id_cargo, nome_cargo)
       VALUES ($1,$2)
       RETURNING *`,
      [id_cargo, nome_cargo]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao criar funcionário:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Esta pessoa já é funcionário.' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// OBTER FUNCIONÁRIO POR ID
// ===================================
exports.obterCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const result = await query(`
      SELECT * FROM CARGO WHERE id_cargo = $1 ORDER BY id_cargo `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// ATUALIZAR FUNCIONÁRIO
// ===================================
exports.atualizarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {nome_cargo } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await query(`SELECT id_cargo FROM CARGO WHERE id_cargo = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'cargo não encontrado' });
    }

    // SQL DO UPDATE CORRIGIDO
    const result = await query(
      `UPDATE CARGO
         SET nome_cargo=$1
       WHERE id_cargo=$2
       RETURNING *`,
      [nome_cargo, id]
    );
    

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ===================================
// DELETAR FUNCIONÁRIO
// ===================================
exports.deletarCargo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await query(`SELECT id_cargo FROM CARGO WHERE id_cargo = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    await query(`DELETE FROM CARGO WHERE id_cargo=$1`, [id]);

    res.status(204).send();

  } catch (error) {
    console.error('Erro ao deletar funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
