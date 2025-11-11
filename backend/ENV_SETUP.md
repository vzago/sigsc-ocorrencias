# Configuração do Ambiente

Copie este arquivo para `.env` e configure as variáveis de ambiente:

```env
NODE_ENV=development
PORT=3000

# Firebase Configuration
# Opção 1: Caminho para arquivo JSON (RECOMENDADO - mais seguro e fácil)
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json

# Opção 2: Service Account JSON direto no .env (pode ter problemas com quebras de linha)
# FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Opção 3: Project ID (Para desenvolvimento com emulador Firebase)
# FIREBASE_PROJECT_ID=seu-project-id

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

## Onde conseguir as credenciais do Firebase

### Opção 1: Arquivo JSON (RECOMENDADO - Mais Seguro)

Esta é a forma mais fácil e segura de configurar:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto (ou crie um novo se necessário)
3. Clique no ícone de engrenagem (⚙️) ao lado de "Project Overview"
4. Selecione "Project settings"
5. Vá para a aba "Service accounts"
6. Clique em "Generate new private key"
7. Uma janela de confirmação aparecerá - clique em "Generate key"
8. Um arquivo JSON será baixado automaticamente
9. **Copie o arquivo JSON para a pasta `backend/`**
10. **Renomeie o arquivo para `firebase-service-account.json`**
11. No arquivo `.env`, configure apenas:
    ```env
    FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
    ```

**Importante:** 
- O arquivo `firebase-service-account.json` já está no `.gitignore` e não será commitado
- Mantenha este arquivo seguro e nunca o commite no Git!

### Opção 2: JSON direto no .env (Não recomendado)

Se preferir colocar o JSON diretamente no `.env`, você precisa converter para uma única linha (sem quebras de linha reais). Isso pode causar problemas de parsing.

### Opção 3: Project ID (Para desenvolvimento com emulador)

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. O Project ID aparece no topo da página ou nas configurações do projeto
4. Copie o Project ID e cole na variável `FIREBASE_PROJECT_ID` no arquivo `.env`

**Nota:** Esta opção funciona apenas se você estiver usando o Firebase Emulator Suite localmente.

## Instruções de Instalação

1. Instale as dependências:
```bash
cd backend
npm install
```

2. Configure o arquivo `.env`:
   - Copie `.env.example` para `.env` (se existir)
   - Ou crie um novo arquivo `.env` na pasta `backend/`
   - Adicione as variáveis de ambiente conforme descrito acima

3. Configure o Firebase:
   - Se usar Service Account: adicione o JSON completo na variável `FIREBASE_SERVICE_ACCOUNT`
   - Se usar Project ID: adicione apenas o ID do projeto na variável `FIREBASE_PROJECT_ID`

4. Execute a aplicação:
```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`

## Criando o primeiro usuário

Para criar o primeiro usuário no sistema, você tem algumas opções:

### Opção 1: Via API (temporariamente remover autenticação)

1. Remova temporariamente o `@UseGuards(JwtAuthGuard)` do endpoint `POST /users` em `users.controller.ts`
2. Faça uma requisição POST para `http://localhost:3000/users` com:
```json
{
  "username": "admin",
  "name": "Administrador",
  "email": "admin@example.com",
  "password": "senha123"
}
```
3. Restaure o guard de autenticação após criar o primeiro usuário

### Opção 2: Via Firebase Console

1. Acesse o Firestore no Firebase Console
2. Crie uma nova coleção chamada `users`
3. Adicione um documento com os campos:
   - `username`: string
   - `name`: string
   - `email`: string
   - `password`: hash bcrypt da senha (use uma ferramenta online ou script)
   - `active`: boolean (true)
   - `createdAt`: timestamp
   - `updatedAt`: timestamp

### Opção 3: Criar endpoint público temporário

Crie um endpoint específico para registro inicial que não requer autenticação.

## Estrutura do Firestore

O sistema criará automaticamente as seguintes coleções quando você começar a usar:

- **users**: Usuários do sistema
- **occurrences**: Ocorrências registradas

As coleções são criadas automaticamente quando você insere o primeiro documento.
