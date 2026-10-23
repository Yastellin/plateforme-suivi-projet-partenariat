import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const retirerEspaces = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class DemanderModificationProjetDto {
  @ApiProperty({
    example:
      'Le budget du projet doit être actualisé après la révision du devis à Toliara.',
    minLength: 10,
    maxLength: 1000,
  })
  @Transform(retirerEspaces)
  @IsString()
  @MinLength(10, {
    message: 'Le motif doit contenir au moins 10 caractères.',
  })
  @MaxLength(1000, {
    message: 'Le motif ne peut pas dépasser 1000 caractères.',
  })
  @Matches(/^[^<>]*$/, {
    message: 'Les caractères < et > ne sont pas autorisés dans le motif.',
  })
  motif: string;
}
