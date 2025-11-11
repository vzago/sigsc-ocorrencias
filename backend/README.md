# SIGSC Ocorrências - Backend

Backend do Sistema de Gestão de Ocorrências desenvolvido com NestJS e Firebase Firestore.

## Tecnologias

- NestJS
- Firebase Admin SDK (Firestore)
- JWT Authentication
- TypeScript

## Instalação

```bash
npm install
```

## Configuração do Firebase

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:

### Opção 1: Usar Service Account (Recomendado para Produção)

Baixe o arquivo JSON da Service Account do Firebase Console e cole o conteúdo completo na variável `FIREBASE_SERVICE_ACCOUNT`:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"seu-projeto",...}
```

### Opção 2: Usar Project ID (Para desenvolvimento com emulador)

```env
FIREBASE_PROJECT_ID=seu-project-id
```

3. Configure as outras variáveis:
- `JWT_SECRET`: Chave secreta para JWT (altere em produção)
- `FRONTEND_URL`: URL do frontend para CORS

## Executando a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## Estrutura do Projeto

```
src/
├── firebase/          # Módulo de configuração do Firebase
├── auth/              # Módulo de autenticação
├── users/             # Módulo de usuários
├── occurrences/       # Módulo de ocorrências
│   ├── interfaces/   # Interfaces TypeScript
│   ├── dto/           # Data Transfer Objects
│   ├── occurrences.controller.ts
│   ├── occurrences.service.ts
│   └── occurrences.module.ts
└── main.ts            # Arquivo principal
```

## Banco de Dados - Firestore

O sistema utiliza Firebase Firestore como banco de dados NoSQL. As coleções são criadas automaticamente quando os dados são inseridos.

### Coleções

- **occurrences**: Ocorrências principais
- **users**: Usuários do sistema

### Estrutura de Dados

As ocorrências são armazenadas como documentos na coleção `occurrences` com a seguinte estrutura:
- Dados principais da ocorrência
- `location`: Objeto com dados de localização
- `actions`: Array de ações/providências
- `resources`: Array de recursos utilizados

## Endpoints Principais

### Autenticação
- `POST /auth/login` - Login de usuário

### Ocorrências
- `GET /occurrences` - Listar ocorrências (com filtros opcionais)
- `GET /occurrences/:id` - Buscar ocorrência por ID
- `GET /occurrences/ra/:raNumber` - Buscar ocorrência por R.A.
- `POST /occurrences` - Criar nova ocorrência
- `PATCH /occurrences/:id` - Atualizar ocorrência
- `DELETE /occurrences/:id` - Remover ocorrência

### Usuários
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar novo usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Remover usuário

## Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação. Para acessar os endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <token>
```

## Filtros de Busca

Os filtros de busca nas ocorrências são aplicados em memória após a consulta ao Firestore, devido às limitações de índices compostos. Para melhor performance, considere criar índices compostos no Firebase Console quando necessário.


