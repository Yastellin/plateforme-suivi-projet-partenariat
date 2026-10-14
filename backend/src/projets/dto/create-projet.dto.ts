// backend/src/projets/dto/create-projet.dto.ts
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  IsUUID,
  IsNumber,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutProjet } from '../../common/enums/statut-projet.enum';
import { CreatePorteurDto } from '../../referentiels/porteurs/dto/create-porteur.dto';
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

  // Porteur cree en memoire lors de la creation du projet (porteur polymorphe).
  // Si fourni, porteur_id doit etre absent : le service derive l'id du porteur
  // cree dans la transaction et l'attache au projet.
  @ApiPropertyOptional({
    description:
      'Porteur a creer en meme temps que le projet (porteur polymorphe). Mutuellement exclu de porteur_id.',
    type: CreatePorteurDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePorteurDto)
  porteur?: CreatePorteurDto;

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
    description: "ID de l'établissement (PRÉSIDENCE uniquement)",
  })
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;
}
