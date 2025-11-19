import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        // Evita iniciar duas vezes se o módulo for carregado novamente
        if (admin.apps.length) {
          return admin.app();
        }

        let serviceAccountJson: any = null;

        // 1. TENTA LER VARIÁVEL DE PRODUÇÃO (RENDER - BASE64)
        const base64Credentials = configService.get<string>('FIREBASE_CREDENTIALS_BASE64');
        
        // 2. TENTA LER VARIÁVEL LOCAL (ARQUIVO JSON)
        // Nota: No seu .env o nome é FIREBASE_SERVICE_ACCOUNT_PATH, ajustei aqui
        const serviceAccountPath = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

        // --- LÓGICA DE DECISÃO ---
        
        if (base64Credentials) {
          // CENÁRIO 1: Estamos no Render (tem base64)
          try {
            const buffer = Buffer.from(base64Credentials, 'base64');
            serviceAccountJson = JSON.parse(buffer.toString());
            console.log('✅ [Firebase] Credenciais carregadas via Base64');
          } catch (error) {
            console.error('❌ [Firebase] Erro ao decodificar Base64:', error);
          }
        } else if (serviceAccountPath) {
          // CENÁRIO 2: Estamos Local (tem caminho do arquivo)
          const filePath = path.resolve(process.cwd(), serviceAccountPath);
          if (fs.existsSync(filePath)) {
            try {
              const fileContent = fs.readFileSync(filePath, 'utf8');
              serviceAccountJson = JSON.parse(fileContent);
              console.log('✅ [Firebase] Credenciais carregadas via Arquivo Local');
            } catch (error) {
               console.error('❌ [Firebase] Erro ao ler arquivo JSON local:', error);
            }
          } else {
            console.warn(`⚠️ [Firebase] Arquivo não encontrado no caminho: ${filePath}`);
          }
        }

        // --- INICIALIZAÇÃO ---

        if (serviceAccountJson) {
          return admin.initializeApp({
            credential: admin.credential.cert(serviceAccountJson),
          });
        } else {
           // Fallback final: Tentar usar projectId se não achou credenciais (para emuladores ou Google Cloud nativo)
           const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
           if (projectId) {
              return admin.initializeApp({ projectId });
           }
           
           throw new Error('FATAL: Nenhuma credencial do Firebase encontrada (Nem Base64, nem Arquivo). Verifique as variáveis de ambiente.');
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}