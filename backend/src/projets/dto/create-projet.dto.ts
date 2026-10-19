import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
  IsNumber,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutProjet } from '../../common/enums/statut-projet.enum';
import {
  EstDateNonPassee,
  EstPosterieurA,
} from '../../common/validators/dates.validator';

export class CreateProjetDto {
  @ApiProperty({ example: 'Projet Biodiversité' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({
    example: 'Étude de la biodiversité dans les Hautes Terres malgaches',
  })
  @IsOptional()
  @IsString()
  intitule_officiel?: string;

  @ApiProperty({ example: 'Recherche' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Biologie' })
  @IsOptional()
  @IsString()
  domaine?: string;

  @ApiPropertyOptional({ example: 45000.5 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  @IsDateString()
  @EstDateNonPassee()
  date_debut: string;

  @ApiProperty({ example: '2026-06-30T00:00:00.000Z' })
  @IsDateString()
  @EstPosterieurA('date_debut', {
    message: 'La date de fin prévue doit être postérieure à la date de début.',
  })
  date_fin_prevue: string;

  @ApiPropertyOptional({ enum: StatutProjet, default: StatutProjet.BROUILLON })
  @IsOptional()
  @IsEnum(StatutProjet)
  statut?: StatutProjet;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenariat_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  porteur_id?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  partenaires_ids?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  beneficiaires_ids?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  bailleurs_ids?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  sites_ids?: string[];

  @ApiPropertyOptional({
    description:
      "ID de l'établissement cible (PRÉSIDENCE uniquement). Facultatif : un projet peut etre transversal ou gere par la Presidence.",
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  etablissement_id?: string | null;
}
