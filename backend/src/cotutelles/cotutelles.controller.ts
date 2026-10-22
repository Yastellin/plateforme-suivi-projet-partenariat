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
import { CotutellesService } from './cotutelles.service';
import { CreateCotutelleDto } from './dto/create-cotutelle.dto';
import { UpdateCotutelleDto } from './dto/update-cotutelle.dto';
import { QueryCotutelleDto } from './dto/query-cotutelle.dto';
import { CotutelleResponseDto } from './dto/cotutelle-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Cotutelles')
@ApiBearerAuth()
@Controller('cotutelles')
export class CotutellesController {
  constructor(private cotutellesService: CotutellesService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer une cotutelle (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: CotutelleResponseDto })
  create(@Body() dto: CreateCotutelleDto): Promise<CotutelleResponseDto> {
    return this.cotutellesService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les cotutelles accessibles' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: any, @Query() query: QueryCotutelleDto) {
    return this.cotutellesService.findAll(
      user.role === Role.ETABLISSEMENT
        ? { ...query, etablissement_id: user.etablissement_id }
        : query,
    );
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir une cotutelle accessible par ID' })
  @ApiResponse({ status: 200, type: CotutelleResponseDto })
  findOne(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CotutelleResponseDto> {
    return this.cotutellesService.findOne(
      id,
      user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined,
    );
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Mettre a jour une cotutelle (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: CotutelleResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCotutelleDto,
  ): Promise<CotutelleResponseDto> {
    return this.cotutellesService.update(id, dto);
  }

  @Post(':id/archiver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Archiver une cotutelle (Presidence uniquement)' })
  @ApiResponse({ status: 200, type: CotutelleResponseDto })
  archiver(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CotutelleResponseDto> {
    return this.cotutellesService.archiver(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
