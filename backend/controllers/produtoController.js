const { query } = require('../database');
const path = require('path');


exports.abrirCrudProduto = (req, res) => {
  const usuario = req.cookies.usuarioLogado; // Cookie com usuário logado
  if (usuario) {
    res.sendFile(path.join(__dirname, '../../frontend/produto/produto.html'));   
  } else {
     // Cookie não existe. Usuário NÃO está logado.
     res.redirect('/login');
  }
}
// LISTAR
// LISTAR
exports.listarProdutos = async (req, res) => {
  try {
    const result = await query(`
      SELECT p.id_produto, p.nome, p.preco, p.id_funcionario,
       CASE
           WHEN c.id_produto IS NOT NULL THEN 'CAMISETA'
           WHEN v.id_produto IS NOT NULL THEN 'VINIL'
           WHEN cd.id_produto IS NOT NULL THEN 'CD'
           ELSE NULL
       END AS tipo
      FROM produto p
      LEFT JOIN CAMISETA c ON p.id_produto = c.id_produto
      LEFT JOIN VINIL v ON p.id_produto = v.id_produto
      LEFT JOIN CD cd ON p.id_produto = cd.id_produto
      ORDER BY p.id_produto;

    `);
 
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// OBTER POR ID
// OBTER POR ID
exports.obterProduto = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await query(`
       SELECT p.id_produto, p.nome, p.preco, p.id_funcionario,
             CASE
                 WHEN c.id_produto IS NOT NULL THEN 'CAMISETA'
                 WHEN v.id_produto IS NOT NULL THEN 'VINIL'
                 WHEN cd.id_produto IS NOT NULL THEN 'CD'
                 ELSE NULL
             END AS tipo
      FROM produto p
      LEFT JOIN CAMISETA c ON p.id_produto = c.id_produto
      LEFT JOIN VINIL v ON p.id_produto = v.id_produto
      LEFT JOIN CD cd ON p.id_produto = cd.id_produto
      WHERE p.id_produto = $1
    `, [id]);


    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// CRIAR
// CRIAR
exports.criarProduto = async (req, res) => {
  const { id_produto, nome, preco, id_funcionario, tipo } = req.body;

  try {
    // Verifica se o funcionário existe
    const verificaFuncionario = await query(
      'SELECT * FROM FUNCIONARIO WHERE id_pessoa = $1',
      [id_funcionario]
    );

    if (verificaFuncionario.rows.length === 0) {
      return res.status(400).json({ error: 'O ID informado não pertence a um funcionário.' });
    }

    // Inserir na tabela PRODUTO
    const result = await query(
      'INSERT INTO PRODUTO (id_produto, nome, preco, id_funcionario) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_produto, nome, preco, id_funcionario]
    );

    const idProduto = result.rows[0].id_produto;

    // Inserir na tabela especializada
    if (tipo === 'cd') {
      await query('INSERT INTO CD (id_produto) VALUES ($1)', [idProduto]);
    } else if (tipo === 'vinil') {
      await query('INSERT INTO VINIL (id_produto) VALUES ($1)', [idProduto]);
    } else if (tipo === 'camiseta') {
      await query('INSERT INTO CAMISETA (id_produto) VALUES ($1)', [idProduto]);
    } else {
      return res.status(400).json({ error: 'Tipo de produto inválido.' });
    }

    // Retorna o produto criado com o tipo
    res.status(201).json({ ...result.rows[0], tipo });

  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
  }
};



// ATUALIZAR
exports.atualizarProduto = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, preco, id_funcionario } = req.body;

  try {
    const result = await query(
      'UPDATE produto SET nome = $1, preco = $2, id_funcionario = $3 WHERE id_produto = $4 RETURNING *',
      [nome, preco, id_funcionario, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// DELETAR
exports.deletarProduto = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await query('DELETE FROM produto WHERE id_produto = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
