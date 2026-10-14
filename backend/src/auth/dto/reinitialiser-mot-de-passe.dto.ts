import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Regles de complexite alignees sur l'inscription.
export class ReinitialiserMotDePasseDto {
  @ApiProperty({ description: 'Token brut recu par e-mail' })
  @IsString()
  @MinLength(16, { message: 'Le token de reinitialisation est invalide.' })
  @MaxLength(128, { message: 'Le token de reinitialisation est invalide.' })
  token: string;

  @ApiProperty({
    description: 'Nouveau mot de passe',
    example: 'NouveauMotDePasse1',
  })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caracteres.',
  })
  @MaxLength(72, { message: 'Le mot de passe est trop long.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
  })
  nouveau_mot_de_passe: string;
}
