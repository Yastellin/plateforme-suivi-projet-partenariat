import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutConvention } from '../../common/enums/statut-convention.enum';
import {
  EstDateNonPassee,
  EstPosterieurOuEgalA,
} from '../../common/validators/dates.validator';

export class CreateConventionDto {
  @ApiProperty({
    example: 'Convention de partenariat FDS - Université de Toliara',
  })
  @IsString({ message: 'Le titre doit être du texte.' })
  @MinLength(3, { message: 'Le titre doit contenir au moins 3 caractères.' })
  titre: string;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_signature?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  @EstDateNonPassee()
  date_debut?: string;

  @ApiPropertyOptional({ example: '2029-01-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  @EstPosterieurOuEgalA('date_debut', {
    message:
      'La date de fin doit être postérieure ou égale à la date de début.',
  })
  date_fin?: string;

  @ApiProperty({ enum: StatutConvention, default: StatutConvention.BROUILLON })
  @IsOptional()
  @IsEnum(StatutConvention)
  statut?: StatutConvention;

  @ApiPropertyOptional({
    example: 'Convention cadre pour les echanges academiques',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenariat_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projet_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cotutelle_id?: string;
}
