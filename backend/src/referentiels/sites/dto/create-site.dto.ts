import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSiteDto {
  @ApiProperty({ example: 'Campus Fianarantsoa' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({ example: 'Site principal de l universite' })
  @IsOptional()
  @IsString()
  description?: string;
}
