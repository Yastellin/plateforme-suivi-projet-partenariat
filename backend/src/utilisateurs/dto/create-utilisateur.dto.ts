import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUtilisateurDto {
  @ApiProperty({ example: 'partenariats@univ-fianarantsoa.mg' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  mot_de_passe: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({
    description: 'Nom du nouvel établissement pour un compte établissement',
    maxLength: 255,
  })
  @ValidateIf((dto: CreateUtilisateurDto) => dto.role === Role.ETABLISSEMENT)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/\S/, { message: 'Le nom de l’établissement est requis.' })
  etablissement_nom?: string;
}
