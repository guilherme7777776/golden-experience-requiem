-- Set schema
SET search_path TO public;

-- DROP em ordem de dependência
DROP TABLE IF EXISTS PAGAMENTO_HAS_FORMA_PAGAMENTO CASCADE;
DROP TABLE IF EXISTS PAGAMENTO CASCADE;
DROP TABLE IF EXISTS ITEM_PEDIDO CASCADE;
DROP TABLE IF EXISTS PEDIDO CASCADE;
DROP TABLE IF EXISTS CD CASCADE;
DROP TABLE IF EXISTS VINIL CASCADE;
DROP TABLE IF EXISTS CAMISETA CASCADE;
DROP TABLE IF EXISTS PRODUTO CASCADE;
DROP TABLE IF EXISTS GERENTE CASCADE;
DROP TABLE IF EXISTS FUNCIONARIO CASCADE;
DROP TABLE IF EXISTS CARGO CASCADE;
DROP TABLE IF EXISTS CLIENTE CASCADE;
DROP TABLE IF EXISTS FORMA_PAGAMENTO CASCADE;
DROP TABLE IF EXISTS PESSOA CASCADE;

-- ========================
-- TABELAS
-- ========================

CREATE TABLE PESSOA (
    id_pessoa INT PRIMARY KEY,
    nome_pessoa VARCHAR(100) NOT NULL,
    email_pessoa VARCHAR(70) NOT NULL,
    senha_pessoa VARCHAR(255) NOT NULL,
    endereco_pessoa VARCHAR(100),
    telefone_pessoa VARCHAR(20),
    data_nascimento DATE
);

CREATE TABLE CLIENTE (
    id_pessoa INT PRIMARY KEY,
    renda_cliente DECIMAL(10,2),
    data_cadastro DATE,
    FOREIGN KEY (id_pessoa) REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE
);

CREATE TABLE CARGO (
    id_cargo SERIAL PRIMARY KEY,
    nome_cargo VARCHAR(50) NOT NULL
);

CREATE TABLE FUNCIONARIO (
    id_pessoa INT PRIMARY KEY,
    salario_funcionario DECIMAL(10,2),
    carga_horaria NUMERIC(5,2) CHECK (carga_horaria > 0),
    comissao DECIMAL(10,2) DEFAULT 0 CHECK (comissao >= 0),
    id_cargo INT,
    FOREIGN KEY (id_pessoa) REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE,
    FOREIGN KEY (id_cargo) REFERENCES CARGO(id_cargo) ON DELETE SET NULL
);

CREATE TABLE PRODUTO (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    id_funcionario INT,
    FOREIGN KEY (id_funcionario) REFERENCES FUNCIONARIO(id_pessoa) ON DELETE SET NULL
);

CREATE TABLE CAMISETA (
    id_produto INT PRIMARY KEY,
    tamanho VARCHAR(10),
    cor VARCHAR(20),
    FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE CASCADE
);

CREATE TABLE VINIL (
    id_produto INT PRIMARY KEY,
    ano_lancamento INT,
    FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE CASCADE
);

CREATE TABLE CD (
    id_produto INT PRIMARY KEY,
    duracao_minutos INT,
    FOREIGN KEY (id_produto) REFERENCES PRODUTO(id_produto) ON DELETE CASCADE
);

CREATE TABLE PEDIDO (
    id_pedido SERIAL PRIMARY KEY,
    id_funcionario INT NOT NULL,
    data_pedido DATE,
    id_pessoa INT NOT NULL,
    FOREIGN KEY (id_pessoa) REFERENCES PESSOA(id_pessoa) ON DELETE CASCADE,
    FOREIGN KEY (id_funcionario) REFERENCES FUNCIONARIO(id_pessoa) ON DELETE CASCADE
);

CREATE TABLE ITEM_PEDIDO (
    id_item SERIAL PRIMARY KEY,
    pedido_id_pedido INT NOT NULL,
    produto_id_produto INT NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario >= 0),
    FOREIGN KEY (pedido_id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (produto_id_produto) REFERENCES PRODUTO(id_produto) ON DELETE CASCADE
);

CREATE TABLE FORMA_PAGAMENTO (
    id_forma_pagamento SERIAL PRIMARY KEY,
    nome_forma_pagamento VARCHAR(50) NOT NULL
);

CREATE TABLE PAGAMENTO (
    id_pagamento SERIAL PRIMARY KEY,
    id_pedido INT UNIQUE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total >= 0),
    data_pagamento TIMESTAMP NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE
);

CREATE TABLE PAGAMENTO_HAS_FORMA_PAGAMENTO (
    id_pagamento INT NOT NULL,
    id_forma_pagamento INT NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL CHECK (valor_pago >= 0),
    PRIMARY KEY (id_pagamento, id_forma_pagamento),
    FOREIGN KEY (id_pagamento) REFERENCES PAGAMENTO(id_pagamento) ON DELETE CASCADE,
    FOREIGN KEY (id_forma_pagamento) REFERENCES FORMA_PAGAMENTO(id_forma_pagamento) ON DELETE CASCADE
);

-- ========================
-- INSERÇÕES CORRIGIDAS
-- ========================

INSERT INTO PESSOA (id_pessoa, nome_pessoa, email_pessoa, senha_pessoa, endereco_pessoa, telefone_pessoa, data_nascimento) VALUES
(0, 'online', 'online@gmail.com', 'abc123','Loja', '00000000', '1900-01-01' ),
(1, 'João Silva', 'joao@empresa.com', 'senha123', 'Rua das magnolias', '99990001', '1985-05-10'),
(2, 'Kiko Loureiro', 'kikoloureiro@gmail.com', 'senha', 'Rua Vivara Grande', '99990002', '1990-07-15'),
(3, 'Carlos Lima', 'carlos@empresa.com', 'senha789', 'Rua C, 30', '99990003', '1988-03-22'),
(4, 'Cliente da silva', 'cliente@cliente.com', 'senha', 'Rua D, 40', '88880001', '1992-02-20'),
(5, 'Bruno Costa', 'bruno@cliente.com', 'senha222', 'Rua E, 50', '88880002', '1987-11-05'),
(6, 'Carla Rocha', 'carla@cliente.com', 'senha333', 'Rua F, 60', '88880003', '1995-08-30'),
(7, 'Fabio Souza', 'fabio@empresa.com', 'senha321', 'Rua G, 70', '99990004', '1983-01-05'),
(8, 'Gabriela Alves', 'gabriela@empresa.com', 'senha654', 'Rua H, 80', '99990005', '1991-09-10'),
(9, 'Helena Martins', 'helena@empresa.com', 'senha987', 'Rua I, 90', '99990006', '1987-12-20'),
(10, 'Igor Campos', 'igor@empresa.com', 'senha159', 'Rua J, 100', '99990007', '1986-06-25');

INSERT INTO CARGO (id_cargo,nome_cargo) VALUES
(1,'Vendedor'),
(2,'Gerente'),
(3,'Caixa');

INSERT INTO FUNCIONARIO (id_pessoa, salario_funcionario, carga_horaria, comissao, id_cargo) VALUES
(0,0,1,0,1),
(1, 3000.00, 44.0, 300.00, 1),
(2, 4000.00, 40.0, 400.00, 2),
(3, 2500.00, 36.0, 250.00, 1),
(7, 3500.00, 42.0, 350.00, 2),
(8, 3200.00, 40.0, 320.00, 1),
(9, 3100.00, 38.0, 310.00, 1),
(10, 3600.00, 44.0, 360.00, 3);

INSERT INTO CLIENTE (id_pessoa, renda_cliente, data_cadastro) VALUES
(4, 5000.00, '2025-10-10'),
(5, 7000.00, '2025-10-11'),
(6, 3000.00, '2025-10-12');

-- PRODUTOS
INSERT INTO PRODUTO (id_produto, nome, preco, id_funcionario) VALUES
(1,  'Vinil Clube da esquina',                169.90, 1),
(2, 'Vinil Yes - Close to the Edge',                          184.90, 3),
(3,  'Vinil Metallica - Ride the Lightning',                   159.90, 3),
(4,  'Vinil King Crimson - In the Court of the Crimson King',  189.90, 2),
(5,  'Vinil Megadeth - Rust in Peace',                         149.90, 8),
(6,  'Vinil Angra - Temple of Shadows',                        179.90, 9),
(7,  'Vinil Blind Guardian - Somewhere Far Beyond',            169.90, 10),
(8,  'Vinil Pink Floyd - Animals',                             179.90, 1),
(9,  'Vinil Metallica - Master of Puppets',                    164.90, 7),
(10,  'Vinil Black Sabbath - Vol.4',                            159.90, 2),
(11, 'CD Angra - Rebirth',                                     49.90, 7),
(12, 'CD Angra - Angels Cry',                                  44.90, 8),
(13, 'CD Dream Theater - Images and Words',                    59.90, 9),
(14, 'CD Dream Theater - Metropolis Pt.2',                     64.90, 10),
(15, 'CD Black Sabbath - Heaven and Hell',                     57.90, 1),
(16, 'CD Megadeth - Peace Sells... But Who s Buying?',        52.90, 2),
(17, 'Camiseta Mustaine Wrote Em All', 45.00, 7),
(18, 'Camiseta Black Sabbath - Master of Reality', 49.90, 8);

INSERT INTO VINIL (id_produto, ano_lancamento) VALUES
(1,  1971),  -- Master of Reality
(2, 1972),  -- Close to the Edge
(3,  1984),  -- Ride the Lightning
(4,  1969),  -- In the Court of the Crimson King
(5,  1990),  -- Rust in Peace
(6,  2004),  -- Temple of Shadows
(7,  1992),  -- Somewhere Far Beyond
(8,  1977),  -- Animals
(9,  1986),  -- Master of Puppets
(10,  1972);  -- Vol.4

INSERT INTO CAMISETA (id_produto, tamanho, cor) VALUES
(17, NULL, NULL),
(18, NULL, NULL);



INSERT INTO CD (id_produto, duracao_minutos) VALUES
(11, 48),  -- Rebirth
(12, 49),  -- Angels Cry
(13, 57),  -- Images and Words
(14, 75),  -- Metropolis Pt.2
(15, 41),  -- Heaven and Hell
(16, 36);  -- Peace Sells



-- PEDIDOS
INSERT INTO PEDIDO (id_funcionario, data_pedido, id_pessoa) VALUES
(1, '2025-10-13', 4),
(2, '2025-10-14', 5),
(3, '2025-10-15', 6),
(7, '2025-10-16', 4),
(8, '2025-10-17', 5),
(9, '2025-10-18', 6),
(2, '2025-10-19', 4),
(2, '2025-10-01', 5),
(2, '2025-10-30', 5),
(2, '2025-10-26', 5);

INSERT INTO ITEM_PEDIDO (pedido_id_pedido, produto_id_produto, quantidade, preco_unitario) VALUES
(1, 1, 1, 89.90),
(1, 3, 1, 54.90),
(2, 2, 1, 149.90),
(2, 4, 1, 99.90),
(3, 5, 1, 159.90),
(3, 6, 1, 59.90),
(4, 7, 1, 84.90),
(4, 8, 1, 139.90),
(5, 9, 1, 49.90),
(5, 10, 1, 89.90),
(6, 3, 1, 54.90),
(6, 4, 1, 99.90),
(6, 2, 1, 149.90),
(7, 1, 2, 89.90),
(7, 5, 1, 159.90),
(8, 8, 1, 139.90),
(8, 10, 1, 89.90);

INSERT INTO PAGAMENTO (id_pedido, data_pagamento, valor_total) VALUES
(1, '2025-10-13 14:30:00', 144.80),
(2, '2025-10-14 10:15:00', 249.80),
(3, '2025-10-15 12:50:00', 218.80),
(4, '2025-10-16 13:45:00', 224.80),
(5, '2025-10-17 09:25:00', 139.80),
(6, '2025-10-18 15:40:00', 303.70),
(7, '2025-10-19 18:10:00', 339.70),
(8, '2025-10-20 20:05:00', 228.80);

INSERT INTO FORMA_PAGAMENTO (nome_forma_pagamento) VALUES
('Cartão de Crédito'),
('Boleto Bancário'),
('Pix'),
('Dinheiro');

INSERT INTO PAGAMENTO_HAS_FORMA_PAGAMENTO (id_pagamento, id_forma_pagamento, valor_pago) VALUES
(1, 1, 144.80),
(2, 3, 249.80),
(3, 2, 218.80),
(4, 4, 224.80),
(5, 1, 139.80),
(6, 3, 303.70),
(7, 1, 339.70),
(8, 4, 228.80);