import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatutProjet } from '../../common/enums/statut-projet.enum';

export class QueryProjetDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ enum: StatutProjet })
  @IsOptional()
  @IsEnum(StatutProjet)
  statut?: StatutProjet;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenariat_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenaire_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_debut_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_debut_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  archive?: boolean;
}
