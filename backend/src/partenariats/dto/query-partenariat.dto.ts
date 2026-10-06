import { IsOptional, IsString, IsEnum, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DomainePartenariat } from '../../common/enums/domaine-partenariat.enum';
import { StatutPartenariat } from '../../common/enums/statut-partenariat.enum';

export class QueryPartenariatDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  intitule?: string;

  @ApiPropertyOptional({ enum: DomainePartenariat })
  @IsOptional()
  @IsEnum(DomainePartenariat)
  domaine?: DomainePartenariat;

  @ApiPropertyOptional({ enum: StatutPartenariat })
  @IsOptional()
  @IsEnum(StatutPartenariat)
  statut?: StatutPartenariat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;

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

  @ApiPropertyOptional({ description: 'Filtrer sur archive (true pour voir les archivés)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')  // Convertit le string "true" en boolean
  archive?: boolean;
}