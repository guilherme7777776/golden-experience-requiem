const API_BASE_URL = 'http://localhost:3001';
let currentProductId = null;
let operacao = null;

const form = document.getElementById('produtoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const produtosTableBody = document.getElementById('produtosTableBody');
const messageContainer = document.getElementById('messageContainer');

document.addEventListener('DOMContentLoaded', () => {
  carregarProdutos();
});

btnBuscar.addEventListener('click', buscarProduto);
btnIncluir.addEventListener('click', incluirProduto);
btnAlterar.addEventListener('click', alterarProduto);
btnExcluir.addEventListener('click', excluirProduto);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);
bloquearCampos(false);

function mostrarMensagem(texto, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input, index) => {
    if (index === 0) {
      input.disabled = bloquearPrimeiro;
    } else {
      input.disabled = !bloquearPrimeiro;
    }
  });
}

function limparFormulario() {
  form.reset();
}

function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
  btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
  btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
  btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
  btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
  btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
  btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

async function buscarProduto() {
  const id = searchId.value.trim();
  if (!id) {
    mostrarMensagem('Digite um ID para buscar', 'warning');
    return;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/produto/${id}`);
    if (response.ok) {
      const produto = await response.json();
      preencherFormulario(produto);
      mostrarBotoes(true, false, true, true, false, false);
      mostrarMensagem('Produto encontrado!', 'success');
    } else if (response.status === 404) {
      limparFormulario();
      searchId.value = id;
      mostrarBotoes(true, true, false, false, false, false);
      mostrarMensagem('Produto não encontrado. Você pode incluir um novo.', 'info');
      bloquearCampos(false);
    } else {
      throw new Error('Erro ao buscar produto');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarMensagem('Erro ao buscar produto', 'error');
  }
}

function preencherFormulario(produto) {
  currentProductId = produto.id_produto;
  searchId.value = produto.id_produto;
  document.getElementById('nome').value = produto.nome;
  document.getElementById('preco').value = produto.preco;
  document.getElementById('f_id_pessoa').value = produto.f_id_pessoa || '';
}

function incluirProduto() {
  currentProductId = searchId.value;
  limparFormulario();
  searchId.value = currentProductId;
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nome').focus();
  operacao = 'incluir';
}

function alterarProduto() {
  mostrarMensagem('Altere os dados e clique em Salvar.', 'info');
  bloquearCampos(true);
  mostrarBotoes(false, false, false, false, true, true);
  document.getElementById('nome').focus();
  operacao = 'alterar';
}

function excluirProduto() {
  mostrarMensagem('Produto será excluído. Confirme clicando em Salvar.', 'warning');
  bloquearCampos(false);
  searchId.disabled = true;
  mostrarBotoes(false, false, false, false, true, true);
  operacao = 'excluir';
}

async function salvarOperacao() {
  const formData = new FormData(form);
  const produto = {
    id_produto: searchId.value,
    nome: formData.get('nome'),
    preco: formData.get('preco'),
    f_id_pessoa: formData.get('f_id_pessoa')
  };

  try {
    let response = null;

    if (operacao === 'incluir') {
      response = await fetch(`${API_BASE_URL}/produto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });
    } else if (operacao === 'alterar') {
      response = await fetch(`${API_BASE_URL}/produto/${currentProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });
    } else if (operacao === 'excluir') {
      response = await fetch(`${API_BASE_URL}/produto/${currentProductId}`, {
        method: 'DELETE'
      });
    }

    if (response.ok) {
      mostrarMensagem(`Operação ${operacao} realizada com sucesso!`, 'success');
      limparFormulario();
      carregarProdutos();
    } else {
      const error = await response.json();
      mostrarMensagem(error.error || 'Erro na operação', 'error');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarMensagem('Erro na operação', 'error');
  }

  mostrarBotoes(true, false, false, false, false, false);
  bloquearCampos(false);
  searchId.focus();
}

function cancelarOperacao() {
  limparFormulario();
  mostrarBotoes(true, false, false, false, false, false);
  bloquearCampos(false);
  searchId.focus();
  mostrarMensagem('Operação cancelada', 'info');
}

async function carregarProdutos() {
  try {
    const response = await fetch(`${API_BASE_URL}/produto`);
    if (response.ok) {
      const produtos = await response.json();
      renderizarTabela(produtos);
    } else {
      throw new Error('Erro ao carregar produtos');
    }
  } catch (error) {
    console.error('Erro:', error);
    mostrarMensagem('Erro ao carregar lista de produtos', 'error');
  }
}

function renderizarTabela(produtos) {
  produtosTableBody.innerHTML = '';
  produtos.forEach(prod => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><button class="btn-id" onclick="selecionarProduto(${prod.id_produto})">${prod.id_produto}</button></td>
      <td>${prod.nome}</td>
      <td>R$ ${parseFloat(prod.preco).toFixed(2)}</td>
      <td>${prod.f_id_pessoa || ''}</td>
    `;
    produtosTableBody.appendChild(row);
  });
}

async function selecionarProduto(id) {
  searchId.value = id;
  await buscarProduto();
}
