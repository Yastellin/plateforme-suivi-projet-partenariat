import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TypeDocument } from '../../common/enums/type-document.enum';

export class QueryDocumentDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projet_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  convention_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cotutelle_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partenariat_id?: string;

  @ApiPropertyOptional({ enum: TypeDocument })
  @IsOptional()
  @IsEnum(TypeDocument)
  type?: TypeDocument;

  @ApiPropertyOptional({ description: 'Recherche sur le nom du fichier' })
  @IsOptional()
  @IsString()
  nom?: string;
}
