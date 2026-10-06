import { IsString, IsOptional, IsDateString, IsEnum, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutPublication } from '../../common/enums/statut-publication.enum';

export class CreatePublicationDto {
  @ApiProperty({ example: 'Projet Biodiversite : premiers resultats' })
  @IsString()
  @MinLength(3)
  titre: string;

  @ApiPropertyOptional({ example: 'Retour sur la premiere annee du projet...' })
  @IsOptional()
  @IsString()
  description_publique?: string;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_publication?: string;

  @ApiProperty({ enum: StatutPublication, default: StatutPublication.BROUILLON })
  @IsOptional()
  @IsEnum(StatutPublication)
  statut?: StatutPublication;

  @ApiPropertyOptional({ example: 'Cinq especes endemiques identifiees' })
  @IsOptional()
  @IsString()
  resultats?: string;

  @ApiProperty({ description: 'ID du projet associe' })
  @IsUUID()
  projet_id: string;
}