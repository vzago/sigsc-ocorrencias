export interface OccurrenceLocation {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  address: string;
  number?: string;
  neighborhood?: string;
  reference?: string;
}

export interface OccurrenceAction {
  teamAction?: string;
  activatedOrganism?: string;
}

export interface OccurrenceResource {
  vehicle?: string;
  materials?: string;
}

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

export interface Occurrence {
  id: string;
  sspdsNumber?: string;
  raNumber: string;
  startDateTime: string | Date;
  endDateTime?: string | Date;
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateOccurrenceDto {
  sspdsNumber?: string;
  startDateTime: string;
  endDateTime?: string;
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
  location: OccurrenceLocation;
  actions?: OccurrenceAction[];
  resources?: OccurrenceResource[];
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
  status?: OccurrenceStatus;
}

export interface UpdateOccurrenceDto extends Partial<CreateOccurrenceDto> { }

export interface FilterOccurrenceDto {
  category?: OccurrenceCategory;
  status?: OccurrenceStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  requesterName?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OccurrenceDisplay {
  id: string;
  ra: string;
  dateTime: string;
  endDateTime?: string;
  category: "vistoria_ambiental" | "risco_vegetacao" | "incendio_vegetacao" | "outras";
  status: "aberta" | "andamento" | "fechada";
  address: string;
  addressNumber?: string;
  neighborhood?: string;
  reference?: string;
  requester: string;
  institution?: string;
  description: string;
  sspdsNumber?: string;
  phone?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  origins?: string[];
  cobradeCode?: string;
  isConfidential?: boolean;
  subcategory?: string;
  areaType?: string;
  affectedArea?: string;
  temperature?: string;
  humidity?: string;
  hasWaterBody?: boolean;
  impactType?: string;
  impactMagnitude?: string;
  teamActions?: string[];
  activatedOrganisms?: string[];
  vehicles?: string[];
  materials?: string;
  detailedReport?: string;
  observations?: string;
  responsibleAgents?: string;
  startDateTimeIso?: string;
}

