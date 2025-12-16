function formatarPreco(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function carregarCarrinho() {
    // MUDANÇA: Usando sessionStorage para carregar o carrinho
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
    const corpo = document.getElementById('corpo-tabela');
    
    const totalGeral = document.getElementById('total-geral');
    corpo.innerHTML = '';
    let total = 0;
    
    console.log("geral",total,"totalgeral", totalGeral.textContent)
    if (carrinho.length === 0) {
        corpo.innerHTML = `<tr><td colspan="6" style="text-align:center;">Seu carrinho está vazio.</td></tr>`;
        document.getElementById('btn-finalizar').disabled = true;
        document.getElementById('btn-limpar').disabled = true;
        totalGeral.textContent = `Total: R$ 0,00`;
        return;
    }

    carrinho.forEach((item, index) => {
        // Cálculo do subtotal (item.preco é o preço por Kg, item.quantidade é em gramas)
        const subtotal = item.preco * item.quantidade;
        total += subtotal;
        
        const linha = document.createElement('tr');
        linha.innerHTML = `
          <td>${item.id}</td>
          <td>${item.nome}</td>
          <td>
            <input type="number" min="0" step="1" value="${item.quantidade}" onchange="atualizarQuantidade(${index}, this.value)">
          </td>
          <td>${formatarPreco(item.preco)}</td>
          <td>${formatarPreco(subtotal)}</td>
          <td><button class="btn-remover" onclick="removerItem(${index})">Remover</button></td>
        `;
        
        corpo.appendChild(linha);
    });

    
    totalGeral.textContent = `Total: ${formatarPreco(total)}`;
    console.log("geral",total,"totalgeral", totalGeral.textContent)
    document.getElementById('btn-finalizar').disabled = false;
    document.getElementById('btn-limpar').disabled = false;
}

function removerItem(index) {
    // MUDANÇA: Usando sessionStorage
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
    carrinho.splice(index, 1);
    // MUDANÇA: Usando sessionStorage
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    carregarCarrinho();
}

function atualizarQuantidade(index, novaQtd) {
    // MUDANÇA: Usando sessionStorage
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
    // Garante que a quantidade seja um número inteiro
    carrinho[index].quantidade = parseInt(novaQtd); 
    // MUDANÇA: Usando sessionStorage
    sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    carregarCarrinho();
}

function limparCarrinho() {
    if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
        // MUDANÇA: Usando sessionStorage
        sessionStorage.removeItem('carrinho');
        carregarCarrinho();
    }
}

function finalizarPedido() {
    // MUDANÇA: Usando sessionStorage
    
    const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
    console.log(carrinho)
    if (carrinho.length === 0 ) {
        alert("Seu carrinho está vazio.");
        return;
    }
    const quantidadeInvalida = carrinho.some(item => item.quantidade <= 0);
    const precoInvalido = carrinho.some(item => item.preco <= 0);
    if (quantidadeInvalida || precoInvalido ) {
        alert("Existe um produto com quantidade inválida!");
        return;
    }

   
}


document.getElementById('btn-limpar').addEventListener('click', limparCarrinho);
window.onload = carregarCarrinho;