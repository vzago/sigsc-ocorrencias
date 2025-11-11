import * as admin from 'firebase-admin/firestore';

export enum OccurrenceCategory {
  VISTORIA_AMBIENTAL = 'vistoria_ambiental',
  RISCO_VEGETACAO = 'risco_vegetacao',
  INCENDIO_VEGETACAO = 'incendio_vegetacao',
  OUTRAS = 'outras',
}

export enum OccurrenceStatus {
  ABERTA = 'aberta',
  ANDAMENTO = 'andamento',
  FECHADA = 'fechada',
}

export enum OriginType {
  PROCESSO = 'Processo',
  EMAIL_WHATSAPP = 'E-mail/WhatsApp',
  VIA_FONE = 'Via Fone',
  VIA_OFICIO = 'Via Ofício',
  CORPO_BOMBEIROS = 'Corpo de Bombeiros',
}

export interface OccurrenceLocation {
  id?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  address: string;
  number?: string;
  neighborhood?: string;
  reference?: string;
}

export interface OccurrenceAction {
  id?: string;
  teamAction?: string;
  activatedOrganism?: string;
}

export interface OccurrenceResource {
  id?: string;
  vehicle?: string;
  materials?: string;
}

export interface Occurrence {
  id?: string;
  sspdsNumber?: string;
  raNumber: string;
  startDateTime: Date | admin.Timestamp;
  endDateTime?: Date | admin.Timestamp;
  origins?: OriginType[];
  cobradeCode?: string;
  isConfidential?: boolean;
  category: OccurrenceCategory;
  subcategory?: string;
  description: string;
  areaType?: string;
  affectedArea?: string;
  temperature?: string;
  humidity?: string;
  hasWaterBody?: boolean;
  impactType?: string;
  impactMagnitude?: string;
  requesterName: string;
  institution?: string;
  phone?: string;
  location?: OccurrenceLocation;
  actions?: OccurrenceAction[];
  resources?: OccurrenceResource[];
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
  status: OccurrenceStatus;
  createdBy?: string;
  createdAt?: Date | admin.Timestamp;
  updatedAt?: Date | admin.Timestamp;
}

