import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Corps du formulaire de contact public (section 7.4). Aucune authentification
// requise. Les messages sont persistes pour un traitement ulterieur.
export class ContactPublicDto {
  @ApiProperty({ example: 'Jean Rakoto' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nom: string;

  @ApiProperty({ example: 'jean.rakoto@example.mg' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+261 34 00 000 00' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telephone?: string;

  @ApiProperty({ example: 'Demande de partenariat' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  sujet: string;

  @ApiProperty({ example: 'Bonjour, je souhaite vous contacter au sujet de...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
