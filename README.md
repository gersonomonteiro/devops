
---

# 🚀 DevOps Demo App
![CI/CD](./ci-cd.png)
## **Tema:** *“DevOps – Pensar como DevOps, construir, automatizar, entregar”*

Este repositório foi criado para a sessão de **DevOps** com o objetivo de te ajudar a compreender e experimentar o **ciclo completo de desenvolvimento, automação e entrega de software**.

---

## 🎯 Objetivos da Sessão

Aprender na prática:
- O que é DevOps e como funciona o seu ciclo completo;
- Como empacotar aplicações com **Docker**;
- Como usar **Nginx** como *reverse proxy*;
- Como automatizar *builds* e *deploys* com **Jenkins (CI/CD)**.

---

## 🧰 Tecnologias Usadas

| Ferramenta | Função |
|-------------|--------|
| **Node.js + Express + react + postgres** | Aplicação simples (backend e frontend básico) |
| **Docker & Docker Compose** | Containers e orquestração |
| **Nginx** | Reverse proxy da aplicação |
| **Jenkins** | Automação CI/CD |
| **Git** | Controlo de versões |

---

## ⚙️ 1️⃣ Pré-requisitos

Antes de começar, instala no teu computador:

- 🐳 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 💻 [Git](https://git-scm.com/)
- (Opcional) [Node.js 18+](https://nodejs.org/) — se quiseres testar a app sem Docker

Verifica se está tudo funcional:

```bash
docker --version
git --version
````

---

## 🧩 2️⃣ Clonar o Repositório

Abre o terminal e executa:

```bash
git clone https://github.com/gersonomonteiro/devops.git

cd devops

```
---

## 🚀 3️⃣ Rodar a Aplicação com Docker Compose (sem ci/cd)

### 🏗️ Construir e subir os containers

```bash
docker compose -p devops up -d --build
```

O Compose vai:

* Construir a imagem da aplicação (Node.js);
* Subir o *container* da app;

---

### 🌍 Aceder à aplicação

Abre no navegador:

* **Frontend:** [http://localhost:3006](http://localhost:3006)
* **Backend Health check:** [http://localhost:5006/health](http://localhost:5006/health)
* **Backend API user:** [http://localhost:5006/api/users](http://localhost:5006/api/users)

Deverás ver algo como no endpoint Health check:

```json
{
  "status": "OK",
  "timestamp": "2025-11-13T10:29:27.498Z",
  "environment": "production"
}
```

---

### ⏹️ Parar a aplicação

```bash
docker compose -p devops down 
```

---

## 🧠 4️⃣ Subir o Jenkins (CI/CD) e nginx (reverse proxy)

### 🐳 Rodar o Jenkins e nginx

```bash
docker-compose -f docker-compose-ci-cd.yml -p jenkins-devops up -d
```

---
### 🌐 Aceder ao Jenkins

Depois de iniciar, abre:
👉 [http://localhost:8082](http://localhost:8082)

Obtém a password inicial:

```bash
docker exec -it jenkins-devops cat /var/jenkins_home/secrets/initialAdminPassword
```

Copia-a e cola na tela do navegador, depois:

1. Escolhe **Install suggested plugins**
2. Cria o teu utilizador admin
3. Acede ao *dashboard* do Jenkins 🎉

---

	Instalar docker dentro de jenkins usando usando os comando:

```sh
docker exec -it jenkins-devops bash -c "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"

docker exec -it jenkins-devops bash -c "curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m) -o /usr/local/bin/docker-compose"


docker exec -it jenkins-devops bash -c "chmod +x /usr/local/bin/docker-compose"

```
🧩 Verificar a Instalação do Docker e Docker Compose no Container

```sh
docker exec -it jenkins-devops docker --version
docker exec -it jenkins-devops docker-compose --version
```

✅ Resultado Esperado

```sh
Docker version 29.0.0, build 3d4129b
Docker Compose version v2.40.3

```
---


## ⚙️ 5️⃣ Configurar o Pipeline (CI/CD)

### (Opcional) Jenkins Plugin

Instalar no jenkins dashboard

- Stage View

### 📦 Criar um novo pipeline no Jenkins

1. No *dashboard*, clica em **New Item**
2. Escolhe **Pipeline**
3. Dá o nome `devops-demo`
4. Seleciona **Pipeline script from SCM**
5. Em “SCM”, escolhe **Git**
6. Cola o link do repositório
7. Guarda e clica em **Build Now**

---

### 📋 O pipeline fará automaticamente:

1. **Checkout do código**
2. **Instalação de dependências** (`npm install`)
3. **Execução de testes simples**
4. **Build da imagem Docker**
6. **Deploy automático**

Acompanha os logs no **Console Output** do Jenkins.

---

## 🔍 6️⃣ Verificação e Testes

Durante o *build*, verifica os containers ativos:

```bash
docker ps
```

Deverás ver algo como:

```
CONTAINER ID         IMAGE                        STATUS
jenkins-devops       jenkins/jenkins:lts-jdk17   Up 46 minutes
nginx-devops         nginx:latest                Up 46 minutes
devops-frontend      devops-frontend             Up 3 minutes
devops-backend       devops-backend              Up 3 minutes
devops-postgres      devops-postgres             Up 3 minutes
```
---

## 🌐 7️⃣ (Opcional) Adicionar um DNS Local / URL Personalizada

Para tornar o ambiente mais realista, podes aceder à aplicação usando um **nome personalizado**, por exemplo:

👉 http://frontend.local
👉 http://backend.local

---

### 🧱 7.1 Editar o ficheiro `hosts`

O ficheiro `hosts` permite criar entradas de DNS locais no teu computador.

#### 🪟 **Windows**
1. Abre o Bloco de Notas como **Administrador**
2. Abre o ficheiro:
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```
3. No final do ficheiro, adiciona esta linha:
   ```
   127.0.0.1   frontend.local
   127.0.0.1   backend.local
   ```
4. Guarda e fecha o ficheiro.

---

### ⚙️ 7.2 Atualizar a configuração do Nginx

Abre o ficheiro `nginx/default.conf` e altera a linha `server_name` para:

```nginx
server {
    listen 80;
    server_name frontend.local;

    location / {
        proxy_pass http://host.docker.internal:3006;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
server {
    listen 80;
    server_name backend.local;

    location / {
        proxy_pass http://host.docker.internal:5006/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> 💡 Assim, o Nginx responderá apenas quando o pedido vier de `frontend.local` e `backend.local` .

---

### 🔁 7.3 Reiniciar os containers

Depois de alterar o ficheiro, executa:

```bash
docker restart nginx-devops
```

---

### 🌍 7.4 Testar no navegador

Agora abre:  
👉 [http://backend.local](http://backend.local)

Se tudo estiver configurado corretamente, verás a tua aplicação a funcionar com o novo domínio local 🎉

> 🧠 **Dica:**  
> Este método é ótimo para simular ambientes reais (como `nginx.local`, `jenkins.local`, etc.) antes de configurar DNS de verdade em servidores.

---

---

## 🧹  Parar e Limpar Tudo
Remove os containers e os dados (-v)
```bash
docker compose -p jenkins-devops down -v
```

---

## 💡 8️⃣ Revisão

| Conceito                | Ferramenta     | Resultado                      |
| ------------------------| -------------- | ------------------------------ |
| Containerização         | Docker         | Aplicação isolada e portátil   |
| Reverse Proxy           | Nginx          | Roteamento e acesso web        |
| Integração Contínua(CI) | Jenkins        | Build e teste automatizado     |
| Entrega Contínua(CD)    | Docker Compose | Deploy local automatizado      |

---

