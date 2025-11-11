import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  OccurrenceCategory,
  OccurrenceStatus,
  OriginType,
} from '../interfaces/occurrence.interface';

export enum TeamActionType {
  ISOLAMENTO_SINALIZACAO = 'Isolamento/Sinalização',
  NOTIFICACAO = 'Notificação',
  PARECER_TECNICO = 'Elaborar Parecer Técnico',
  EVACUACAO = 'Evacuação',
  INTERDICAO = 'Interdição',
  AVALIACAO = 'Avaliação',
  DESINTERDICAO = 'Desinterdição',
  APOIO_LOGISTICO = 'Apoio Logístico',
}

export enum OrganismType {
  BOMBEIROS = 'Bombeiros',
  SAAE = 'SAAE',
  POLICIA_AMBIENTAL = 'Polícia Ambiental',
  CPFL = 'CPFL',
  CETESB = 'Cetesb',
  GUARDA_MUNICIPAL = 'Guarda Municipal',
  TRANSITO = 'Trânsito',
  ACAO_SOCIAL = 'Ação Social',
}

export class LocationDto {
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  altitude?: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class ActionDto {
  @IsOptional()
  @IsEnum(TeamActionType)
  teamAction?: TeamActionType;

  @IsOptional()
  @IsEnum(OrganismType)
  activatedOrganism?: OrganismType;
}

export class ResourceDto {
  @IsOptional()
  @IsString()
  vehicle?: string;

  @IsOptional()
  @IsString()
  materials?: string;
}

export class CreateOccurrenceDto {
  @IsOptional()
  @IsString()
  sspdsNumber?: string;

  @IsDateString()
  startDateTime: string;

  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(OriginType, { each: true })
  origins?: OriginType[];

  @IsOptional()
  @IsString()
  cobradeCode?: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @IsEnum(OccurrenceCategory)
  category: OccurrenceCategory;

  @IsOptional()
  @IsString()
  subcategory?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  areaType?: string;

  @IsOptional()
  @IsString()
  affectedArea?: string;

  @IsOptional()
  @IsString()
  temperature?: string;

  @IsOptional()
  @IsString()
  humidity?: string;

  @IsOptional()
  @IsBoolean()
  hasWaterBody?: boolean;

  @IsOptional()
  @IsString()
  impactType?: string;

  @IsOptional()
  @IsString()
  impactMagnitude?: string;

  @IsString()
  @IsNotEmpty()
  requesterName: string;

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  actions?: ActionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];

  @IsOptional()
  @IsString()
  detailedReport?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  responsibleAgents?: string;

  @IsOptional()
  @IsEnum(OccurrenceStatus)
  status?: OccurrenceStatus;
}

