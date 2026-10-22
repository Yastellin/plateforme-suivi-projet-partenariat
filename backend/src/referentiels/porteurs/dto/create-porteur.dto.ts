import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypePorteur } from '../../../common/enums/type-porteur.enum';

/**
 * Commande de création d'un porteur polymorphe.
 *
 * Une personne ou un organisme externe possède un nom libre. Un porteur de
 * type établissement référence au contraire un établissement existant : les
 * deux représentations ne sont jamais mélangées.
 */
export class CreatePorteurDto {
  @ApiProperty({ enum: TypePorteur, default: TypePorteur.PERSONNE })
  @IsEnum(TypePorteur)
  type_porteur: TypePorteur;

  @ApiPropertyOptional({ example: 'Dr Rakoto Soa' })
  @ValidateIf((objet: CreatePorteurDto) =>
    [TypePorteur.PERSONNE, TypePorteur.AUTRE].includes(objet.type_porteur),
  )
  @IsString()
  @MinLength(2)
  nom?: string;

  @ApiPropertyOptional({ example: 'Université de Toliara' })
  @IsOptional()
  @IsString()
  institution_rattachement?: string;

  @ApiPropertyOptional({
    description:
      'Établissement représenté lorsque type_porteur vaut ETABLISSEMENT',
  })
  @ValidateIf(
    (objet: CreatePorteurDto) =>
      objet.type_porteur === TypePorteur.ETABLISSEMENT,
  )
  @IsUUID()
  etablissement_id?: string;
}
