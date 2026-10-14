// backend/src/etablissements/dto/query-etablissement.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class QueryEtablissementDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: "Recherche sur le nom ou le sigle" })
  @IsOptional()
  @IsString()
  recherche?: string;
}