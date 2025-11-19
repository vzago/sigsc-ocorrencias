import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Função para decodificar Base64 (caso venha encodado)
const getCredentials = () => {
  // 1. Se tiver a variável com o JSON direto em Base64 (Configuração do Render)
  if (process.env.FIREBASE_CREDENTIALS_BASE64) {
    const buffer = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64');
    return JSON.parse(buffer.toString()) as ServiceAccount;
  }

  // 2. Fallback para desenvolvimento local (lendo arquivo)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require('../../firebase-service-account.json'); // ajuste seu caminho
    return serviceAccount;
  } catch (error) {
    console.error('Não foi possível carregar as credenciais do Firebase.', error);
    return null;
  }
};

const adminConfig: admin.ServiceAccount = getCredentials();

if (adminConfig) {
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
  });
}