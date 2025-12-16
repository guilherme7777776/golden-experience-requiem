const API_BASE_URL = 'http://localhost:3001';
const API_IMAGEM_PREFIX = '/view-image';

const carrosselWrapper = document.getElementById('carrossel-wrapper');
const contadorCarrinho = document.getElementById('contadorCarrinho');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const itemMenuCadastros = document.getElementById("itemMenuCadastros");
window.onload = (atualizarContadorCarrinho)


function mostrarMensagem(texto, tipo = 'info') {
  messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
  setTimeout(() => {
      messageContainer.innerHTML = '';
  }, 3000);
}

function handleUserAction(action) {
  if (action === "sair") {
    logout();
  }
}

async function logout() {
  try {
    const res = await fetch(`${API_BASE_URL}/login/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    if (data.status === 'ok') {
      // Sessão destruída
      window.location.href = "./login/login.html";
      
      return true;
    } else {
      console.warn("Logout falhou no backend:", data);
      window.location.href = "./login/login.html";
      return false;
    }

  } catch (error) {
    console.error("Erro ao tentar fazer logout:", error);
    window.location.href = "./login/login.html";
    return false;
  }
}


async function verificarAutorizacao() {
  try {
    const res = await fetch(API_BASE_URL + '/login/verificaSeUsuarioEstaLogado', {
      credentials: 'include'
    });

    const oUsuario = await res.json();

    if (oUsuario.status !== 'ok') {
      //console.log("Usuário não logado, redirecionando.");
      window.location.href = "./login/login.html";
      return false;
    }

    const usuarioObjeto = JSON.parse(oUsuario.usuario || '{}');
    const oCargo = usuarioObjeto.ehFuncionario ? usuarioObjeto.ehFuncionario.nome_cargo : 'Cliente';
    
    // 🟢 LÓGICA DE CONTROLE DO MENU CADASTROS
    if (itemMenuCadastros) {
      if (oCargo === 'Gerente') {
        // Se for Gerente, adiciona a classe para tornar o item visível (usando display: block)
        itemMenuCadastros.classList.add("gerente-acesso-total");
      } else {
        // Caso contrário, remove a classe (o CSS mantém o display: none por padrão)
        itemMenuCadastros.classList.remove("gerente-acesso-total");
      }
    }
    
    document.getElementById("oUsuario").options[0].text = `${usuarioObjeto.nome} - ${oCargo}`;
    return true;

  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
}

function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
  contadorCarrinho.textContent = carrinho.length;
}

function criarCardProduto(produto) {
  const card = document.createElement('div');
  card.classList.add('produto-card');

  const caminhoImagem = `${API_BASE_URL}${API_IMAGEM_PREFIX}/${produto.id_produto}`;
  const imagemPlaceholder = 'https://via.placeholder.com/200?text=Sem+Imagem';

  const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  
  card.innerHTML = `
    <img src="${caminhoImagem}" 
         alt="${produto.nome}" 
         class="card-imagem"
         onerror="this.onerror=null; this.src='${imagemPlaceholder}';"
    >
    <div class="card-titulo">${produto.nome}</div>
    <div class="card-detalhe">ID: ${produto.id_produto}</div>
    <div class="card-preco">${precoFormatado}</div>
    <div class="card-selecao-quantidade">
      <input type="number" id="qtd-${produto.id_produto}" class="input-quantidade" value="1" min="1" step="1" data-produto-id="${produto.id_produto}">
    </div>
    <button class="btn-carrinho" data-produto-id="${produto.id_produto}">Adicionar ao Carrinho</button>
  `;
  console.log(produto.nome)
  return card;
}

function adicionarAoCarrinho(produtoId) {
  const inputQtd = document.querySelector(`.input-quantidade[data-produto-id="${produtoId}"]`);

  if (!inputQtd) {
    console.error("Campo de quantidade não encontrado para o produto", produtoId);
    return;
  }

  const quantidade = parseInt(inputQtd.value);
  if (isNaN(quantidade) || quantidade <= 0) {
    alert("Quantidade inválida!");
    return;
  }

  fetch(`${API_BASE_URL}/produto/${produtoId}`)
    .then(res => {
      if (!res.ok) throw new Error("Erro ao buscar produto");
      return res.json();
    })
    .then(produtoAPI => {
      const item = {
        id: produtoAPI.id_produto,
        nome: produtoAPI.nome,
        preco: parseFloat(produtoAPI.preco),
        quantidade: quantidade
      };

      let carrinho = JSON.parse(sessionStorage.getItem('carrinho')) || [];
      const existente = carrinho.find(i => i.id === item.id);

      // 🔵 Se já existe no carrinho, SOMA quantidade
      if (existente) {
        existente.quantidade += quantidade;
      } else {
        carrinho.push(item);
      }

      sessionStorage.setItem('carrinho', JSON.stringify(carrinho));
      atualizarContadorCarrinho();


      mostrarMensagem(`Produto adicionado ${quantidade} vez`, 'success');

    })
    .catch((erro) => {
      console.error(erro);
      alert("Erro ao adicionar ao carrinho.");
    });
}


function renderizarProdutos(dados) {
  carrosselWrapper.innerHTML = '';

  const produtos = Array.isArray(dados) ? dados : (dados.products || []);
  console.log(produtos)
  if (produtos.length === 0) {
    carrosselWrapper.innerHTML = `<div class="mensagem-info">Nenhum produto encontrado.</div>`;
    return;
  }
   
  produtos.forEach(p => {
    
    const card = criarCardProduto(p);
    carrosselWrapper.appendChild(card);
  });
  

  document.querySelectorAll('.btn-carrinho').forEach(btn => {
    btn.addEventListener('click', e => adicionarAoCarrinho(e.target.dataset.produtoId));
  });
}

async function buscarProdutos() {
  try {
    const resposta = await fetch(API_BASE_URL + "/produto");

    if (!resposta.ok) {
      throw new Error("Erro na resposta da API");
    }

    const dados = await resposta.json();

    renderizarProdutos(dados);

  } catch (erro) {
    console.error("Erro ao carregar produtos:", erro);
    carrosselWrapper.innerHTML = `<div class="mensagem-info" style="color:red;">Erro ao carregar os produtos.</div>`;
  }
}

// ====== Controles do carrossel ======
prevBtn.addEventListener('click', () => {
  carrosselWrapper.scrollBy({ left: -300, behavior: 'smooth' });
});

nextBtn.addEventListener('click', () => {
  carrosselWrapper.scrollBy({ left: 300, behavior: 'smooth' });
});

// ====== Inicialização ======
window.onload = () => {
  // A ordem é importante: primeiro verifica a autorização para configurar o menu
  verificarAutorizacao(); 
  buscarProdutos();
  atualizarContadorCarrinho();
};