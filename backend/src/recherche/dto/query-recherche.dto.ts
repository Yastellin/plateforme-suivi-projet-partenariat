import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export enum TypeRecherche {
  TOUT = 'TOUT',
  PARTENAIRES = 'PARTENAIRES',
  PARTENARIATS = 'PARTENARIATS',
  PROJETS = 'PROJETS',
  CONVENTIONS = 'CONVENTIONS',
  COTUTELLES = 'COTUTELLES',
}

export class QueryRechercheDto extends PaginationQueryDto {
  @ApiProperty({ example: 'Toulouse' })
  @IsString()
  @MinLength(2)
  q: string;

  @ApiPropertyOptional({ enum: TypeRecherche, default: TypeRecherche.TOUT })
  @IsOptional()
  @IsEnum(TypeRecherche)
  type?: TypeRecherche = TypeRecherche.TOUT;
}