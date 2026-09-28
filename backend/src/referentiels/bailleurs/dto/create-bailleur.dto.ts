import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBailleurDto {
  @ApiProperty({ example: 'Union Europeenne' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({ example: 'Bailleur principal pour les projets de recherche' })
  @IsOptional()
  @IsString()
  description?: string;
}