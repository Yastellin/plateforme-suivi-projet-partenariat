import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeDocument } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ enum: TypeDocument })
  @IsEnum(TypeDocument)
  type: TypeDocument;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom_fichier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  projet_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  convention_id?: string;
}