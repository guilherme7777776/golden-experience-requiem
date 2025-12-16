
document.addEventListener('DOMContentLoaded', function () {
    // Recupera o valor do pagamento do sessionStorage

    // Pega o texto do sessionStorage
    const dadosDoPedido = sessionStorage.getItem('dadosPagamento');

    // Transforma de volta em objeto JavaScript
    const objetoDadosPedido = JSON.parse(dadosDoPedido);

    const valorTotal = objetoDadosPedido ? parseFloat(objetoDadosPedido.valor_total) : 0;
    const idPedido = objetoDadosPedido ? objetoDadosPedido.id_pedido : null;
    let valorRestante = valorTotal;
    let formasPagamento = [];

    // Elementos da DOM
    const elementoValorTotal = document.getElementById('valor-total');
    const elementoValorRestante = document.getElementById('valor-restante');
    const selectFormaPagamento = document.getElementById('forma-pagamento');
    const btnAdicionar = document.getElementById('btn-adicionar');
    const containerFormas = document.getElementById('formas-adicionadas');
    const formPagamento = document.getElementById('form-pagamento');
    const btnFinalizar = document.getElementById('btn-finalizar');

    // Atualiza os valores na página
    function atualizarValores() {
        elementoValorTotal.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        elementoValorRestante.textContent = `R$ ${valorRestante.toFixed(2).replace('.', ',')}`;

        // Atualiza cor do valor restante
        if (valorRestante === 0) {
            elementoValorRestante.style.color = '#1a5d3c';
        } else {
            elementoValorRestante.style.color = '#d9534f';
        }

        // Habilita/desabilita botão finalizar
        btnFinalizar.disabled = valorRestante !== 0;
    }

    // Inicializa valores
    atualizarValores();

    // Adiciona forma de pagamento
    btnAdicionar.addEventListener('click', function () {
        const tipo = selectFormaPagamento.value;

        if (!tipo) {
            alert('Por favor, selecione uma forma de pagamento.');
            return;
        }

        if (valorRestante <= 0) {
            alert('O valor total já foi distribuído entre as formas de pagamento.');
            return;
        }

        adicionarFormaPagamento(tipo);
        selectFormaPagamento.value = '';
    });

    // Adiciona uma nova forma de pagamento
    function adicionarFormaPagamento(tipo) {
        const id = Date.now(); // ID único
        const valorSugerido = valorRestante;

        formasPagamento.push({
            id: id,
            tipo: tipo,
            valor: 0
        });

        // Cria o elemento HTML
        const formaElement = document.createElement('div');
        formaElement.className = 'forma-pagamento-item';
        formaElement.id = `forma-${id}`;
        formaElement.innerHTML = `
            <div class="cabecalho-forma">
                <span class="tipo-pagamento">${obterNomeFormaPagamento(tipo)}</span>
                <button type="button" class="btn-remover" data-id="${id}">Remover</button>
            </div>
            <div class="campo-valor">
                <label for="valor-${id}">Valor (R$):</label>
                <input type="number" id="valor-${id}" min="0.01" max="${valorRestante}" step="0.01" value="${valorSugerido.toFixed(2)}" placeholder="0,00">
                <div class="erro" id="erro-${id}">Valor inválido</div>
            </div>
            <div class="detalhes-pagamento" id="detalhes-${id}">
                ${gerarDetalhesFormaPagamento(tipo, id)}
            </div>
        `;

        containerFormas.appendChild(formaElement);

        // Adiciona evento para atualizar valor
        const inputValor = document.getElementById(`valor-${id}`);
        inputValor.addEventListener('input', function () {
            atualizarValorForma(id, parseFloat(this.value) || 0);
        });

        // Adiciona evento para remover forma
        const btnRemover = formaElement.querySelector('.btn-remover');
        btnRemover.addEventListener('click', function () {
            removerFormaPagamento(id);
        });

        // Inicializa o valor
        atualizarValorForma(id, valorSugerido);
    }

    // Atualiza o valor de uma forma de pagamento
    function atualizarValorForma(id, novoValor) {
        const forma = formasPagamento.find(f => f.id === id);
        const inputValor = document.getElementById(`valor-${id}`);
        const erroElement = document.getElementById(`erro-${id}`);

        if (!forma) return;

        // Validação do valor
        if (novoValor < 0.01) {
            erroElement.style.display = 'block';
            inputValor.style.borderColor = '#d9534f';
            return;
        }

        const valorAnterior = forma.valor;
        const diferenca = novoValor - valorAnterior;

        // Verifica se excede o valor restante
        if (diferenca > valorRestante) {
            novoValor = valorAnterior + valorRestante;
            inputValor.value = novoValor.toFixed(2);
        }

        // Atualiza valores
        forma.valor = novoValor;
        valorRestante = valorTotal - formasPagamento.reduce((sum, f) => sum + f.valor, 0);

        // Atualiza interface
        erroElement.style.display = 'none';
        inputValor.style.borderColor = '#ddd';
        atualizarValores();

        // Atualiza max de todos os inputs
        formasPagamento.forEach(f => {
            const input = document.getElementById(`valor-${f.id}`);
            if (input) {
                input.max = (f.valor + valorRestante).toFixed(2);
            }
        });
    }

    // Remove uma forma de pagamento
    function removerFormaPagamento(id) {
        formasPagamento = formasPagamento.filter(f => f.id !== id);
        const formaElement = document.getElementById(`forma-${id}`);
        if (formaElement) {
            formaElement.remove();
        }

        // Recalcula valor restante
        valorRestante = valorTotal - formasPagamento.reduce((sum, f) => sum + f.valor, 0);
        atualizarValores();
    }

    // Gera os detalhes específicos de cada forma de pagamento
    function gerarDetalhesFormaPagamento(tipo, id) {
        switch (tipo) {
            case 'cartao':
                return `
                    <div class="campo">
                        <label for="numero-cartao-${id}">Número do Cartão</label>
                        <input type="text" id="numero-cartao-${id}" placeholder="1234 5678 9012 3456">
                    </div>
                    <div class="campo">
                        <label for="nome-cartao-${id}">Nome no Cartão</label>
                        <input type="text" id="nome-cartao-${id}" placeholder="JOÃO DA SILVA">
                    </div>
                    <div class="campo-duplo">
                        <div class="campo">
                            <label for="validade-${id}">Validade</label>
                            <input type="text" id="validade-${id}" placeholder="MM/AA">
                        </div>
                        <div class="campo">
                            <label for="cvv-${id}">CVV</label>
                            <input type="text" id="cvv-${id}" placeholder="123">
                        </div>
                    </div>
                `;
            case 'pix':
                return `
                    <p>Após confirmar o pagamento, você receberá o código PIX para realizar a transferência.</p>
                    <div class="qr-code-placeholder">
                        <div class="qr-code">QR Code aparecerá aqui</div>
                    </div>
                `;
            case 'boleto':
                return `
                    <p>O boleto será gerado após a confirmação do pedido e poderá ser pago em qualquer banco ou lotérica.</p>
                    <p>Vencimento: 3 dias úteis</p>
                `;
            default:
                return '';
        }
    }

    // Obtém o nome amigável da forma de pagamento
    function obterNomeFormaPagamento(tipo) {
        const nomes = {
            'cartao': 'Cartão de Crédito',
            'pix': 'PIX',
            'boleto': 'Boleto Bancário'
        };
        return nomes[tipo] || tipo;
    }

    // Valida o formulário antes do envio
    formPagamento.addEventListener('submit', function (e) {
        e.preventDefault();

        // Verifica se o valor total foi distribuído
        if (valorRestante > 0) {
            alert(`Ainda falta distribuir R$ ${valorRestante.toFixed(2).replace('.', ',')} entre as formas de pagamento.`);
            return;
        }

        // Valida formas de pagamento individuais
        let valido = true;
        formasPagamento.forEach(forma => {
            if (forma.tipo === 'cartao') {
                if (!validarCartao(forma.id)) {
                    valido = false;
                }
            }
        });

        if (!valido) {
            alert('Por favor, corrija os erros nos campos de pagamento.');
            return;
        }

        // Preparar dados para envio
        const dadosPagamento = {
            id_pedido: idPedido,
            valor_total: valorTotal,
            formas_pagamento: formasPagamento.map(forma => ({
                id_forma_pagamento: Number(forma.tipo),
                valor_pago: forma.valor
            }))
        };


        // Enviar dados para a rota de pagamento
        enviarPagamento(dadosPagamento);
    });


    function enviarPagamento(dados) {
        // MODIFICAR AQUI: Substituir pela rota correta do seu backend
        const rotaPagamento = 'http://localhost:3001/pagamento/finalizar'; // ROTA A SER MODIFICADA
        console.log(`boquelet`, dados, `sla`, JSON.stringify(dados))
        // Exemplo de envio usando fetch
        fetch(rotaPagamento, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro no processamento do pagamento');
                }
                return response.json();
            })
            .then(data => {
                // Processar resposta do servidor
                if (data.sucesso) {
                    alert('Pagamento realizado com sucesso!');
                    // Redirecionar para página de confirmação
                    sessionStorage.removeItem('carrinho');
                    window.location.href = 'http://localhost:3001/login/visaoclienteconfirmacao';
                } else {
                    alert('Erro no pagamento: ' + data.mensagem);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao processar pagamento. Tente novamente.');
            });

        // Para demonstração, apenas exibir os dados no console
        console.log('Dados do pagamento:', dados);
    }
});

/**
 * Popula o select de formas de pagamento com dados da API.
*/

function popularFormasPagamento(selectId, apiUrl) {
    const selectElement = document.getElementById(selectId);

    if (!selectElement) {
        console.error(`Elemento <select> com id="${selectId}" não encontrado.`);
        return;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar formas de pagamento: Status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Remove todas as opções existentes, exceto a primeira ('Selecione...')
            // Isso é feito para garantir que o select seja limpo antes de adicionar os novos itens.
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }

            // Itera sobre os dados e adiciona as novas opções
            data.forEach(forma => {
                const option = document.createElement('option');                
                option.value = forma.id_forma_pagamento;  // Usando o ID como valor
                option.textContent = forma.nome_forma_pagamento; // Usando o NOME como texto visível

                selectElement.appendChild(option);
            });
            console.log(data)
            console.log("Formas de pagamento carregadas e select populado com sucesso!");
        })
        .catch(error => {
            console.error('Ocorreu um erro na requisição:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    popularFormasPagamento('forma-pagamento', 'http://localhost:3001/forma_pagamento');
    //const oUsuario = obterDadosDoUsuario(urlDaRota); // Função hipotética para obter dados do usuário
    //console.log('Dados do usuário obtidos:', oUsuario);
});