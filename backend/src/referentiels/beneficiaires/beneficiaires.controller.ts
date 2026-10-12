import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BeneficiairesService } from './beneficiaires.service';
import { CreateBeneficiaireDto } from './dto/create-beneficiaire.dto';
import { UpdateBeneficiaireDto } from './dto/update-beneficiaire.dto';
import { BeneficiaireResponseDto } from './dto/beneficiaire-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Referentiels - Beneficiaires')
@ApiBearerAuth()
@Controller('referentiels/beneficiaires')
export class BeneficiairesController {
  constructor(private beneficiairesService: BeneficiairesService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer un beneficiaire (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: BeneficiaireResponseDto })
  create(@Body() dto: CreateBeneficiaireDto): Promise<BeneficiaireResponseDto> {
    return this.beneficiairesService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les beneficiaires' })
  @ApiResponse({ status: 200, type: [BeneficiaireResponseDto] })
  findAll(@Query('nom') nom?: string): Promise<BeneficiaireResponseDto[]> {
    return this.beneficiairesService.findAll(nom);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir un beneficiaire par ID' })
  @ApiResponse({ status: 200, type: BeneficiaireResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BeneficiaireResponseDto> {
    return this.beneficiairesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Mettre a jour un beneficiaire (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: BeneficiaireResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBeneficiaireDto,
  ): Promise<BeneficiaireResponseDto> {
    return this.beneficiairesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Supprimer un beneficiaire (Presidence uniquement)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.beneficiairesService.remove(id);
  }
}
