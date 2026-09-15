import { IsOptional, IsString, IsEnum, IsUUID, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatutConvention } from '@prisma/client';

export class QueryConventionDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  titre?: string;

  @ApiPropertyOptional({ enum: StatutConvention })
  @IsOptional()
  @IsEnum(StatutConvention)
  statut?: StatutConvention;

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
  @IsDateString()
  date_fin_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_fin_to?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  archive?: boolean;
}