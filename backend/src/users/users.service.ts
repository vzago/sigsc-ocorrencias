import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private collection: CollectionReference;

  constructor(private firebaseService: FirebaseService) {
    this.collection = this.firebaseService.getFirestore().collection('users');
  }

  private toUser(doc: DocumentSnapshot): User {
    const data = doc.data();
    if (!data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const user: User = {
      id: doc.id,
      username: data.username,
      name: data.name,
      email: data.email,
      active: data.active ?? true,
      createdAt: data.createdAt?.toDate() || data.createdAt,
      updatedAt: data.updatedAt?.toDate() || data.updatedAt,
    };

    return user;
  }

  private toUserWithPassword(doc: DocumentSnapshot): User {
    const data = doc.data();
    if (!data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || data.createdAt,
      updatedAt: data.updatedAt?.toDate() || data.updatedAt,
    } as User;
  }

  async create(createUserDto: CreateUserDto) {
    const usernameSnapshot = await this.collection
      .where('username', '==', createUserDto.username)
      .limit(1)
      .get();

    const emailSnapshot = await this.collection
      .where('email', '==', createUserDto.email)
      .limit(1)
      .get();

    if (!usernameSnapshot.empty || !emailSnapshot.empty) {
      throw new ConflictException('Usuário ou email já existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const now = new Date();

    const userData = {
      username: createUserDto.username,
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      active: createUserDto.active ?? true,
      createdAt: this.firebaseService
        .getFirestore()
        .Timestamp.fromDate(now),
      updatedAt: this.firebaseService
        .getFirestore()
        .Timestamp.fromDate(now),
    };

    const docRef = await this.collection.add(userData);
    return this.findOne(docRef.id);
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.toUser(doc));
  }

  async findOne(id: string): Promise<User> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return this.toUser(doc);
  }

  async findByUsername(username: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('username', '==', username)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return this.toUserWithPassword(snapshot.docs[0]);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const updateData: any = {
      updatedAt: this.firebaseService
        .getFirestore()
        .Timestamp.fromDate(new Date()),
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.username !== undefined) {
      updateData.username = updateUserDto.username;
    }

    if (updateUserDto.name !== undefined) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email !== undefined) {
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.active !== undefined) {
      updateData.active = updateUserDto.active;
    }

    await this.collection.doc(id).update(updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.collection.doc(id).delete();
    return { message: 'Usuário removido com sucesso' };
  }
}
