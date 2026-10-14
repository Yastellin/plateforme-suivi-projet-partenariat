// backend/src/referentiels/porteurs/dto/query-porteur.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryPorteurDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtre sur le nom du porteur' })
  @IsOptional()
  @IsString()
  nom?: string;
}