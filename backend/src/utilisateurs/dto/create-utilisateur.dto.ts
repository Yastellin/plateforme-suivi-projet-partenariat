import {
  IsEmail,
  IsEnum,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class CreateUtilisateurDto {
  @ApiProperty({ example: 'partenariats@univ-toliara.mg' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  mot_de_passe: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateUtilisateurDto) => dto.role === Role.ETABLISSEMENT)
  @IsUUID()
  etablissement_id?: string;
}
