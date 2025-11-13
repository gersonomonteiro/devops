-- Criar banco de dados
CREATE DATABASE devops_demo;

-- Conectar ao banco
\c devops_demo;

-- Criar tabela de utilizador
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO users (name, email, role) VALUES 
('João Silva', 'joao@email.com', 'admin'),
('Maria Santos', 'maria@email.com', 'user'),
('Pedro Oliveira', 'pedro@email.com', 'user');