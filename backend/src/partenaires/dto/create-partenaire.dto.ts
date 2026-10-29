import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  Length,
  IsUUID,
  IsArray,
  ArrayMaxSize,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutPartenaire } from '../../common/enums/statut-partenaire.enum';
import { Visibilite } from '../../common/enums/visibilite.enum';

export class CreatePartenaireDto {
  @ApiProperty({ example: 'Université de Toliara' })
  @IsString()
  @Length(2, 255)
  nom: string;

  @ApiProperty({ example: 'Université' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Madagascar' })
  @IsString()
  pays: string;

  @ApiPropertyOptional({ example: 'Maninday, Toliara' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ example: '+261 34 12 345 67' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9][0-9\s().-]{7,19}$/, {
    message: 'Numéro de téléphone invalide.',
  })
  telephone?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Tous les numéros du partenaire (10 maximum).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @Matches(/^\+?[0-9][0-9\s().-]{7,19}$/, {
    each: true,
    message: 'Un numéro de téléphone est invalide.',
  })
  telephones?: string[];

  @ApiPropertyOptional({ example: 'contact@univ-toliara.mg' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Toutes les adresses e-mail du partenaire (10 maximum).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEmail({}, { each: true })
  emails?: string[];

  @ApiPropertyOptional({ example: 'https://www.univ-toliara.mg' })
  @IsOptional()
  @IsString()
  site_web?: string;

  @ApiPropertyOptional({ example: 'Partenaire académique historique' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: StatutPartenaire, default: 'ACTIF' })
  @IsOptional()
  @IsEnum(StatutPartenaire)
  statut?: StatutPartenaire;

  @ApiPropertyOptional({ enum: Visibilite, default: 'PRIVE' })
  @IsOptional()
  @IsEnum(Visibilite)
  visibilite?: Visibilite;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  est_strategique?: boolean;

  @ApiPropertyOptional({
    description:
      "Champ de compatibilité : l'établissement est déduit du token d'un compte établissement et ignoré pour la PRÉSIDENCE.",
  })
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: any;
}
