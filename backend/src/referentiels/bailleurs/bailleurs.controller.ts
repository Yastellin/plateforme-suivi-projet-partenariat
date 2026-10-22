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
import { BailleursService } from './bailleurs.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { UpdateBailleurDto } from './dto/update-bailleur.dto';
import { BailleurResponseDto } from './dto/bailleur-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Referentiels - Bailleurs')
@ApiBearerAuth()
@Controller('referentiels/bailleurs')
export class BailleursController {
  constructor(private bailleursService: BailleursService) {}

  @Post()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Creer un bailleur (Présidence ou établissement)' })
  @ApiResponse({ status: 201, type: BailleurResponseDto })
  create(@Body() dto: CreateBailleurDto): Promise<BailleurResponseDto> {
    return this.bailleursService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les bailleurs' })
  @ApiResponse({ status: 200, type: [BailleurResponseDto] })
  findAll(@Query('nom') nom?: string): Promise<BailleurResponseDto[]> {
    return this.bailleursService.findAll(nom);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir un bailleur par ID' })
  @ApiResponse({ status: 200, type: BailleurResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BailleurResponseDto> {
    return this.bailleursService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Mettre a jour un bailleur (Présidence ou établissement)',
  })
  @ApiResponse({ status: 200, type: BailleurResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBailleurDto,
  ): Promise<BailleurResponseDto> {
    return this.bailleursService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Supprimer un bailleur (Présidence ou établissement)',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.bailleursService.remove(id);
  }
}
