import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { QueryPublicationDto } from './dto/query-publication.dto';
import { PublicationResponseDto } from './dto/publication-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Publications')
@ApiBearerAuth()
@Controller('publications')
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer une publication (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: PublicationResponseDto })
  create(@Body() dto: CreatePublicationDto): Promise<PublicationResponseDto> {
    return this.publicationsService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les publications' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryPublicationDto) {
    return this.publicationsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir une publication par ID' })
  @ApiResponse({ status: 200, type: PublicationResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicationResponseDto> {
    return this.publicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Mettre a jour une publication (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: PublicationResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePublicationDto,
  ): Promise<PublicationResponseDto> {
    return this.publicationsService.update(id, dto);
  }

  @Patch(':id/publier')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Publier une publication (Presidence uniquement)' })
  @ApiResponse({ status: 200, type: PublicationResponseDto })
  publier(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicationResponseDto> {
    return this.publicationsService.publier(id);
  }
}
