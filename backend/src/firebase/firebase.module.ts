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
        if (!admin.apps.length) {
          const serviceAccountPath = configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
          const serviceAccount = configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
          
          let serviceAccountJson: any = null;

          if (serviceAccountPath) {
            const filePath = path.resolve(process.cwd(), serviceAccountPath);
            if (fs.existsSync(filePath)) {
              const fileContent = fs.readFileSync(filePath, 'utf8');
              serviceAccountJson = JSON.parse(fileContent);
            } else {
              throw new Error(`Arquivo de service account não encontrado em: ${filePath}`);
            }
          } else if (serviceAccount) {
            try {
              serviceAccountJson = JSON.parse(serviceAccount);
            } catch (error) {
              throw new Error('Erro ao fazer parse do FIREBASE_SERVICE_ACCOUNT. Verifique se o JSON está correto.');
            }
          }

          if (serviceAccountJson) {
            admin.initializeApp({
              credential: admin.credential.cert(serviceAccountJson),
            });
          } else {
            const projectId = configService.get<string>('FIREBASE_PROJECT_ID');
            if (projectId) {
              admin.initializeApp({
                projectId,
              });
            } else {
              throw new Error('Configuração do Firebase não encontrada. Configure FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_PATH ou FIREBASE_PROJECT_ID');
            }
          }
        }
        return admin;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}

