import { type TestingModule, Test } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password123', 10),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        password: await bcrypt.hash('password123', 10),
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findByUsername').mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info on successful login', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123');

      const result = await authService.login({ username: 'testuser', password: 'password123' });

      expect(result).toBeDefined();
      expect(result.access_token).toBe('token123');
      expect(result.user.username).toBe('testuser');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authService.login({ username: 'testuser', password: 'wrong' })).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    it('should include all user fields in response', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123');

      const result = await authService.login({ username: 'testuser', password: 'password123' });

      expect(result.user.id).toBe('1');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.name).toBe('Test User');
    });

    it('should call jwtService.sign with correct payload', async () => {
      const mockUser = {
        id: '123abc',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token123');

      await authService.login({ username: 'testuser', password: 'password123' });

      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser', sub: '123abc' });
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await authService.getProfile('1');

      expect(result).toBeDefined();
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('should call findOne with correct userId', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      await authService.getProfile('123');

      expect(usersService.findOne).toHaveBeenCalledWith('123');
    });

    it('should return only specific user fields', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await authService.getProfile('1');

      expect(result.id).toBe('1');
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(Object.keys(result)).toHaveLength(4);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error('User not found'));

      await expect(authService.getProfile('nonexistent')).rejects.toThrow();
    });
  });
});
