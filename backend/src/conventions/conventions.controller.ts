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
import { ConventionsService } from './conventions.service';
import { CreateConventionDto } from './dto/create-convention.dto';
import { UpdateConventionDto } from './dto/update-convention.dto';
import { QueryConventionDto } from './dto/query-convention.dto';
import { ConventionResponseDto } from './dto/convention-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Conventions')
@ApiBearerAuth()
@Controller('conventions')
export class ConventionsController {
  constructor(private conventionsService: ConventionsService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Creer une convention (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: ConventionResponseDto })
  create(@Body() dto: CreateConventionDto): Promise<ConventionResponseDto> {
    return this.conventionsService.create(dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les conventions' })
  @ApiResponse({ status: 200 })
  findAll(@Query() query: QueryConventionDto) {
    return this.conventionsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir une convention par ID' })
  @ApiResponse({ status: 200, type: ConventionResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConventionResponseDto> {
    return this.conventionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Mettre a jour une convention (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: ConventionResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConventionDto,
  ): Promise<ConventionResponseDto> {
    return this.conventionsService.update(id, dto);
  }

  @Post(':id/archiver')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Archiver une convention (Presidence uniquement)' })
  @ApiResponse({ status: 200, type: ConventionResponseDto })
  archiver(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConventionResponseDto> {
    return this.conventionsService.archiver(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
