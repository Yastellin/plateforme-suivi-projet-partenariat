import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMotDePasseDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1, {
    message: 'Le mot de passe actuel est requis.',
  })
  mot_de_passe_actuel: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, {
    message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(72, {
    message: 'Le nouveau mot de passe ne peut pas dépasser 72 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Le nouveau mot de passe doit contenir une majuscule, une minuscule et un chiffre.',
  })
  nouveau_mot_de_passe: string;
}
