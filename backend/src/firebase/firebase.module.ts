import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        if (!admin.apps.length) {
          const serviceAccount = configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
          
          if (serviceAccount) {
            const serviceAccountJson = JSON.parse(serviceAccount);
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
              admin.initializeApp();
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

