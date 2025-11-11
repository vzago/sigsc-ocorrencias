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
    const firestoreData = { ...data };
    
    if (firestoreData.startDateTime && firestoreData.startDateTime instanceof Date) {
      firestoreData.startDateTime = Timestamp.fromDate(firestoreData.startDateTime);
    }
    
    if (firestoreData.endDateTime && firestoreData.endDateTime instanceof Date) {
      firestoreData.endDateTime = Timestamp.fromDate(firestoreData.endDateTime);
    }

    if (firestoreData.createdAt && firestoreData.createdAt instanceof Date) {
      firestoreData.createdAt = Timestamp.fromDate(firestoreData.createdAt);
    }

    if (firestoreData.updatedAt && firestoreData.updatedAt instanceof Date) {
      firestoreData.updatedAt = Timestamp.fromDate(firestoreData.updatedAt);
    }

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

  async findAll(filters?: FilterOccurrenceDto): Promise<Occurrence[]> {
    let query: Query = this.collection;

    if (filters) {
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }

      if (filters.status) {
        query = query.where('status', '==', filters.status);
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

    query = query.orderBy('startDateTime', 'desc');

    const snapshot = await query.get();
    let occurrences = snapshot.docs.map((doc) => this.toOccurrence(doc));

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      occurrences = occurrences.filter(
        (occ) =>
          occ.description?.toLowerCase().includes(searchLower) ||
          occ.raNumber?.toLowerCase().includes(searchLower) ||
          occ.requesterName?.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.requesterName) {
      const requesterLower = filters.requesterName.toLowerCase();
      occurrences = occurrences.filter((occ) =>
        occ.requesterName?.toLowerCase().includes(requesterLower),
      );
    }

    return occurrences;
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
