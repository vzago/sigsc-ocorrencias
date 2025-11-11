import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OccurrencesModule } from './occurrences/occurrences.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirebaseModule,
    OccurrencesModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}

