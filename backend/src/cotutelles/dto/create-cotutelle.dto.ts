import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeCotutelle } from '../../common/enums/type-cotutelle.enum';
import {
  EstDateNonPassee,
  EstPosterieurA,
} from '../../common/validators/dates.validator';

export class CreateCotutelleDto {
  @ApiProperty({ example: 'Rakoto Andry' })
  @IsString()
  @MinLength(2)
  nom_doctorant: string;

  @ApiPropertyOptional({ example: 'Biologie marine' })
  @IsOptional()
  @IsString()
  specialite?: string;

  @ApiPropertyOptional({ example: 'Pr. Rasoa Hery' })
  @IsOptional()
  @IsString()
  directeur_these_local?: string;

  @ApiPropertyOptional({ example: 'Pr. Aina Marie' })
  @IsOptional()
  @IsString()
  directeur_these_partenaire?: string;

  @ApiProperty({ enum: TypeCotutelle, default: TypeCotutelle.COTUTELLE })
  @IsEnum(TypeCotutelle)
  type: TypeCotutelle;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  @IsDateString()
  @EstDateNonPassee()
  date_debut: string;

  @ApiPropertyOptional({ example: '2028-06-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  @EstPosterieurA('date_debut', {
    message:
      'La date prévue de soutenance doit être postérieure à la date de début.',
  })
  date_prevue_soutenance?: string;

  @ApiPropertyOptional({ example: 'Bourse SCAC 2025' })
  @IsOptional()
  @IsString()
  financement_bourse?: string;

  @ApiPropertyOptional({ example: 'Deux séjours de 6 mois à Antananarivo' })
  @IsOptional()
  @IsString()
  mobilite_realisee?: string;

  @ApiPropertyOptional({ example: '2 articles publies' })
  @IsOptional()
  @IsString()
  publications_produites?: string;

  @ApiPropertyOptional({ example: 'En cours de redaction du manuscrit' })
  @IsOptional()
  @IsString()
  etat_avancement?: string;

  @ApiPropertyOptional({ example: 'Difficultes administratives pour le visa' })
  @IsOptional()
  @IsString()
  difficultes_rencontrees?: string;

  @ApiPropertyOptional({ example: 'Soutenir avant juin 2028' })
  @IsOptional()
  @IsString()
  perspectives?: string;

  @ApiProperty({ description: 'ID de l etablissement malgache' })
  @IsUUID()
  etablissement_id: string;

  @ApiProperty({ description: 'ID du partenaire (universite partenaire)' })
  @IsUUID()
  partenaire_id: string;

  @ApiPropertyOptional({ description: 'ID de la convention associee' })
  @IsOptional()
  @IsUUID()
  convention_id?: string;
}
