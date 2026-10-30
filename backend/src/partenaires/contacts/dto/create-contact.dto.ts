import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Rakoto Soa' })
  @IsString()
  @MinLength(2)
  @Matches(/^[\p{L}\p{M}\s'-]+$/u, {
    message: "Le nom ne peut contenir que des lettres, espaces, apostrophes et traits d'union.",
  })
  nom: string;

  @ApiPropertyOptional({ example: 'Responsable des relations internationales' })
  @IsOptional()
  @IsString()
  fonction?: string;

  @ApiPropertyOptional({ example: 'soa.rakoto@univ-fianarantsoa.mg' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: [String], description: 'Adresses e-mail de la personne (10 maximum).' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEmail({}, { each: true })
  emails?: string[];

  @ApiPropertyOptional({ example: '+261 34 12 345 67' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9][0-9\s().-]{7,19}$/, { message: 'Numéro de téléphone invalide.' })
  telephone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Numéros de téléphone de la personne (10 maximum).' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Matches(/^\+?[0-9][0-9\s().-]{7,19}$/, { each: true, message: 'Un numéro de téléphone est invalide.' })
  telephones?: string[];
}
