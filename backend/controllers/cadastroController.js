const { query } = require('../database');
const path = require('path');

exports.abrirCadastro= (req, res) => {
  console.log('Rota abrirCrudcargo acessada');
  
  res.sendFile(path.join(__dirname, '../../frontend/cadastro/cadastro.html'));
 
};


exports.cadastrar = async (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            endereco,
            telefone,
            data_nascimento,
        } = req.body;

        // ------------------------------
        // VALIDACOES SIMPLES
        // ------------------------------

        // Verificar campos obrigatórios
        if (!nome || !email || !senha || !endereco || !telefone || !data_nascimento) {
            return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
        }

        // Validação de e-mail básica
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Formato de e-mail inválido." });
        }

        // Senha mínima
        if (senha.length < 6) {
            return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
        }

        // Data de nascimento válida
        if (isNaN(new Date(data_nascimento).getTime())) {
            return res.status(400).json({ message: "Data de nascimento inválida." });
        }

        // ------------------------------
        // CRIA ID MANUAL
        // ------------------------------
        const result = await query(`SELECT COALESCE(MAX(id_pessoa), 0) + 1 AS nextId FROM PESSOA`);
        const id_pessoa = result.rows[0].nextid;

        // ------------------------------
        // INSERE NA TABELA PESSOA
        // ------------------------------
        await query(`
            INSERT INTO PESSOA 
            (id_pessoa, nome_pessoa, email_pessoa, senha_pessoa, endereco_pessoa, telefone_pessoa, data_nascimento)
            VALUES ($1,$2,$3,$4,$5,$6,$7)
        `, [id_pessoa, nome, email, senha, endereco, telefone, data_nascimento]);

        // ------------------------------
        // INSERE NA TABELA CLIENTE
        // ------------------------------
        await query(`
            INSERT INTO CLIENTE (id_pessoa, renda_cliente, data_cadastro)
            VALUES ($1, $2, CURRENT_DATE)
        `, [id_pessoa, null]);

        const dadosUsuario = {
        id_pessoa: id_pessoa,
        nome: nome,
        };
        console.log(dadosUsuario)

        // 3. Define cookie
        res.cookie('usuarioLogado', JSON.stringify(dadosUsuario), {
        sameSite: 'None',
        secure: true,
        httpOnly: true,
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 dia
        });
            
        // Resposta final
        res.json({ message: "Cliente cadastrado com sucesso!" });

    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ 
            message: "Erro ao cadastrar cliente.", 
            error: error.message 
        });
    }
};
