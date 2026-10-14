// backend/src/referentiels/porteurs/dto/create-porteur.dto.ts
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypePorteur } from '../../../common/enums/type-porteur.enum';

export class CreatePorteurDto {
  @ApiProperty({ enum: TypePorteur })
  @IsEnum(TypePorteur, { message: 'Le type de porteur est invalide.' })
  type_porteur: TypePorteur;

  // Requis sauf pour ETABLISSEMENT (represente par l'etablissement rattache).
  @ValidateIf((dto) => dto.type_porteur !== TypePorteur.ETABLISSEMENT, {
    message: 'Le nom est requis pour un porteur de type personne ou autre.',
  })
  @IsString({ message: 'Le nom doit etre une chaine.' })
  @MinLength(2, {
    message: 'Le nom du porteur doit contenir au moins 2 caracteres.',
  })
  @MaxLength(120, {
    message: 'Le nom du porteur ne doit pas depasser 120 caracteres.',
  })
  nom?: string;

  @ApiPropertyOptional({ example: 'FDS' })
  @IsOptional()
  @IsString({ message: "L'institution doit etre une chaine." })
  @MaxLength(120, {
    message: "L'institution ne doit pas depasser 120 caracteres.",
  })
  institution_rattachement?: string;

  // Requis uniquement pour ETABLISSEMENT (contenu UUID, colonne text).
  @ValidateIf((dto) => dto.type_porteur === TypePorteur.ETABLISSEMENT, {
    message:
      "L'identifiant d'etablissement est requis pour un porteur de type etablissement.",
  })
  @IsUUID(undefined, {
    message: "L'identifiant d'etablissement est invalide.",
  })
  etablissement_id?: string;
}
