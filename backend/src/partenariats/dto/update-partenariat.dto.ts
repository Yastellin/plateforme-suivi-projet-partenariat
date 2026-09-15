import { PartialType } from '@nestjs/swagger';
import { CreatePartenariatDto } from './create-partenariat.dto';

export class UpdatePartenariatDto extends PartialType(CreatePartenariatDto) {}