import { PartialType } from '@nestjs/swagger';
import { CreateBeneficiaireDto } from './create-beneficiaire.dto';

export class UpdateBeneficiaireDto extends PartialType(CreateBeneficiaireDto) {}