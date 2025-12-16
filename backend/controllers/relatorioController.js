const { query } = require('../database');
const path = require('path');


exports.abrirRelatorio = (req, res) => {
  console.log('Rota abrirCrudFuncionario acessada');
  
  res.sendFile(path.join(__dirname, '../../frontend/relatorio/relatorio.html'));
  
};
// ================================
// RELATÓRIO 1 — VENDAS POR MÊS
// ================================
exports.vendasPorMes = async (req, res) => {
  try {
    const mes = req.query.mes; // formato YYYY-MM

    if (!mes) return res.status(400).json({ erro: "Mês não enviado" });

    const [ano, mesNum] = mes.split("-");

    const sql = `
      SELECT 
          EXTRACT(DAY FROM p.data_pedido) AS dia,
          SUM(pg.valor_total) AS total
      FROM pedido p
      JOIN pagamento pg ON pg.id_pedido = p.id_pedido
      WHERE EXTRACT(YEAR FROM p.data_pedido) = $1
        AND EXTRACT(MONTH FROM p.data_pedido) = $2
      GROUP BY dia
      ORDER BY total DESC;
    `;

    const result = await query(sql, [ano, mesNum]);
    const rows = result.rows;

    const dias = rows.map(r => r.dia);
    const valores = rows.map(r => Number(r.total));

    return res.json({
      total: valores.reduce((a, b) => a + b, 0).toFixed(2),
      dias,
      valores
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao gerar relatório" });
  }
};


// ================================
// RELATÓRIO 2 — PRODUTOS MAIS VENDIDOS
// ================================
exports.produtosMaisVendidos = async (req, res) => {
  try {
    const sql = `
      SELECT 
          p.nome,
          SUM(ip.quantidade) AS totalVendidos
      FROM item_pedido ip
      JOIN produto p ON p.id_produto = ip.produto_id_produto
      GROUP BY p.id_produto
      ORDER BY totalVendidos DESC
      LIMIT 10;
    `;

    const result = await query(sql);
    const rows = result.rows;

    return res.json({
      produtos: rows.map(r => r.nome),
      quantidades: rows.map(r => r.totalvendidos),
      totalItens: rows.length
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao gerar relatório" });
  }
};
