import { IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MotDePasseOublieDto {
  @ApiProperty({ example: 'presidence@univ-fianarantsoa.mg' })
  @IsEmail({}, { message: "L'adresse e-mail est invalide." })
  @MaxLength(180, { message: "L'adresse e-mail est trop longue." })
  email: string;
}