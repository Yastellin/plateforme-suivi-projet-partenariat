import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
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
import { PhotosService } from './photos.service';
import { UploadPhotoDto } from './dto/upload-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { ImageCouverturePublicationResponseDto } from '../dto/publication-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

const MIME_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];

@ApiTags('Photos publications')
@ApiBearerAuth()
@Controller()
export class PhotosController {
  constructor(private photosService: PhotosService) {}

  @Post('publications/:publicationId/couverture')
  @Roles(Role.PRESIDENCE)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!MIME_AUTORISES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type d image non autorise'),
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
      properties: { fichier: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({
    summary: 'Remplacer l’image de couverture (Présidence uniquement)',
  })
  @ApiResponse({ status: 201, type: ImageCouverturePublicationResponseDto })
  uploadCouverture(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @UploadedFile() fichier: Express.Multer.File,
  ): Promise<{ image_couverture_url: string }> {
    return this.photosService.uploadCouverture(publicationId, fichier);
  }

  @Delete('publications/:publicationId/couverture')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer la couverture (Présidence uniquement)' })
  @ApiResponse({ status: 200, type: ImageCouverturePublicationResponseDto })
  supprimerCouverture(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
  ): Promise<{ image_couverture_url: null }> {
    return this.photosService.supprimerCouverture(publicationId);
  }

  @Post('publications/:publicationId/photos')
  @Roles(Role.PRESIDENCE)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!MIME_AUTORISES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Type d image non autorise'),
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
        legende: { type: 'string' },
        ordre: { type: 'number' },
      },
    },
  })
  @ApiOperation({
    summary: 'Ajouter une photo a une publication (Presidence uniquement)',
  })
  @ApiResponse({ status: 201, type: PhotoResponseDto })
  upload(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
    @UploadedFile() fichier: Express.Multer.File,
    @Body() dto: UploadPhotoDto,
  ): Promise<PhotoResponseDto> {
    return this.photosService.upload(publicationId, fichier, dto);
  }

  @Get('publications/:publicationId/photos')
  @Roles(Role.PRESIDENCE, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les photos d une publication' })
  @ApiResponse({ status: 200, type: [PhotoResponseDto] })
  findAllByPublication(
    @Param('publicationId', ParseUUIDPipe) publicationId: string,
  ) {
    return this.photosService.findAllByPublication(publicationId);
  }

  @Patch('photos/:id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary:
      "Modifier la légende ou l'ordre d'une photo (Présidence uniquement)",
  })
  @ApiResponse({ status: 200, type: PhotoResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhotoDto,
  ): Promise<PhotoResponseDto> {
    return this.photosService.update(id, dto);
  }

  @Delete('photos/:id')
  @Roles(Role.PRESIDENCE)
  @ApiOperation({ summary: 'Supprimer une photo (Presidence uniquement)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.photosService.remove(id);
  }
}
