/**
 * Test utilities for Firebase emulator setup and mocking
 */

import { Timestamp } from 'firebase-admin/firestore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFirebaseAdmin(): any {
  return {
    apps: [{ name: 'test' }],
    firestore: jest.fn(),
    auth: jest.fn(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFirestore(): any {
  const collections = new Map<string, MockCollection>();

  return {
    collection: jest.fn((name: string) => {
      if (!collections.has(name)) {
        collections.set(name, new MockCollection(name, collections));
      }
      return collections.get(name);
    }),
    getCollection: (name: string) => collections.get(name),
    clearCollections: () => collections.clear(),
  };
}

/**
 * Mock Collection for in-memory testing
 */
export class MockCollection {
  private docs = new Map<string, any>();
  private name: string;
  private queryFilters: Array<{
    field: string;
    operator: string;
    value: any;
  }> = [];
  private orderByField: string | null = null;
  private orderByDirection: 'asc' | 'desc' = 'asc';
  private limitCount: number | null = null;
  private collections: Map<string, any>;

  constructor(name: string, collections: Map<string, any>) {
    this.name = name;
    this.collections = collections;
  }

  where(field: string, operator: string, value: any): MockCollection {
    const newCollection = new MockCollection(this.name, this.collections);
    newCollection.docs = this.docs;
    newCollection.queryFilters = [...this.queryFilters, { field, operator, value }];
    newCollection.orderByField = this.orderByField;
    newCollection.orderByDirection = this.orderByDirection;
    newCollection.limitCount = this.limitCount;
    return newCollection;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): MockCollection {
    const newCollection = new MockCollection(this.name, this.collections);
    newCollection.docs = this.docs;
    newCollection.queryFilters = [...this.queryFilters];
    newCollection.orderByField = field;
    newCollection.orderByDirection = direction;
    newCollection.limitCount = this.limitCount;
    return newCollection;
  }

  limit(count: number): MockCollection {
    const newCollection = new MockCollection(this.name, this.collections);
    newCollection.docs = this.docs;
    newCollection.queryFilters = [...this.queryFilters];
    newCollection.orderByField = this.orderByField;
    newCollection.orderByDirection = this.orderByDirection;
    newCollection.limitCount = count;
    return newCollection;
  }

  async add(data: any): Promise<{ id: string }> {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    // Store data with Timestamp-like objects for some documents
    const storedData = { ...data, id };
    this.docs.set(id, storedData);
    return { id };
  }

  doc(id: string): any {
    return new MockDocument(id, this.docs, this);
  }

  async get(): Promise<any> {
    let results = Array.from(this.docs.values());

    // Apply filters
    for (const filter of this.queryFilters) {
      results = results.filter((doc) => {
        return this.applyFilter(doc[filter.field], filter.operator, filter.value);
      });
    }

    // Apply ordering
    if (this.orderByField) {
      results.sort((a, b) => {
        const aVal = a[this.orderByField];
        const bVal = b[this.orderByField];

        if (aVal < bVal) return this.orderByDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.orderByDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount) {
      results = results.slice(0, this.limitCount);
    }

    return {
      docs: results.map((doc) => new MockDocumentSnapshot(doc.id, doc)),
      empty: results.length === 0,
    };
  }

  private applyFilter(value: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case '==':
        return value === filterValue;
      case '<':
        return value < filterValue;
      case '<=':
        return value <= filterValue;
      case '>':
        return value > filterValue;
      case '>=':
        return value >= filterValue;
      case '!=':
        return value !== filterValue;
      case 'in':
        return (filterValue as any[]).includes(value);
      case 'array-contains':
        return (value as any[]).includes(filterValue);
      default:
        return true;
    }
  }

  clear(): void {
    this.docs.clear();
  }

  async delete(): Promise<void> {
    this.docs.clear();
  }
}

/**
 * Mock Document for in-memory testing
 */
export class MockDocument {
  constructor(
    private id: string,
    private docs: Map<string, any>,
    private collection: MockCollection,
  ) {}

  async get(): Promise<MockDocumentSnapshot> {
    const doc = this.docs.get(this.id);
    if (!doc) {
      return new MockDocumentSnapshot(this.id, null);
    }
    return new MockDocumentSnapshot(this.id, doc);
  }

  async set(data: any, options?: any): Promise<void> {
    if (options?.merge) {
      const existing = this.docs.get(this.id);
      this.docs.set(this.id, { ...existing, ...data, id: this.id });
    } else {
      this.docs.set(this.id, { ...data, id: this.id });
    }
  }

  async update(data: any): Promise<void> {
    const existing = this.docs.get(this.id);
    if (!existing) {
      throw new Error(`Document with ID ${this.id} does not exist`);
    }
    this.docs.set(this.id, { ...existing, ...data, id: this.id });
  }

  async delete(): Promise<void> {
    this.docs.delete(this.id);
  }
}

/**
 * Mock DocumentSnapshot for in-memory testing
 */
export class MockDocumentSnapshot {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    private snapshotId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private data_: any,
  ) {}

  get id(): string {
    return this.snapshotId;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data(): any {
    return this.data_;
  }

  get exists(): boolean {
    return this.data_ !== null && this.data_ !== undefined;
  }
}
