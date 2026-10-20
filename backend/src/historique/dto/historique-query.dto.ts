// backend/src/historique/dto/historique-query.dto.ts
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ActionHistorique } from '../../common/enums/action-historique.enum';

export class QueryHistoriqueDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recherche?: string;

  @ApiPropertyOptional({ enum: ActionHistorique })
  @IsOptional()
  @IsEnum(ActionHistorique)
  action?: ActionHistorique;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entite_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entite_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_debut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date_fin?: string;
}
