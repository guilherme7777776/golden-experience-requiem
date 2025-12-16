
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';

const form = document.getElementById("cadastroForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = Object.fromEntries(new FormData(form));

    const response = await fetch(`${API_BASE_URL}/cadastro/cadastrar`, {
    method: 'POST',
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
    });

    
    
    const json = await response.json();
    msg.textContent = json.message;
    if (response.ok) {
       // alert("Login bem-sucedido! Bem-vindo, " + data.nome);
        window.location.href = API_BASE_URL + "/menu.html";
    } else {
        alert('deu varios erros')
        
    }
});
