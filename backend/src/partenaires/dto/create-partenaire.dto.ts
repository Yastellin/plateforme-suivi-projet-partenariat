import { IsString, IsOptional, IsEmail, IsEnum, IsBoolean, Length, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutPartenaire, Visibilite } from '@prisma/client';

export class CreatePartenaireDto {
  @ApiProperty({ example: 'Université de Toulouse' })
  @IsString()
  @Length(2, 255)
  nom: string;

  @ApiProperty({ example: 'Université' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  pays: string;

  @ApiPropertyOptional({ example: 'Toulouse, France' })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional({ example: '+33 5 61 55 66 77' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ example: 'contact@univ-toulouse.fr' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://www.univ-toulouse.fr' })
  @IsOptional()
  @IsString()
  site_web?: string;

  @ApiPropertyOptional({ example: 'Partenaire académique historique' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: StatutPartenaire, default: 'ACTIF' })
  @IsEnum(StatutPartenaire)
  statut?: StatutPartenaire = StatutPartenaire.ACTIF;

  @ApiProperty({ enum: Visibilite, default: 'PRIVE' })
  @IsEnum(Visibilite)
  visibilite?: Visibilite = Visibilite.PRIVE;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  est_strategique?: boolean;

  @ApiPropertyOptional({ description: 'ID de l\'établissement (uniquement pour la PRÉSIDENCE)' })
  @IsOptional()
  @IsUUID()
  etablissement_id?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: any;
}