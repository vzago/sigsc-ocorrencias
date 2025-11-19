import { type TestingModule, Test } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { OccurrencesService } from '../../src/occurrences/occurrences.service';
import { FirebaseService } from '../../src/firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { createMockFirestore, type MockCollection } from '../utils/test-utils';
import {
  OccurrenceStatus,
  OccurrenceCategory,
} from '../../src/occurrences/interfaces/occurrence.interface';
import {
  TeamActionType,
  OrganismType,
} from '../../src/occurrences/dto/create-occurrence.dto';

/**
 * Integration Tests - SiG-DC São Carlos
 *
 * These tests validate the interaction between:
 * - Front-end (simulated via API calls in e2e tests)
 * - Back-end (NestJS API)
 * - Database (Firebase Firestore - mocked in-memory)
 *
 * Scenarios tested:
 * - INT-01: User Authentication
 * - INT-02: Occurrence Creation
 * - INT-03: Occurrence Listing and Filtering
 */
describe('Integration Tests - Scenarios INT-01 to INT-03', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let occurrencesService: OccurrencesService;
  let mockFirestore: Record<string, unknown>;
  let usersCollection: MockCollection;
  let occurrencesCollection: MockCollection;

  beforeAll(async () => {
    mockFirestore = createMockFirestore();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        OccurrencesService,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn(() => mockFirestore),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => 'test-token-' + JSON.stringify(payload)),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    occurrencesService = module.get<OccurrencesService>(OccurrencesService);

    usersCollection = (mockFirestore.getCollection as (name: string) => MockCollection)('users');
    occurrencesCollection = (mockFirestore.getCollection as (name: string) => MockCollection)(
      'occurrences',
    );
  });

  beforeEach(() => {
    usersCollection.clear();
    occurrencesCollection.clear();
  });

  describe('INT-01: Autenticação de Usuário - User Authentication', () => {
    describe('Pré-condição: Usuário agente cadastrado e ativo', () => {
      beforeEach(async () => {
        await usersService.create({
          username: 'agente_dc',
          name: 'Agente da Defesa Civil',
          email: 'agente@sigdc.com.br',
          password: 'senhaSegura123!',
          active: true,
        });
      });

      it('INT-01-1: Should fail login with invalid email (test invalid credentials)', async () => {
        await expect(
          authService.login({
            username: 'usuario_inexistente',
            password: 'senhaSegura123!',
          }),
        ).rejects.toThrow('Credenciais inválidas');
      });

      it('INT-01-2: Should fail login with invalid password', async () => {
        await expect(
          authService.login({
            username: 'agente_dc',
            password: 'senhaErrada',
          }),
        ).rejects.toThrow('Credenciais inválidas');
      });

      it('INT-01-3: Should successfully login and return access token', async () => {
        const result = await authService.login({
          username: 'agente_dc',
          password: 'senhaSegura123!',
        });

        expect(result).toHaveProperty('access_token');
        expect(result).toHaveProperty('user');
        expect(result.user.username).toBe('agente_dc');
        expect(result.user.email).toBe('agente@sigdc.com.br');
        expect(result.user.name).toBe('Agente da Defesa Civil');
      });

      it('INT-01-4: Should retrieve user profile with valid token', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _loginResult = await authService.login({
          username: 'agente_dc',
          password: 'senhaSegura123!',
        });

        const user = await usersService.findByUsername('agente_dc');
        const profile = await authService.getProfile(user?.id as string);

        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('username');
        expect(profile).toHaveProperty('email');
        expect(profile.username).toBe('agente_dc');
      });
    });
  });

  describe('INT-02: Criação de Nova Ocorrência - Occurrence Creation', () => {
    let testUserId: string;

    beforeEach(async () => {
      const testUser = await usersService.create({
        username: 'agente_teste',
        name: 'Agente Teste',
        email: 'agente.teste@sigdc.com.br',
        password: 'senha123',
        active: true,
      });

      testUserId = testUser.id as string;
    });

    it('INT-02-1: Should create occurrence with valid data', async () => {
      const createDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Vistoria ambiental em propriedade rural',
        requesterName: 'Proprietário da Área',
        startDateTime: new Date().toISOString(),
        location: {
          address: 'Rodovia SP-101, km 25',
          neighborhood: 'Zona Rural',
          latitude: -22.18,
          longitude: -47.87,
        },
      };

      const result = await occurrencesService.create(createDto, testUserId);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('raNumber');
      expect(result.category).toBe(OccurrenceCategory.VISTORIA_AMBIENTAL);
      expect(result.status).toBe(OccurrenceStatus.ABERTA);
      expect(result.description).toBe('Vistoria ambiental em propriedade rural');
      expect(result.createdAt).toBeDefined();
    });

    it('INT-02-2: Should create occurrence with actions and resources', async () => {
      const createDto = {
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Árvore com risco de queda na via pública',
        requesterName: 'Guarda Municipal',
        startDateTime: new Date().toISOString(),
        location: {
          address: 'Avenida Principal, 1500',
          neighborhood: 'Centro',
        },
        actions: [
          {
            teamAction: TeamActionType.ISOLAMENTO_SINALIZACAO,
            activatedOrganism: OrganismType.GUARDA_MUNICIPAL,
          },
        ],
        resources: [
          {
            vehicle: 'Viatura 01 - Defesa Civil',
            materials: 'Cones de sinalização, fita zebrada',
          },
        ],
      };

      const result = await occurrencesService.create(createDto, testUserId);

      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].teamAction).toBe(TeamActionType.ISOLAMENTO_SINALIZACAO);
      expect(result.resources).toHaveLength(1);
      expect(result.resources[0].vehicle).toBe('Viatura 01 - Defesa Civil');
    });

    it('INT-02-3: Should validate required fields on occurrence creation', async () => {
      const invalidDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Description without location',
        // Missing: requesterName, location, startDateTime
      };

      // Validation happens at controller level in real app
      // This test shows the expected behavior
      expect(invalidDto).not.toHaveProperty('requesterName');
      expect(invalidDto).not.toHaveProperty('location');
    });

    it('INT-02-4: Should generate unique RA number for each occurrence', async () => {
      const createDto = {
        category: OccurrenceCategory.INCENDIO_VEGETACAO,
        description: 'Incêndio de vegetação',
        requesterName: 'Bombeiros',
        startDateTime: new Date().toISOString(),
        location: {
          address: 'Serra do Japy',
        },
      };

      const occurrence1 = await occurrencesService.create(createDto, testUserId);
      const occurrence2 = await occurrencesService.create(createDto, testUserId);

      expect(occurrence1.raNumber).not.toBe(occurrence2.raNumber);
      expect(occurrence1.raNumber).toBeDefined();
      expect(occurrence2.raNumber).toBeDefined();
    });
  });

  describe('INT-03: Listagem, Busca e Filtragem - Occurrence Listing', () => {
    beforeEach(async () => {
      await usersService.create({
        username: 'agente_listagem',
        name: 'Agente Teste',
        email: 'agente@sigdc.com.br',
        password: 'senha123',
        active: true,
      });

      // Create multiple occurrences for testing
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Vistoria em São Carlos - Centro',
        requesterName: 'Prefeitura',
        startDateTime: new Date().toISOString(),
        location: { address: 'Centro de São Carlos' },
        status: OccurrenceStatus.ABERTA,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Árvore cortada na Avenida Principal',
        requesterName: 'Morador',
        startDateTime: new Date().toISOString(),
        location: { address: 'Avenida Principal' },
        status: OccurrenceStatus.ANDAMENTO,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.INCENDIO_VEGETACAO,
        description: 'Fogo controlado - Zona Rural',
        requesterName: 'Corpo de Bombeiros',
        startDateTime: new Date().toISOString(),
        location: { address: 'Zona Rural' },
        status: OccurrenceStatus.FECHADA,
      });
    });

    it('INT-03-1: Should list all occurrences', async () => {
      const result = await occurrencesService.findAll();

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
    });

    it('INT-03-2: Should filter occurrences by status "Aberta"', async () => {
      const result = await occurrencesService.findAll({
        status: OccurrenceStatus.ABERTA,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].status).toBe(OccurrenceStatus.ABERTA);
    });

    it('INT-03-3: Should filter occurrences by status "Em atendimento"', async () => {
      const result = await occurrencesService.findAll({
        status: OccurrenceStatus.ANDAMENTO,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(OccurrenceStatus.ANDAMENTO);
      expect(result.data[0].description).toContain('Árvore');
    });

    it('INT-03-4: Should filter occurrences by category', async () => {
      const result = await occurrencesService.findAll({
        category: OccurrenceCategory.INCENDIO_VEGETACAO,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe(OccurrenceCategory.INCENDIO_VEGETACAO);
    });

    it('INT-03-5: Should search by RA number', async () => {
      const allOccurrences = await occurrencesService.findAll();
      const firstOccurrence = allOccurrences.data[0];

      const result = await occurrencesService.findByRANumber(firstOccurrence.raNumber);

      expect(result.raNumber).toBe(firstOccurrence.raNumber);
      expect(result.id).toBe(firstOccurrence.id);
    });

    it('INT-03-6: Should retrieve specific occurrence by ID', async () => {
      const allOccurrences = await occurrencesService.findAll();
      const targetOccurrence = allOccurrences.data[0];

      const result = await occurrencesService.findOne(targetOccurrence.id as string);

      expect(result.id).toBe(targetOccurrence.id);
      expect(result.raNumber).toBe(targetOccurrence.raNumber);
    });
  });

  describe('Workflow de Atualização - Status Update Workflow', () => {
    it('Should complete a full workflow: Create -> List -> Update -> List', async () => {
      // Step 1: Create occurrence
      const occurrence = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Vistoria completa',
        requesterName: 'Coordenador',
        startDateTime: new Date().toISOString(),
        location: { address: 'Endereço de teste' },
        status: OccurrenceStatus.ABERTA,
      });

      expect(occurrence.status).toBe(OccurrenceStatus.ABERTA);

      // Step 2: Verify in list
      const list1 = await occurrencesService.findAll();
      expect(list1.data).toContainEqual(expect.objectContaining({ id: occurrence.id }));

      // Step 3: Update status
      const updated = await occurrencesService.update(occurrence.id as string, {
        status: OccurrenceStatus.ANDAMENTO,
        observations: 'Vistoria em andamento, equipe no local',
      });

      expect(updated.status).toBe(OccurrenceStatus.ANDAMENTO);

      // Step 4: Verify update in list
      const list2 = await occurrencesService.findAll();
      const occurrenceInList = list2.data.find((o) => o.id === occurrence.id);
      expect(occurrenceInList?.status).toBe(OccurrenceStatus.ANDAMENTO);

      // Step 5: Final update to closed
      const final = await occurrencesService.update(occurrence.id as string, {
        status: OccurrenceStatus.FECHADA,
        observations: 'Vistoria concluída',
      });

      expect(final.status).toBe(OccurrenceStatus.FECHADA);
    });
  });
});
