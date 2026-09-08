import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DomainePartenariat, StatutPartenariat } from '@prisma/client';

export class CreatePartenariatDto {
  @ApiProperty({ example: 'Coopération scientifique Madagascar - France' })
  @IsString()
  @MinLength(3)
  intitule: string;

  @ApiPropertyOptional({ example: 'Échanges de chercheurs et co-publications' })
  @IsOptional()
  @IsString()
  objet?: string;

  @ApiProperty({ enum: DomainePartenariat, default: DomainePartenariat.RECHERCHE })
  @IsEnum(DomainePartenariat)
  domaine: DomainePartenariat;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  date_debut: string;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @ApiProperty({ enum: StatutPartenariat, default: StatutPartenariat.BROUILLON })
  @IsEnum(StatutPartenariat)
  statut?: StatutPartenariat = StatutPartenariat.BROUILLON;

  @ApiPropertyOptional({ example: 'Missions d\'échange réalisées en 2024' })
  @IsOptional()
  @IsString()
  actions_realisees?: string;

  @ApiPropertyOptional({ example: 'Préparation d\'un projet de recherche commun' })
  @IsOptional()
  @IsString()
  actions_en_cours?: string;

  @ApiPropertyOptional({ example: 'Organisation d\'un colloque en 2025' })
  @IsOptional()
  @IsString()
  actions_prevues?: string;

  @ApiPropertyOptional({ example: '5 publications conjointes' })
  @IsOptional()
  @IsString()
  resultats_obtenus?: string;

  @ApiPropertyOptional({ example: 'Difficultés de financement' })
  @IsOptional()
  @IsString()
  difficultes_contraintes?: string;

  @ApiPropertyOptional({ example: 'Renforcer les échanges étudiants' })
  @IsOptional()
  @IsString()
  perspectives_recommandations?: string;

  @ApiProperty({ type: [String], example: ['8e94f369-9ba5-4742-b213-5c97c8b08d5f'] })
  @IsArray()
  @IsUUID('4', { each: true })
  etablissements_ids: string[];

  @ApiProperty({ type: [String], example: ['67d13845-635b-4427-a6e3-d85b11337f4f'] })
  @IsArray()
  @IsUUID('4', { each: true })
  partenaires_ids: string[];
}