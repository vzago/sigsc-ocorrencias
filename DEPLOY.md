# Guia de Deploy - SIGSC Ocorrências

Este guia explica como fazer o deploy completo da aplicação (Frontend + Backend) usando Firebase Hosting para o frontend e um serviço gratuito para o backend NestJS.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Backend NestJS](#deploy-do-backend-nestjs)
3. [Deploy do Frontend no Firebase Hosting](#deploy-do-frontend-no-firebase-hosting)
4. [Configuração Final](#configuração-final)

---

## Pré-requisitos

- Conta no Firebase (plano gratuito)
- Conta em um serviço de hospedagem para Node.js (Render, Railway, ou Vercel)
- Node.js instalado localmente
- Firebase CLI instalado (`npm install -g firebase-tools`)

---

## 1. Deploy do Backend NestJS

O Firebase Hosting **não suporta** aplicações Node.js, então precisamos hospedar o backend em outro serviço. Recomendamos **Render** (plano gratuito).

### Opção A: Render (Recomendado - Gratuito)

#### Passo 1: Preparar o Backend

1. No diretório `backend`, crie um arquivo `.env` com suas variáveis de ambiente:

```bash
cd backend
```

Crie o arquivo `.env`:
```env
PORT=3000
FRONTEND_URL=https://seu-projeto.firebaseapp.com
JWT_SECRET=sua-chave-secreta-super-segura-aqui
NODE_ENV=production
```

**Importante:** Não commite o arquivo `.env` no Git!

#### Passo 2: Criar arquivo para Render

Crie o arquivo `backend/render.yaml`:

```yaml
services:
  - type: web
    name: sigsc-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
      - key: FRONTEND_URL
        sync: false
      - key: JWT_SECRET
        sync: false
```

#### Passo 3: Deploy no Render

1. Acesse [render.com](https://render.com) e crie uma conta (gratuita)
2. Conecte seu repositório GitHub/GitLab
3. Clique em "New" → "Web Service"
4. Configure:
   - **Name:** sigsc-backend
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm run start:prod`
   - **Root Directory:** deixe vazio (ou `backend` se necessário)
5. Adicione as variáveis de ambiente:
   - `PORT` = `3000`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = URL do seu Firebase Hosting (será configurada depois)
   - `JWT_SECRET` = uma string aleatória segura
6. Clique em "Create Web Service"
7. Aguarde o deploy (pode levar alguns minutos)
8. **Copie a URL do serviço** (ex: `https://sigsc-backend.onrender.com`)

#### Passo 4: Configurar CORS no Backend

O arquivo `backend/src/main.ts` já está configurado para aceitar CORS. Certifique-se de que a variável `FRONTEND_URL` está configurada corretamente no Render.

---

### Opção B: Railway (Alternativa Gratuita)

1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório
3. Crie um novo projeto
4. Adicione um serviço "Node.js"
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
6. Adicione as variáveis de ambiente
7. Deploy automático!

---

### Opção C: Vercel (Alternativa)

1. Instale Vercel CLI: `npm i -g vercel`
2. No diretório `backend`, execute: `vercel`
3. Siga as instruções
4. Configure as variáveis de ambiente no dashboard da Vercel

---

## 2. Deploy do Frontend no Firebase Hosting

### Passo 1: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.production` na raiz do projeto:

```env
VITE_API_URL=https://sigsc-backend.onrender.com
```

**Substitua** `https://sigsc-backend.onrender.com` pela URL do seu backend deployado.

### Passo 2: Build do Frontend

```bash
npm run build
```

Isso criará a pasta `dist` com os arquivos otimizados.

### Passo 3: Configurar Firebase

1. Faça login no Firebase:
```bash
firebase login
```

2. Inicialize o projeto (se ainda não fez):
```bash
firebase init
```

Selecione:
- ✅ Hosting
- Use um projeto existente ou crie um novo
- **Public directory:** `dist`
- **Single-page app:** `Yes`
- **Overwrite index.html:** `No`

### Passo 4: Deploy

```bash
firebase deploy --only hosting
```

### Passo 5: Atualizar URL do Backend

Após o deploy do frontend, você receberá uma URL como:
`https://seu-projeto.web.app` ou `https://seu-projeto.firebaseapp.com`

**Importante:** Volte ao Render e atualize a variável `FRONTEND_URL` com essa URL.

---

## 3. Configuração Final

### Atualizar CORS no Backend

1. No dashboard do Render, vá em "Environment"
2. Atualize `FRONTEND_URL` com a URL do Firebase Hosting
3. Reinicie o serviço

### Verificar Funcionamento

1. Acesse a URL do Firebase Hosting
2. Teste o login
3. Verifique se as requisições estão funcionando (abra o DevTools → Network)

---

## 4. Scripts Úteis

Adicione estes scripts ao `package.json` da raiz:

```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

---

## Troubleshooting

### Erro de CORS

- Verifique se `FRONTEND_URL` no backend está correto
- Verifique se a URL do backend no `.env.production` está correta
- Certifique-se de que o backend está rodando

### Erro 404 no Frontend

- Verifique se o `firebase.json` está configurado corretamente
- Certifique-se de que o build foi feito antes do deploy

### Backend não inicia

- Verifique os logs no Render
- Certifique-se de que todas as variáveis de ambiente estão configuradas
- Verifique se o arquivo `firebase-service-account.json` está presente (se necessário)

---

## Estrutura de Arquivos Importantes

```
projeto/
├── backend/
│   ├── .env                    # Variáveis de ambiente (NÃO commitar)
│   ├── render.yaml             # Configuração do Render
│   └── src/
│       └── main.ts             # Configuração CORS
├── .env.production            # Variáveis do frontend (NÃO commitar)
├── firebase.json              # Configuração Firebase Hosting
└── vite.config.ts             # Configuração Vite
```

---

## Próximos Passos

- Configure um domínio customizado no Firebase Hosting (opcional)
- Configure CI/CD para deploy automático
- Adicione monitoramento e logs

---

## Suporte

Se encontrar problemas, verifique:
1. Logs do backend no Render
2. Console do navegador (F12)
3. Network tab no DevTools



