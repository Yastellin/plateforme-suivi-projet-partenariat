import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { QueryDocumentDto } from './dto/query-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

const MIME_AUTORISES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post()
  @Roles(Role.PRESIDENCE)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!MIME_AUTORISES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type de fichier non autorise'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fichier: { type: 'string', format: 'binary' },
        type: {
          type: 'string',
          enum: ['TDR', 'DESCRIPTION', 'CONVENTION', 'AUTRE'],
        },
        nom_fichier: { type: 'string' },
        projet_id: { type: 'string' },
        convention_id: { type: 'string' },
        cotutelle_id: { type: 'string' },
        partenariat_id: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Televerser un document (Presidence uniquement)' })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  upload(
    @UploadedFile() fichier: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.upload(fichier, dto);
  }

  @Get()
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Lister les documents (filtrable par projet, convention, cotutelle ou partenariat)',
  })
  findAll(@Query() query: QueryDocumentDto) {
    return this.documentsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Obtenir un document par ID' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id);
  }

  @Get(':id/telecharger')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Telecharger un document' })
  async telecharger(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { chemin, nom } = await this.documentsService.telecharger(id);
    res.download(chemin, nom);
  }

  @Get(':id/versions')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Lister les versions d un document' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  findVersions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponseDto[]> {
    return this.documentsService.findVersions(id);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer un document (Presidence uniquement)' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.documentsService.remove(id);
  }
}
