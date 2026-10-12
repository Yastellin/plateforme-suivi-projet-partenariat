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

export class CreateConventionDto {
  @ApiProperty({ example: 'CONV-2026-001' })
  @IsString()
  @MinLength(3)
  reference: string;

  @ApiProperty({
    example: 'Convention de partenariat FDS - Universite de Toulouse',
  })
  @IsString()
  @MinLength(3)
  titre: string;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_signature?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;

  @ApiPropertyOptional({ example: '2029-01-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
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
