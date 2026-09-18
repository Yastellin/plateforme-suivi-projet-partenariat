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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { SiteResponseDto } from './dto/site-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Referentiels - Sites')
@ApiBearerAuth()
@Controller('referentiels/sites')
export class SitesController {
  constructor(private sitesService: SitesService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer un site (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: SiteResponseDto })
  create(@Body() dto: CreateSiteDto): Promise<SiteResponseDto> {
    return this.sitesService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les sites' })
  @ApiResponse({ status: 200, type: [SiteResponseDto] })
  findAll(@Query('nom') nom?: string): Promise<SiteResponseDto[]> {
    return this.sitesService.findAll(nom);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir un site par ID' })
  @ApiResponse({ status: 200, type: SiteResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SiteResponseDto> {
    return this.sitesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Mettre a jour un site (Presidence uniquement)' })
  @ApiResponse({ status: 200, type: SiteResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSiteDto,
  ): Promise<SiteResponseDto> {
    return this.sitesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer un site (Presidence uniquement)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.remove(id);
  }
}