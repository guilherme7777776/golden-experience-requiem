"use strict";

const atributosParaPesquisar = ['id_pessoa', 'nome_cliente'];
let dadosParaFiltrar = [];

fetch('http://localhost:3001/pessoa')
  .then(response => response.json())
  .then(data => {
    window.osClientes = data.map(item => ({
      id_pessoa: item.id_pessoa,        // ID da pessoa
      nome_cliente: item.nome_cliente   // Nome do cliente
    }));

    dadosParaFiltrar = window.osClientes || [];
    console.log("dadosParaFiltrar atualizado:", dadosParaFiltrar);
  })
  .catch(error => {
    console.error("Erro ao buscar dados dos clientes:", error);
    window.osClientes = [];
});

function createBuscaDinamica({
  searchTypeId = 'searchType',
  searchInputId = 'id_pessoa',
  resultsListId = 'resultsList',
  atributosParaPesquisar,
  dadosParaFiltrar
}) {
    const searchTypeElement = document.getElementById(searchTypeId);
    const searchInputElement = document.getElementById(searchInputId);
    const resultsList = document.getElementById(resultsListId);

    let currentResolve = null;

    function hideList() {
        resultsList.classList.remove('show');
        resultsList.innerHTML = '';
    }

    function renderList(filtered) {
        resultsList.innerHTML = '';
        if (!filtered.length) {
        hideList();
        return;
        }

        filtered.forEach(dado => {
        const li = document.createElement('li');
        li.className = 'result-item';
        li.innerHTML = `<span class="result-main">${dado.nome_cliente}</span> <span class="result-type">(ID: ${dado.id_pessoa})</span>`;

        li.addEventListener('click', () => {
            const resp = {};
            atributosParaPesquisar.forEach(attr => { resp[attr] = dado[attr]; });

            hideList();
            searchInputElement.value = '';
            searchInputElement.blur();

            if (currentResolve) {
            currentResolve(resp);
            currentResolve = null;
            }
        });

        resultsList.appendChild(li);
        });

        resultsList.classList.add('show');
    }

    function filterBase() {
        const query = searchInputElement.value.trim().toLowerCase();
        const type = searchTypeElement.value;
        if (query.length === 0) {
        hideList();
        return;
        }

        const filtered = dadosParaFiltrar.filter(dado => {
        const valor = String(dado[type] || '').toLowerCase();
        return valor.includes(query);
        });

        renderList(filtered);
    }

    searchInputElement.addEventListener('input', filterBase);
    searchInputElement.addEventListener('focus', filterBase);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-bar-container')) {
        if (currentResolve) {
            currentResolve(null);
            currentResolve = null;
        }
        hideList();
        }
    });

    return {
        waitForSelection() {
        return new Promise(resolve => {
            currentResolve = resolve;
        });
        }
    };
}

async function buscaDinamica() {
  console.log("buscaDinamica chamada...");
  window.bdBusca = createBuscaDinamica({ atributosParaPesquisar, dadosParaFiltrar });

  if (!window.bdBusca) {
    console.error("Erro: bdBusca não inicializado.");
    return;
  }

  const resposta = await window.bdBusca.waitForSelection();

  if (!resposta) {
    console.log('Busca cancelada ou sem seleção.');
    return;
  }

  // Preencher campo com id_pessoa selecionado
  console.log("Preenchendo campo com ID Pessoa:", resposta.id_pessoa);
  document.getElementById('cliente_id_pessoa').value = resposta.id_pessoa || '';

  // Define tipo de busca para id_pessoa (caso use esse campo)
  document.getElementById('searchType').value = 'id_pessoa';
}
