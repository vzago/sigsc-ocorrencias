import { type TestingModule, Test } from '@nestjs/testing';
import { OccurrencesService } from './occurrences.service';
import { FirebaseService } from '../firebase/firebase.service';
import { createMockFirestore, type MockCollection } from '../../test/utils/test-utils';
import { OccurrenceStatus, OccurrenceCategory } from './interfaces/occurrence.interface';
import { OrganismType, TeamActionType } from './dto/create-occurrence.dto';

describe('OccurrencesService', () => {
  let occurrencesService: OccurrencesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let mockFirestore: Record<string, unknown>;
  let occurrencesCollection: MockCollection;

  const mockLocationDto = {
    address: 'Test Street',
    latitude: 0,
    longitude: 0,
  };

  beforeEach(async () => {
    mockFirestore = createMockFirestore();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OccurrencesService,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn(() => mockFirestore),
          },
        },
      ],
    }).compile();

    occurrencesService = module.get<OccurrencesService>(OccurrencesService);
    occurrencesCollection = (mockFirestore.getCollection as (name: string) => MockCollection)(
      'occurrences',
    );
  });

  afterEach(async () => {
    occurrencesCollection.clear();
  });

  describe('create', () => {
    it('should create a new occurrence', async () => {
      const createOccurrenceDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        status: OccurrenceStatus.ABERTA,
      };

      const result = await occurrencesService.create(createOccurrenceDto);

      expect(result).toBeDefined();
      expect(result.category).toBe(OccurrenceCategory.VISTORIA_AMBIENTAL);
      expect(result.raNumber).toBeDefined();
      expect(result.status).toBe(OccurrenceStatus.ABERTA);
    });

    it('should generate unique RA number for each occurrence', async () => {
      const createOccurrenceDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      };

      const result1 = await occurrencesService.create(createOccurrenceDto);
      const result2 = await occurrencesService.create(createOccurrenceDto);

      expect(result1.raNumber).not.toBe(result2.raNumber);
    });

    it('should set default values for optional fields', async () => {
      const createOccurrenceDto = {
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      };

      const result = await occurrencesService.create(createOccurrenceDto);

      expect(result.status).toBe(OccurrenceStatus.ABERTA);
      expect(result.actions).toEqual([]);
      expect(result.resources).toEqual([]);
    });

    it('should set endDateTime to null if not provided', async () => {
      const createOccurrenceDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      };

      const result = await occurrencesService.create(createOccurrenceDto);

      expect(result.endDateTime).toBeNull();
    });

    it('should set createdBy when userId is provided', async () => {
      const userId = 'user123';
      const createOccurrenceDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      };

      const result = await occurrencesService.create(createOccurrenceDto, userId);

      expect(result.createdBy).toBe(userId);
    });

    it('should create with actions and resources', async () => {
      const createOccurrenceDto = {
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        actions: [{ teamAction: TeamActionType.ISOLAMENTO_SINALIZACAO, activatedOrganism: OrganismType.GUARDA_MUNICIPAL }],
        resources: [{ vehicle: 'Viatura 01', materials: 'Cones' }],
      };

      const result = await occurrencesService.create(createOccurrenceDto);

      expect(result.actions).toHaveLength(1);
      expect(result.resources).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an occurrence by id', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findOne(created.id as string);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.description).toBe('Test occurrence');
    });

    it('should throw NotFoundException if occurrence does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await expect(occurrencesService.findOne('nonexistent')).rejects.toThrow();
    });
  });

  describe('findByRANumber', () => {
    it('should return an occurrence by RA number', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findByRANumber(created.raNumber);

      expect(result).toBeDefined();
      expect(result.raNumber).toBe(created.raNumber);
    });

    it('should throw NotFoundException if occurrence with RA number does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await expect(occurrencesService.findByRANumber('NONEXISTENT')).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all occurrences', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence 1',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test occurrence 2',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty list if no occurrences', async () => {
      const result = await occurrencesService.findAll();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter occurrences by status', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence 1',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        status: OccurrenceStatus.ABERTA,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test occurrence 2',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        status: OccurrenceStatus.ANDAMENTO,
      });

      const result = await occurrencesService.findAll({
        status: OccurrenceStatus.ABERTA,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(OccurrenceStatus.ABERTA);
    });

    it('should filter occurrences by category', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence 1',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test occurrence 2',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe(OccurrenceCategory.VISTORIA_AMBIENTAL);
    });

    it('should filter by both status and category', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test 1',
        requesterName: 'User 1',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        status: OccurrenceStatus.ABERTA,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test 2',
        requesterName: 'User 2',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
        status: OccurrenceStatus.ANDAMENTO,
      });

      const result = await occurrencesService.findAll({
        status: OccurrenceStatus.ABERTA,
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(OccurrenceStatus.ABERTA);
    });

    it('should handle pagination', async () => {
      for (let i = 0; i < 15; i++) {
        await occurrencesService.create({
          category: OccurrenceCategory.VISTORIA_AMBIENTAL,
          description: `Test ${i}`,
          requesterName: 'Test User',
          startDateTime: new Date().toISOString(),
          location: mockLocationDto,
        });
      }

      const result = await occurrencesService.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(15);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
    });

    it('should return second page when requested', async () => {
      for (let i = 0; i < 15; i++) {
        await occurrencesService.create({
          category: OccurrenceCategory.VISTORIA_AMBIENTAL,
          description: `Test ${i}`,
          requesterName: 'Test User',
          startDateTime: new Date().toISOString(),
          location: mockLocationDto,
        });
      }

      const result = await occurrencesService.findAll({
        page: 2,
        limit: 10,
      });

      expect(result.data).toHaveLength(5);
      expect(result.page).toBe(2);
    });

    it('should filter by requesterName', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test 1',
        requesterName: 'John Doe',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test 2',
        requesterName: 'Jane Smith',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll({
        requesterName: 'John',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].requesterName).toContain('John');
    });

    it('should search by description', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Emergency tree falling risk',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Water leak issue',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll({
        search: 'emergency',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].description).toContain('Emergency');
    });

    it('should search by RA number', async () => {
      const occ = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll({
        search: occ.raNumber,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].raNumber).toBe(occ.raNumber);
    });

    it('should search by location address', async () => {
      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test 1',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: { address: 'Main Street', latitude: 0, longitude: 0 },
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Test 2',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: { address: 'Park Avenue', latitude: 0, longitude: 0 },
      });

      const result = await occurrencesService.findAll({
        search: 'Main',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].location.address).toContain('Main');
    });

    it('should handle date range filters', async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Today',
        requesterName: 'Test User',
        startDateTime: now.toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Tomorrow',
        requesterName: 'Test User',
        startDateTime: tomorrow.toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll({
        startDate: now.toISOString(),
        endDate: tomorrow.toISOString(),
      });

      expect(result.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('update', () => {
    it('should update an occurrence', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const updated = await occurrencesService.update(created.id as string, {
        description: 'Updated description',
        status: OccurrenceStatus.ANDAMENTO,
      });

      expect(updated.description).toBe('Updated description');
      expect(updated.status).toBe(OccurrenceStatus.ANDAMENTO);
    });

    it('should throw NotFoundException if occurrence does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await expect(
        occurrencesService.update('nonexistent', {
          description: 'Updated',
        }),
      ).rejects.toThrow();
    });

    it('should update startDateTime when provided', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 1);

      const updated = await occurrencesService.update(created.id as string, {
        startDateTime: newDate.toISOString(),
      });

      expect(updated.startDateTime).toBeDefined();
    });

    it('should update endDateTime when provided', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);

      const updated = await occurrencesService.update(created.id as string, {
        endDateTime: endDate.toISOString(),
      });

      expect(updated.endDateTime).toBeDefined();
    });

    it('should update multiple fields at once', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Original',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const newDate = new Date();
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 1);

      const updated = await occurrencesService.update(created.id as string, {
        description: 'Updated',
        status: OccurrenceStatus.FECHADA,
        startDateTime: newDate.toISOString(),
        endDateTime: newEndDate.toISOString(),
      });

      expect(updated.description).toBe('Updated');
      expect(updated.status).toBe(OccurrenceStatus.FECHADA);
    });
  });

  describe('remove', () => {
    it('should remove an occurrence', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test occurrence',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.remove(created.id as string);

      expect(result.message).toBe('Ocorrência removida com sucesso');

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await expect(occurrencesService.findOne(created.id as string)).rejects.toThrow();
    });

    it('should throw NotFoundException if occurrence does not exist', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      await expect(occurrencesService.remove('nonexistent')).rejects.toThrow();
    });

    it('should properly handle endDateTime when creating', async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Test with end date',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        endDateTime: endDate.toISOString(),
        location: mockLocationDto,
      });

      expect(created.endDateTime).toBeDefined();
      expect(created.endDateTime).not.toBeNull();
    });

    it('should generate RA numbers with year prefix correctly', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'RA test',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const year = new Date().getFullYear();
      expect(created.raNumber.startsWith(`${year}-`)).toBe(true);
    });

    it('should find occurrence by RA number with correct format', async () => {
      const created = await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Find by RA',
        requesterName: 'Test User',
        startDateTime: new Date().toISOString(),
        location: mockLocationDto,
      });

      const found = await occurrencesService.findByRANumber(created.raNumber);

      expect(found.raNumber).toBe(created.raNumber);
      expect(found.id).toBe(created.id);
    });

    it('should sort by startDateTime descending when no filters applied', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Yesterday',
        requesterName: 'Test',
        startDateTime: yesterday.toISOString(),
        location: mockLocationDto,
      });

      await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Tomorrow',
        requesterName: 'Test',
        startDateTime: tomorrow.toISOString(),
        location: mockLocationDto,
      });

      const result = await occurrencesService.findAll();

      expect(result.data[0].description).toBe('Tomorrow');
      expect(result.data[1].description).toBe('Yesterday');
    });

    it('should handle complex toFirestore conversion with nested objects', async () => {
      const startDate = new Date();
      const created = await occurrencesService.create({
        category: OccurrenceCategory.VISTORIA_AMBIENTAL,
        description: 'Complex data',
        requesterName: 'Test User',
        startDateTime: startDate.toISOString(),
        location: {
          address: 'Complex Street',
          latitude: -22.014,
          longitude: -47.890,
        },
        actions: [
          {
            teamAction: TeamActionType.ISOLAMENTO_SINALIZACAO,
            activatedOrganism: OrganismType.GUARDA_MUNICIPAL,
          },
        ],
        resources: [
          { vehicle: 'Viatura 01', materials: 'Cones and tape' },
          { vehicle: 'Viatura 02', materials: 'Safety equipment' },
        ],
      });

      expect(created.actions).toHaveLength(1);
      expect(created.resources).toHaveLength(2);
      expect(created.location.address).toBe('Complex Street');
    });

    it('should handle toOccurrence with all date fields', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 3600000); // 1 hour later

      const created = await occurrencesService.create({
        category: OccurrenceCategory.RISCO_VEGETACAO,
        description: 'Date test',
        requesterName: 'Test',
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        location: mockLocationDto,
      });

      const found = await occurrencesService.findOne(created.id as string);

      expect(found.startDateTime).toBeDefined();
      expect(found.endDateTime).toBeDefined();
      expect(found.createdAt).toBeDefined();
      expect(found.updatedAt).toBeDefined();
    });
  });
});
