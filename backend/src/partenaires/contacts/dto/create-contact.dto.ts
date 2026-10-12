import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: 'Prof. Dupont Marie' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ example: 'Responsable des relations internationales' })
  @IsOptional()
  @IsString()
  fonction?: string;

  @ApiPropertyOptional({ example: 'marie.dupont@univ-toulouse.fr' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+33 5 61 55 88 99' })
  @IsOptional()
  @IsString()
  telephone?: string;
}
