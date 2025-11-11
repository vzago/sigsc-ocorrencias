import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService {
  private firestore: Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: admin.app.App) {
    this.firestore = this.firebaseAdmin.firestore();
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return this.firebaseAdmin.auth();
  }
}

