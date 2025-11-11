import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CollectionReference, Query, DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import {
  Occurrence,
  OccurrenceStatus,
} from './interfaces/occurrence.interface';
import { CreateOccurrenceDto } from './dto/create-occurrence.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';
import { FilterOccurrenceDto } from './dto/filter-occurrence.dto';

@Injectable()
export class OccurrencesService {
  private collection: CollectionReference;

  constructor(private firebaseService: FirebaseService) {
    this.collection = this.firebaseService
      .getFirestore()
      .collection('occurrences');
  }

  private toOccurrence(doc: DocumentSnapshot): Occurrence {
    const data = doc.data();
    if (!data) {
      throw new NotFoundException('Ocorrência não encontrada');
    }

    return {
      id: doc.id,
      ...data,
      startDateTime: data.startDateTime?.toDate() || data.startDateTime,
      endDateTime: data.endDateTime?.toDate() || data.endDateTime,
      createdAt: data.createdAt?.toDate() || data.createdAt,
      updatedAt: data.updatedAt?.toDate() || data.updatedAt,
    } as Occurrence;
  }

  private toFirestore(data: any): any {
    const convertToPlainObject = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return obj;
      }
      
      if (obj instanceof Date) {
        return Timestamp.fromDate(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => convertToPlainObject(item));
      }
      
      if (typeof obj === 'object' && obj.constructor !== Object) {
        return JSON.parse(JSON.stringify(obj));
      }
      
      if (typeof obj === 'object') {
        const plainObj: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            plainObj[key] = convertToPlainObject(obj[key]);
          }
        }
        return plainObj;
      }
      
      return obj;
    };

    const firestoreData = convertToPlainObject(data);
    delete firestoreData.id;
    return firestoreData;
  }

  async create(createOccurrenceDto: CreateOccurrenceDto, userId?: string) {
    const raNumber = await this.generateRANumber();
    const now = new Date();

    const occurrenceData: any = {
      ...createOccurrenceDto,
      raNumber,
      startDateTime: new Date(createOccurrenceDto.startDateTime),
      endDateTime: createOccurrenceDto.endDateTime
        ? new Date(createOccurrenceDto.endDateTime)
        : null,
      location: createOccurrenceDto.location || null,
      actions: createOccurrenceDto.actions || [],
      resources: createOccurrenceDto.resources || [],
      status: createOccurrenceDto.status || OccurrenceStatus.ABERTA,
      createdBy: userId || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.collection.add(this.toFirestore(occurrenceData));
    return this.findOne(docRef.id);
  }

  async findAll(filters?: FilterOccurrenceDto): Promise<{ data: Occurrence[]; total: number; page: number; limit: number; totalPages: number }> {
    let query: Query = this.collection;
    let needsInMemorySort = false;

    if (filters) {
      if (filters.category) {
        query = query.where('category', '==', filters.category);
        needsInMemorySort = true;
      }

      if (filters.status) {
        query = query.where('status', '==', filters.status);
        needsInMemorySort = true;
      }

      if (filters.startDate) {
        query = query.where(
          'startDateTime',
          '>=',
          Timestamp.fromDate(new Date(filters.startDate)),
        );
      }

      if (filters.endDate) {
        query = query.where(
          'startDateTime',
          '<=',
          Timestamp.fromDate(new Date(filters.endDate)),
        );
      }
    }

    if (!needsInMemorySort) {
      query = query.orderBy('startDateTime', 'desc');
    }

    const snapshot = await query.get();
    let occurrences = snapshot.docs.map((doc) => this.toOccurrence(doc));

    if (needsInMemorySort) {
      occurrences.sort((a, b) => {
        const getDateValue = (date: Date | Timestamp | string | undefined): number => {
          if (!date) return 0;
          if (date instanceof Date) {
            return date.getTime();
          }
          if (date instanceof Timestamp) {
            return date.toDate().getTime();
          }
          return new Date(date as string).getTime();
        };
        
        const dateA = getDateValue(a.startDateTime);
        const dateB = getDateValue(b.startDateTime);
        return dateB - dateA;
      });
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      occurrences = occurrences.filter(
        (occ) =>
          occ.description?.toLowerCase().includes(searchLower) ||
          occ.raNumber?.toLowerCase().includes(searchLower) ||
          occ.requesterName?.toLowerCase().includes(searchLower) ||
          occ.location?.address?.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.requesterName) {
      const requesterLower = filters.requesterName.toLowerCase();
      occurrences = occurrences.filter((occ) =>
        occ.requesterName?.toLowerCase().includes(requesterLower),
      );
    }

    const total = occurrences.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOccurrences = occurrences.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / limit);

    return {
      data: paginatedOccurrences,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Occurrence> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      throw new NotFoundException(`Ocorrência com ID ${id} não encontrada`);
    }

    return this.toOccurrence(doc);
  }

  async findByRANumber(raNumber: string): Promise<Occurrence> {
    const snapshot = await this.collection
      .where('raNumber', '==', raNumber)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(
        `Ocorrência com R.A. ${raNumber} não encontrada`,
      );
    }

    return this.toOccurrence(snapshot.docs[0]);
  }

  async update(id: string, updateOccurrenceDto: UpdateOccurrenceDto) {
    const occurrence = await this.findOne(id);

    const updateData: any = {
      ...updateOccurrenceDto,
      updatedAt: new Date(),
    };

    if (updateOccurrenceDto.startDateTime) {
      updateData.startDateTime = new Date(updateOccurrenceDto.startDateTime);
    }

    if (updateOccurrenceDto.endDateTime) {
      updateData.endDateTime = new Date(updateOccurrenceDto.endDateTime);
    }

    await this.collection.doc(id).update(this.toFirestore(updateData));
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.collection.doc(id).delete();
    return { message: 'Ocorrência removida com sucesso' };
  }

  private async generateRANumber(): Promise<string> {
    const year = new Date().getFullYear();
    const snapshot = await this.collection
      .where('raNumber', '>=', `${year}-000`)
      .where('raNumber', '<', `${year + 1}-000`)
      .orderBy('raNumber', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return `${year}-001`;
    }

    const lastRANumber = snapshot.docs[0].data().raNumber as string;
    const lastSequence = parseInt(lastRANumber.split('-')[1], 10);
    const newSequence = String(lastSequence + 1).padStart(3, '0');

    return `${year}-${newSequence}`;
  }
}
