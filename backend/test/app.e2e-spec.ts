import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/firebase/firebase.service';
import { createMockFirestore, MockCollection } from './utils/test-utils';
import { OccurrenceCategory } from '../src/occurrences/interfaces/occurrence.interface';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let mockFirestore: Record<string, unknown>;
    let usersCollection: MockCollection;
    let occurrencesCollection: MockCollection;
    let authToken: string;
    let adminToken: string;
    let adminUserId: string;

    beforeAll(async () => {
        mockFirestore = createMockFirestore();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(FirebaseService)
            .useValue({
                getFirestore: jest.fn(() => mockFirestore),
            })
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();

        // Setup collections
        usersCollection = (mockFirestore.getCollection as any)('users');
        occurrencesCollection = (mockFirestore.getCollection as any)('occurrences');

        // Create Admin User for Auth Tests
        const hashedPassword = await bcrypt.hash('senha123', 10);
        const adminDoc = await usersCollection.add({
            username: 'admin',
            email: 'admin@sigsc.com',
            password: hashedPassword,
            active: true,
            name: 'Admin User'
        });
        adminUserId = adminDoc.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Auth Module', () => {
        it('/auth/login (POST) - should login successfully with valid credentials', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'admin', password: 'senha123' })
                .expect(200);

            expect(response.body).toHaveProperty('access_token');
            expect(response.body.user.username).toBe('admin');
            adminToken = response.body.access_token;
            authToken = adminToken; // Use admin token for subsequent tests
        });

        it('/auth/login (POST) - should fail with invalid credentials', () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ username: 'admin', password: 'wrongpassword' })
                .expect(401);
        });

        it('/auth/me (GET) - should return current user profile', () => {
            return request(app.getHttpServer())
                .get('/auth/me')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.username).toBe('admin');
                    expect(res.body.id).toBe(adminUserId);
                });
        });
    });

    describe('Users Module', () => {
        let createdUserId: string;

        it('/users (POST) - should create a new user', async () => {
            const res = await request(app.getHttpServer())
                .post('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    username: 'newuser',
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'password123',
                    active: true
                })
                .expect(201);

            createdUserId = res.body.id;
            expect(createdUserId).toBeDefined();
            expect(res.body.username).toBe('newuser');
        });

        it('/users (GET) - should list users', () => {
            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBe(true);
                    const user = res.body.find(u => u.username === 'newuser');
                    expect(user).toBeDefined();
                });
        });

        it('/users/:id (GET) - should get user by id', () => {
            return request(app.getHttpServer())
                .get(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(createdUserId);
                    expect(res.body.username).toBe('newuser');
                });
        });

        it('/users/:id (PATCH) - should update user', () => {
            return request(app.getHttpServer())
                .patch(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated Name' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.name).toBe('Updated Name');
                });
        });

        it('/users/:id (DELETE) - should delete user', () => {
            return request(app.getHttpServer())
                .delete(`/users/${createdUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    describe('Occurrences Module', () => {
        let occurrenceId: string;
        let raNumber: string;

        it('/occurrences (POST) - should create an occurrence', async () => {
            const res = await request(app.getHttpServer())
                .post('/occurrences')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    category: OccurrenceCategory.VISTORIA_AMBIENTAL,
                    description: 'E2E Full Test',
                    requesterName: 'Tester',
                    startDateTime: new Date().toISOString(),
                    location: {
                        address: 'Test Address',
                        latitude: -22.0,
                        longitude: -47.0
                    }
                })
                .expect(201);

            occurrenceId = res.body.id;
            raNumber = res.body.raNumber;
            expect(occurrenceId).toBeDefined();
            expect(raNumber).toBeDefined();
        });

        it('/occurrences (GET) - should list occurrences', () => {
            return request(app.getHttpServer())
                .get('/occurrences')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body.data)).toBe(true);
                    expect(res.body.data.length).toBeGreaterThan(0);
                });
        });

        it('/occurrences/:id (GET) - should get occurrence by id', () => {
            return request(app.getHttpServer())
                .get(`/occurrences/${occurrenceId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(occurrenceId);
                });
        });

        it('/occurrences/ra/:raNumber (GET) - should get occurrence by RA', () => {
            return request(app.getHttpServer())
                .get(`/occurrences/ra/${raNumber}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.raNumber).toBe(raNumber);
                });
        });

        it('/occurrences/:id (PATCH) - should update occurrence', () => {
            return request(app.getHttpServer())
                .patch(`/occurrences/${occurrenceId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ description: 'Updated Description' })
                .expect(200)
                .expect((res) => {
                    expect(res.body.description).toBe('Updated Description');
                });
        });

        it('/occurrences/:id (DELETE) - should delete occurrence', () => {
            return request(app.getHttpServer())
                .delete(`/occurrences/${occurrenceId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });
});
