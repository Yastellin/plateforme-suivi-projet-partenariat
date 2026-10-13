import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TypeCotutelle } from '../../common/enums/type-cotutelle.enum';

export class QueryCotutelleDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom_doctorant?: string;

  @ApiPropertyOptional({ enum: TypeCotutelle })
  @IsOptional()
  @IsEnum(TypeCotutelle)
  type?: TypeCotutelle;

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
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  archive?: boolean;
}
