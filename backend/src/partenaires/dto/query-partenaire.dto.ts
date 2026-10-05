import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { StatutPartenaire } from '../../common/enums/statut-partenaire.enum';
import { Visibilite } from '../../common/enums/visibilite.enum';

export class QueryPartenaireDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional({ enum: StatutPartenaire })
  @IsOptional()
  @IsEnum(StatutPartenaire)
  statut?: StatutPartenaire;

  @ApiPropertyOptional({ enum: Visibilite })
  @IsOptional()
  @IsEnum(Visibilite)
  visibilite?: Visibilite;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  etablissement_id?: string;
}