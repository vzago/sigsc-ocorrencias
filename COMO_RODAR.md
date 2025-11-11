# Como rodar o projeto completo

## Pré-requisitos

- Node.js instalado (versão 18 ou superior)
- Firebase configurado com Service Account JSON no `.env` do backend

## Passo a passo

### 1. Rodar o Backend

Abra um terminal e execute:

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências (se ainda não instalou)
npm install

# Inicie o servidor backend
npm run start:dev
```

O backend estará rodando em `http://localhost:3000`

**Importante:** Mantenha este terminal aberto enquanto desenvolve.

### 2. Rodar o Frontend

Abra um **novo terminal** (deixe o backend rodando) e execute:

```bash
# Na raiz do projeto (volte se estiver na pasta backend)
cd ..

# Instale as dependências (se ainda não instalou)
npm install

# Inicie o servidor frontend
npm run dev
```

O frontend estará rodando em `http://localhost:5173` (ou na porta configurada no vite.config.ts)

### 3. Criar o primeiro usuário

Antes de fazer login, você precisa criar um usuário. Você tem duas opções:

#### Opção A: Via API (temporariamente remover autenticação)

1. Abra o arquivo `backend/src/users/users.controller.ts`
2. Comente temporariamente a linha `@UseGuards(JwtAuthGuard)` do método `create`:
```typescript
// @UseGuards(JwtAuthGuard)
@Post()
create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

3. Faça uma requisição POST para `http://localhost:3000/users` usando Postman, Insomnia ou curl:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "name": "Administrador",
    "email": "admin@example.com",
    "password": "senha123"
  }'
```

4. Restaure o guard de autenticação após criar o usuário

#### Opção B: Via Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Vá para Firestore Database
3. Crie uma coleção chamada `users`
4. Adicione um documento com os campos:
   - `username`: "admin"
   - `name`: "Administrador"
   - `email`: "admin@example.com"
   - `password`: (hash bcrypt - use uma ferramenta online como https://bcrypt-generator.com/)
   - `active`: true
   - `createdAt`: timestamp atual
   - `updatedAt`: timestamp atual

### 4. Testar a integração

1. Acesse `http://localhost:5173` no navegador
2. Faça login com as credenciais criadas
3. Teste criar uma nova ocorrência
4. Verifique se os dados aparecem no Firebase Console

## Variáveis de Ambiente do Frontend

O frontend está configurado para usar `http://localhost:3000` como URL padrão da API.

Se precisar alterar, crie um arquivo `.env` na raiz do projeto com:

```env
VITE_API_URL=http://localhost:3000
```

## Verificando se está funcionando

- Backend rodando: Acesse `http://localhost:3000` e você deve ver um erro 404 (normal, significa que o servidor está rodando)
- Frontend rodando: Acesse `http://localhost:5173` e você deve ver a tela de login
- Integração funcionando: Após fazer login, você deve conseguir criar e listar ocorrências

## Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL=http://localhost:5173` está no `.env` do backend
- Verifique se a porta do frontend está correta

### Erro de conexão com API
- Verifique se o backend está rodando na porta 3000
- Verifique se a variável `VITE_API_URL` está configurada corretamente (ou use o padrão)

### Erro de autenticação
- Verifique se criou um usuário no banco de dados
- Verifique se o token está sendo salvo no localStorage (F12 > Application > Local Storage)

