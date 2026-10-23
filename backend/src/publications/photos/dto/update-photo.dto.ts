import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** Métadonnées éditables d'une photo, sans remplacement du fichier. */
export class UpdatePhotoDto {
  @ApiPropertyOptional({
    example: 'Atelier de restitution à Fianarantsoa',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legende?: string | null;

  @ApiPropertyOptional({ example: 1, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ordre?: number;
}
