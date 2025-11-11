import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseModule } from './firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseCoreModule {}

