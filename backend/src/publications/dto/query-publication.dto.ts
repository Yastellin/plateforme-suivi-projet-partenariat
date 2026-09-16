import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatutPublication } from '@prisma/client';

export class QueryPublicationDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titre?: string;

  @ApiPropertyOptional({ enum: StatutPublication })
  @IsOptional()
  @IsEnum(StatutPublication)
  statut?: StatutPublication;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projet_id?: string;
}