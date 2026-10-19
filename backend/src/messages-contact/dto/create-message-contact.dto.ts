import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  REGLE_CONTENU_REEL,
  REGLE_SANS_BALISES,
  REGLE_SANS_CONTROLE,
  REGLE_SANS_REPETITION,
} from './regles-saisie';

const espaces = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Formulaire de contact public. Chaque champ est controle cote API
// (les controles cote interface ne sont qu'un confort pour l'utilisateur).
export class CreateMessageContactDto {
  @ApiProperty({ example: 'Jean Rakoto' })
  @Transform(espaces)
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères.' })
  @Matches(/^[\p{L}\p{M}' .-]+$/u, {
    message:
      'Le nom ne peut contenir que des lettres, espaces, apostrophes, points et tirets.',
  })
  nom: string;

  @ApiProperty({ example: 'jean.rakoto@example.mg' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: "L'adresse e-mail n'est pas valide." })
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({ example: '+261 34 00 000 00' })
  @Transform(espaces)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^\+?[0-9\s().-]{8,30}$/, {
    message: 'Le numéro de téléphone n’est pas valide.',
  })
  telephone?: string;

  @ApiProperty({ example: 'Demande de partenariat' })
  @Transform(espaces)
  @IsString()
  @MinLength(3, { message: 'Le sujet doit contenir au moins 3 caractères.' })
  @MaxLength(200, { message: 'Le sujet ne peut pas dépasser 200 caractères.' })
  @Matches(REGLE_SANS_BALISES, {
    message: 'Les caractères < et > ne sont pas autorisés.',
  })
  @Matches(REGLE_SANS_CONTROLE, {
    message: 'Caractères invisibles non autorisés.',
  })
  @Matches(REGLE_SANS_REPETITION, {
    message: 'Le sujet contient une répétition abusive de caractères.',
  })
  @Matches(REGLE_CONTENU_REEL, {
    message: 'Le sujet doit contenir au moins 3 lettres ou chiffres.',
  })
  sujet: string;

  @ApiProperty({
    example: 'Bonjour, je souhaite vous contacter au sujet de...',
  })
  @Transform(espaces)
  @IsString()
  @MinLength(10, {
    message: 'Le message doit contenir au moins 10 caractères.',
  })
  @MaxLength(2000, {
    message: 'Le message ne peut pas dépasser 2000 caractères.',
  })
  @Matches(REGLE_SANS_BALISES, {
    message: 'Les caractères < et > ne sont pas autorisés dans le message.',
  })
  @Matches(REGLE_SANS_CONTROLE, {
    message: 'Caractères invisibles non autorisés.',
  })
  @Matches(REGLE_SANS_REPETITION, {
    message: 'Le message contient une répétition abusive de caractères.',
  })
  @Matches(REGLE_CONTENU_REEL, {
    message: 'Le message doit contenir au moins 3 lettres ou chiffres.',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Établissement destinataire (vide = Présidence)',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;
}
