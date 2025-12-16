let valorTotal = 0;

function carregarFinalizar() {
    // MUDANÇA: Agora busca a tag <tbody> pelo ID 'listaFinalizar'
    const tbodyLista = document.getElementById('listaFinalizar');
    const totalFinal = document.getElementById('total-final');
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];

    // Limpa apenas o corpo da tabela (mantendo o cabeçalho <thead>)
    tbodyLista.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        // Se o carrinho estiver vazio, insere a linha de aviso no <tbody>
        tbodyLista.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Carrinho vazio. Volte e adicione itens.</td></tr>`;
        document.getElementById('btn-finalizar').disabled = true;
        document.getElementById('total-final').textContent = 'Total Final: R$ 0,00';
        return;
    }

    document.getElementById('btn-finalizar').disabled = false;

    carrinho.forEach(prod => {
        const codigo = prod.codigo || prod.id || '(sem código)';
        // O cálculo original (preço * (quantidade / 1000)) implica que o preço é por KG.
        const subtotal = prod.preco*prod.quantidade
        total += subtotal;

        const linha = document.createElement('tr');
        linha.innerHTML = `
        <td>${codigo}</td>
        <td>${prod.nome}</td>
        <td>R$ ${prod.preco.toFixed(2)}</td> <td>${prod.quantidade} </td>
        <td>R$ ${subtotal.toFixed(2)}</td>
    `;
        // Adiciona a linha ao corpo da tabela (tbody)
        tbodyLista.appendChild(linha);
    });

    document.getElementById('total-final').textContent = `Valor total: R$ ${total.toFixed(2)}`;
    valorTotal = total;
    // MUDANÇA: Armazena o valor total no sessionStorage para uso na página de pagamento
    
}

// ... o restante do seu código JavaScript ...

function obterCarrinhoDoStorage(idPedido, dadosStorage) {
    try {
        let carrinhoData;

        // Se for passado o objeto Storage completo, extrai o valor da chave 'carrinho'
        if (typeof dadosStorage === 'object' && dadosStorage.getItem('carrinho')) { // Ajustado para chamar getItem() no objeto Storage
            carrinhoData = JSON.parse(dadosStorage.getItem('carrinho'));
        }
        // Se for passado diretamente a string do carrinho (caso não se aplique aqui diretamente, mas mantido)
        else if (typeof dadosStorage === 'string') {
            carrinhoData = JSON.parse(dadosStorage);
        }
        else {
            console.warn('Dados do carrinho não encontrados ou formato inválido');
            return [];
        }


        // Adiciona o id_pedido em cada item do carrinho
        const carrinhoComPedido = []; // Cria um novo array vazio

        for (const item of carrinhoData) {
            // Cria o novo objeto com a estrutura desejada
            const itemFormatado = {
                id_pedido: idPedido,
                id_produto: item.id,
                nome: item.nome,
                preco: item.preco,
            };

            // Adiciona o novo objeto ao array carrinhoComPedido
            carrinhoComPedido.push(itemFormatado);
        }

        return carrinhoComPedido;

    } catch (error) {
        console.error('Erro ao processar dados do carrinho:', error);
        return [];
    }
}

// ======== Envia o pedido ao backend ========
async function enviarDadosParaBD() {
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];

    if (carrinho.length === 0) {
        alert("O carrinho está vazio.");
        return;
    }

    // ---- 1) CRIAR PEDIDO ----
    const pedido = {
        id_funcionario: 1,
        data_pedido: new Date().toISOString().slice(0, 10),
        id_pessoa: 1
    };

    let dados;

    try {
        const resposta = await fetch('http://localhost:3001/pedido/online', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)  
        });
        
        if (!resposta.ok) {
            throw new Error(await resposta.text());
        }

        dados = await resposta.json();
        const idPedido = dados.id_pedido;


        // ---- 2) PREPARAR ITENS ----
        const dadosItensDoPedido = carrinho.map(item => ({
            pedido_id_pedido: idPedido,
            produto_id_produto: item.id || item.codigo,
            quantidade: item.quantidade || 1,
            preco_unitario: item.preco,

        }));

        console.log("Itens preparados:", dadosItensDoPedido);

        // ---- 3) ENVIAR ITENS PARA /item_produto/lote ----
        const rota = 'http://localhost:3001/item_pedido/lote';
   
        const respItens = await fetch(rota, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosItensDoPedido)
        });
        console.log(respItens)
        if (!respItens.ok) {
            throw new Error(await respItens.text());
        }

        console.log("Itens inseridos com sucesso");
        // ---- 4) ALERT ----
        let aux = "";
       
        carrinho.forEach(item => {
        aux += `\n- Produto: ${item.nome} - R$ ${item.preco.toFixed(2)}`;
        });

        console.log(aux)
        alert(`Pedido ${idPedido} finalizado:\n${aux}`);

        // ---- 5) PAGAMENTO ----
        const dadosPagamento = {
            id_pedido: idPedido,
            valor_total: valorTotal  
        };

        sessionStorage.setItem('dadosPagamento', JSON.stringify(dadosPagamento));

        window.location.href = 'http://localhost:3001/login/visaoclientepagamento';

    } catch (erro) {
        console.error('❌ Erro ao enviar pedido:', erro);
        alert('Ocorreu um erro ao finalizar o pedido. Veja o console.');
    }
}

// ======== Evento do botão ========
document.getElementById('btn-finalizar').addEventListener('click', enviarDadosParaBD);

// ======== Ao carregar página ========
carregarFinalizar();