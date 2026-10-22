import { ApiProperty } from '@nestjs/swagger';
import type { PreferencesUtilisateur } from '../entities/utilisateur.entity';

export class AuthResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;

  @ApiProperty()
  expires_in: number;

  @ApiProperty()
  utilisateur: {
    id: string;
    email: string;
    role: string;
    etablissement_id?: string;
    etablissement_nom?: string;
    preferences?: PreferencesUtilisateur;
  };
}
