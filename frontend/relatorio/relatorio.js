const API_BASE_URL = "http://localhost:3001/relatorio";

let graficoMesCriado = null;
let graficoRankingCriado = null;

// ==========================
// RELATÓRIO DE VENDAS POR MÊS
// ==========================
async function carregarRelatorioMes() {
    const mes = document.getElementById("mesEscolhido").value;

    if (!mes) {
        alert("Escolha um mês!");
        return;
    }

    const res = await fetch(`${API_BASE_URL}/vendasMes?mes=${mes}`);
    const dados = await res.json();

    if (dados.erro) {
        alert(dados.erro);
        return;
    }

    document.getElementById("resultadoMes").innerHTML =
        `<strong>Total do mês:</strong> R$ ${dados.total}`;

    // REMOVE GRÁFICO ANTIGO
    if (graficoMesCriado) graficoMesCriado.destroy();

    const ctx = document.getElementById("graficoMes");

    graficoMesCriado = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: dados.dias.map(d => `Dia ${d}`),
        datasets: [{
            label: "Vendas (R$)",
            data: dados.valores,
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    autoSkip: false
                }
            },
            y: {
                ticks: {
                    callback: v => 'R$ ' + v.toFixed(2).replace('.', ',')
                }
            }
        }
    }
});


}


// ==========================
// PRODUTOS MAIS VENDIDOS
// ==========================
async function carregarRankingProdutos() {

    const res = await fetch(`${API_BASE_URL}/produtosMaisVendidos`);
    const dados = await res.json();

    document.getElementById("resultadoRanking").innerHTML =
        `<strong>Total de produtos analisados:</strong> ${dados.totalItens}`;

    // REMOVE GRÁFICO ANTIGO
    if (graficoRankingCriado) graficoRankingCriado.destroy();

    const ctx = document.getElementById("graficoRanking");

    graficoRankingCriado = new Chart(ctx, {
        type: "bar",
        data: {
            labels: dados.produtos,        // AGORA É O NOME, NÃO O ID
            datasets: [{
                label: "Quantidade vendida",
                data: dados.quantidades,
                borderWidth: 2
            }]
        },
        options: {
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,        // ← Só números inteiros
                  precision: 0        // ← Remove casas decimais
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
