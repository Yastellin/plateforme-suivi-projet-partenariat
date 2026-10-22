import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Façade publique volontairement minimale de la configuration institutionnelle.
 * Les autres paramètres internes ne doivent jamais être exposés anonymement.
 */
export class ConfigurationPubliqueDto {
  @ApiPropertyOptional({
    nullable: true,
    example: '/uploads/logos/presidence/logo.png',
  })
  logo_url: string | null;
}
