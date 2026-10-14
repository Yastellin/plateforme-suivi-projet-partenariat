import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBeneficiaireDto {
  @ApiProperty({ example: 'Etudiants de Master' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({ example: 'Etudiants' })
  @IsOptional()
  @IsString()
  categorie?: string;

  @ApiPropertyOptional({ example: 'Etudiants en master de biologie' })
  @IsOptional()
  @IsString()
  description?: string;
}
