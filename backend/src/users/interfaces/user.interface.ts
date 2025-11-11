import * as admin from 'firebase-admin/firestore';

export interface User {
  id?: string;
  username: string;
  name: string;
  email: string;
  password?: string;
  active: boolean;
  createdAt?: Date | admin.Timestamp;
  updatedAt?: Date | admin.Timestamp;
}

