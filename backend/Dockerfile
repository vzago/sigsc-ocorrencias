# --- Estágio 1: Build ---
  FROM node:20-alpine AS builder

  WORKDIR /usr/src/app
  
  # Copia package e package-lock (importante para garantir as versões exatas)
  COPY package*.json ./
  
  # Instala todas as dependências (incluindo devDependencies para o build rodar)
  RUN npm ci
  
  # Copia o resto do código fonte
  COPY . .
  
  # Builda o projeto (gera a pasta dist)
  RUN npm run build
  
  # --- Estágio 2: Produção ---
  FROM node:20-alpine
  
  WORKDIR /usr/src/app
  
  ENV NODE_ENV=production
  ENV PORT=8080
  
  # Copia apenas o package.json de novo para instalar só dependências de prod
  COPY package*.json ./
  
  # Instala APENAS dependências de produção (fica muito mais leve)
  RUN npm ci --omit=dev && npm cache clean --force
  
  # Copia a pasta dist gerada no estágio anterior
  COPY --from=builder /usr/src/app/dist ./dist

  RUN ls -R dist
  
  # Usuário node por segurança (boa prática em containers)
  USER node
  
  EXPOSE 8080
  
  CMD ["node", "dist/main.js"]