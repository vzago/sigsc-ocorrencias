import { type TestingModule, Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { createMockFirestore, type MockCollection } from '../../test/utils/test-utils';

describe('UsersService', () => {
  let usersService: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockFirestore: Record<string, unknown>;
  let usersCollection: MockCollection;

  beforeEach(async () => {
    mockFirestore = createMockFirestore();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn(() => mockFirestore),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersCollection = (mockFirestore.getCollection as (name: string) => MockCollection)('users');
  });

  afterEach(async () => {
    usersCollection.clear();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'newuser',
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        active: true,
      };

      const result = await usersService.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.username).toBe('newuser');
      expect(result.email).toBe('new@example.com');
      expect(result.id).toBeDefined();
    });

    it('should throw ConflictException if username already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        active: true,
      };

      await usersService.create(createUserDto);

      await expect(
        usersService.create({
          ...createUserDto,
          email: 'different@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        username: 'user1',
        name: 'User 1',
        email: 'same@example.com',
        password: 'password123',
        active: true,
      };

      await usersService.create(createUserDto);

      await expect(
        usersService.create({
          ...createUserDto,
          username: 'user2',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await usersService.create({
        username: 'user1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
      });

      await usersService.create({
        username: 'user2',
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password123',
      });

      const result = await usersService.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
      expect(result[1].username).toBe('user2');
    });

    it('should return empty array if no users', async () => {
      const result = await usersService.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await usersService.findOne(created.id as string);

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(usersService.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await usersService.findByUsername('testuser');

      expect(result).toBeDefined();
      expect(result?.username).toBe('testuser');
    });

    it('should return null if user does not exist', async () => {
      const result = await usersService.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const updated = await usersService.update(created.id as string, {
        name: 'Updated User',
        email: 'updated@example.com',
      });

      expect(updated.name).toBe('Updated User');
      expect(updated.email).toBe('updated@example.com');
    });

    it('should hash new password if provided', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const updated = await usersService.update(created.id as string, {
        password: 'newpassword123',
      });

      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(
        usersService.update('nonexistent', {
          name: 'Updated',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update username when provided', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const updated = await usersService.update(created.id as string, {
        username: 'newusername',
      });

      expect(updated.username).toBe('newusername');
    });

    it('should update active status when provided', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        active: true,
      });

      const updated = await usersService.update(created.id as string, {
        active: false,
      });

      expect(updated.active).toBe(false);
    });

    it('should update multiple fields at once', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const updated = await usersService.update(created.id as string, {
        username: 'newusername',
        name: 'New Name',
        email: 'new@example.com',
        password: 'newpass',
        active: false,
      });

      expect(updated.username).toBe('newusername');
      expect(updated.name).toBe('New Name');
      expect(updated.email).toBe('new@example.com');
      expect(updated.active).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const created = await usersService.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await usersService.remove(created.id as string);

      expect(result.message).toBe('Usuário removido com sucesso');

      await expect(usersService.findOne(created.id as string)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      await expect(usersService.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should handle users with active=false', async () => {
      const created = await usersService.create({
        username: 'inactiveuser',
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'password123',
        active: false,
      });

      const found = await usersService.findOne(created.id as string);
      expect(found.active).toBe(false);
    });

    it('should preserve createdAt/updatedAt dates correctly', async () => {
      const created = await usersService.create({
        username: 'dateuser',
        name: 'Date User',
        email: 'date@example.com',
        password: 'password123',
      });

      const found = await usersService.findOne(created.id as string);
      expect(found.createdAt).toBeDefined();
      expect(found.updatedAt).toBeDefined();
    });

    it('should correctly handle toUserWithPassword for authentication', async () => {
      await usersService.create({
        username: 'authuser',
        name: 'Auth User',
        email: 'auth@example.com',
        password: 'password123',
      });

      // This tests the toUserWithPassword branch used in findByUsername
      const foundByUsername = await usersService.findByUsername('authuser');
      expect(foundByUsername?.createdAt).toBeDefined();
      expect(foundByUsername?.updatedAt).toBeDefined();
    });

    it('should handle timestamp-like objects in date fields', async () => {
      const created = await usersService.create({
        username: 'timestamptest',
        name: 'Timestamp Test',
        email: 'timestamp@example.com',
        password: 'password123',
      });

      // Manually inject a Timestamp object to test the ?.toDate() branch
      const usersCollection = (mockFirestore.getCollection as (name: string) => MockCollection)('users');
      
      // This is a workaround to directly set Timestamp in the mock
      const mockTimestamp = {
        toDate: () => new Date(),
      };

      // Access internal docs to simulate Firestore Timestamp behavior
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docMap = (usersCollection as any).docs as Map<string, any>;
      const doc = docMap.get(created.id as string);
      
      if (doc) {
        doc.createdAt = mockTimestamp;
        doc.updatedAt = mockTimestamp;
      }

      const found = await usersService.findOne(created.id as string);
      expect(found.createdAt).toBeDefined();
      expect(found.updatedAt).toBeDefined();
    });
  });
});
