import { ApiProperty } from '@nestjs/swagger';

export class ContactResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() nom: string;
  @ApiProperty({ nullable: true }) fonction: string | null;
  @ApiProperty({ nullable: true }) email: string | null;
  @ApiProperty({ nullable: true }) telephone: string | null;
  @ApiProperty({ type: [String] }) emails: string[];
  @ApiProperty({ type: [String] }) telephones: string[];
  @ApiProperty() partenaire_id: string;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}
