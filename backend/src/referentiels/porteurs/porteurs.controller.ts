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
import { PorteursService } from './porteurs.service';
import { CreatePorteurDto } from './dto/create-porteur.dto';
import { UpdatePorteurDto } from './dto/update-porteur.dto';
import { PorteurResponseDto } from './dto/porteur-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Referentiels - Porteurs')
@ApiBearerAuth()
@Controller('referentiels/porteurs')
export class PorteursController {
  constructor(private porteursService: PorteursService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer un porteur (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: PorteurResponseDto })
  create(@Body() dto: CreatePorteurDto): Promise<PorteurResponseDto> {
    return this.porteursService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les porteurs' })
  @ApiResponse({ status: 200, type: [PorteurResponseDto] })
  findAll(@Query('nom') nom?: string): Promise<PorteurResponseDto[]> {
    return this.porteursService.findAll(nom);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir un porteur par ID' })
  @ApiResponse({ status: 200, type: PorteurResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PorteurResponseDto> {
    return this.porteursService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Mettre a jour un porteur (Presidence uniquement)' })
  @ApiResponse({ status: 200, type: PorteurResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePorteurDto,
  ): Promise<PorteurResponseDto> {
    return this.porteursService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer un porteur (Presidence uniquement)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.porteursService.remove(id);
  }
}
