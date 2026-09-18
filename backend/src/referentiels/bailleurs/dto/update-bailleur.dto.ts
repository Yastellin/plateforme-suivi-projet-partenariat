import { PartialType } from '@nestjs/swagger';
import { CreateBailleurDto } from './create-bailleur.dto';

export class UpdateBailleurDto extends PartialType(CreateBailleurDto) {}