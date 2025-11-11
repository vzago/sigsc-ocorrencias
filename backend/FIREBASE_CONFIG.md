# Configuração do Firebase - Método Recomendado

## Opção 1: Usar arquivo JSON (RECOMENDADO)

Esta é a forma mais segura e fácil de configurar:

1. Coloque o arquivo JSON da service account na pasta `backend/`
2. Renomeie o arquivo para `firebase-service-account.json` (ou outro nome de sua preferência)
3. No arquivo `.env`, configure apenas o caminho:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
```

**Importante:** Adicione `firebase-service-account.json` ao `.gitignore` para não commitar suas credenciais!

## Opção 2: JSON direto no .env (não recomendado)

Se preferir colocar o JSON diretamente no `.env`, você precisa:

1. Converter o JSON para uma única linha (sem quebras de linha)
2. Escapar as aspas duplas corretamente
3. Colocar tudo em uma única linha

**Problema:** O JSON que você mostrou tem quebras de linha (`\n`) na `private_key`, o que pode causar problemas.

### Como converter para uma linha:

Você pode usar uma ferramenta online ou fazer manualmente:

1. Remova todas as quebras de linha
2. Mantenha os `\n` na `private_key` como estão (eles são parte do conteúdo)
3. Coloque tudo em uma única linha

Exemplo (formato correto):
```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"sig-dc","private_key_id":"9f844915ccac1eb10987e5123abf62b43e24b3df","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCTm5oa2r02iMXh\n...","client_email":"firebase-adminsdk-fbsvc@sig-dc.iam.gserviceaccount.com",...}
```

## Opção 3: Project ID (apenas para emulador)

Se estiver usando o Firebase Emulator localmente:

```env
FIREBASE_PROJECT_ID=sig-dc
```

## Recomendação

**Use a Opção 1** (arquivo JSON separado). É mais seguro, mais fácil de manter e evita problemas de parsing.

### Passos rápidos:

1. Copie o conteúdo JSON que você mostrou
2. Salve em um arquivo chamado `firebase-service-account.json` na pasta `backend/`
3. No `.env`, adicione apenas:
   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=firebase-service-account.json
   ```
4. Adicione ao `.gitignore`:
   ```
   firebase-service-account.json
   ```

Isso resolve os problemas de parsing e é mais seguro!

