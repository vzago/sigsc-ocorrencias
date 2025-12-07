# SIGSC - Sistema de Gestão de Ocorrências

Bem-vindo ao **SIGSC - Ocorrências**, uma aplicação desenvolvida para facilitar o registro e a gestão de ocorrências. Este sistema permite que usuários reportem incidentes, acompanhem o status e permitam que administradores gerenciem as ocorrências de forma eficiente.

## 📁 Estrutura do Projeto (Monorepo)

Este projeto segue uma estrutura de monorepo simplificada, contendo tanto o código do Frontend quanto do Backend no mesmo repositório.

- **Raiz (`/`)**: Contém o código do **Frontend**.
  - Desenvolvido com **React**, **Vite**, **TypeScript**, **Tailwind CSS** e **Shadcn UI**.
  - O código fonte do frontend está na pasta `./src`.

- **Backend (`/backend`)**: Contém o código da **API**.
  - Desenvolvido com **NestJS**.
  - Responsável pela lógica de negócios, autenticação e integração com o **Firebase** (Firestore/Auth).

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar a aplicação localmente.

### Pré-requisitos
- **Node.js**: Versão 18 ou superior.
- **Service Account do Firebase**: Para o backend funcionar corretamente, você precisará configurar as credenciais do Firebase.

### 1. Configurando e Rodando o Backend

O backend deve ser iniciado primeiro para garantir que a API esteja disponível para o frontend.

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `backend`.
   - Adicione as configurações do Firebase (exemplo de chaves necessárias):
     ```env
     # Exemplo de variáveis (NÃO USE ESTES VALORES REAIS)
     FIREBASE_PROJECT_ID=seu-project-id
     FIREBASE_CLIENT_EMAIL=seu-email-service-account
     FIREBASE_PRIVATE_KEY="sua-private-key"
     ```

4. Inicie o servidor:
   ```bash
   npm run start:dev
   ```
   > O servidor iniciará por padrão em `http://localhost:3000`.

### 2. Configurando e Rodando o Frontend

Abra um novo terminal na **raiz do projeto** para rodar o frontend.

1. Instale as dependências:
   ```bash
   npm install
   ```

2. (Opcional) Configure as variáveis de ambiente:
   - O frontend espera que o backend esteja na porta 3000 por padrão.
   - Caso precise alterar, crie um arquivo `.env` na raiz:
     ```env
     VITE_API_URL=http://localhost:3000
     ```

3. Inicie a aplicação:
   ```bash
   npm run dev
   ```
   > A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## 👥 Créditos

Este projeto foi desenvolvido pelos seguintes alunos:

- **Arthur Moreira Correa**
- **Eduardo Ribeiro Rodrigues**
- **Murilo Genghi Rossi**
- **Vinicius Moraes de Paiva**
- **Vitor Zago**
