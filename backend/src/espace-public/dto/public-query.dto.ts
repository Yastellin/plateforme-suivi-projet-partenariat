import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Liste publique des etablissements (page Etablissements).
export class PublicEtablissementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le nom ou le sigle' })
  @IsOptional()
  @IsString()
  recherche?: string;
}

// Liste publique des partenaires visibles (PUBLIC et ACTIF uniquement).
export class PublicPartenaireQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le nom' })
  @IsOptional()
  @IsString()
  recherche?: string;

  @ApiPropertyOptional({ description: 'Filtre par pays' })
  @IsOptional()
  @IsString()
  pays?: string;

  @ApiPropertyOptional({ description: 'Filtre par type' })
  @IsOptional()
  @IsString()
  type?: string;
}

// Liste publique des publications (publiées par la Présidence uniquement).
export class PublicPublicationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le titre' })
  @IsOptional()
  @IsString()
  recherche?: string;
}

// Liste publique des projets (hors brouillons et projets expirés).
export class PublicProjetQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le nom ou l’intitulé' })
  @IsOptional()
  @IsString()
  recherche?: string;

  @ApiPropertyOptional({ description: 'Filtre par établissement' })
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;
}
