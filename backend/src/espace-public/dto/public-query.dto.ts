import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

// Liste publique des etablissements (page /etablissements).
// Le champ de recherche porte sur le nom et le sigle.
export class PublicEtablissementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le nom ou le sigle' })
  @IsOptional()
  @IsString()
  recherche?: string;
}

// Liste publique des partenaires (page /partenaires).
// Seules les fiches visibles publiquement (visibilite = PUBLIC) sont exposees.
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

// Liste publique des publications (page /projets-partenariats).
// Seules les publications au statut PUBLIEE sont exposees.
export class PublicPublicationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Recherche sur le titre' })
  @IsOptional()
  @IsString()
  recherche?: string;
}
