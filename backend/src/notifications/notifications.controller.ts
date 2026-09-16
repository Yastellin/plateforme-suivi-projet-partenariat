import { Controller, Get, Patch, Param, Query, ParseUUIDPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Lister les notifications de l utilisateur connecte' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: any, @Query() query: QueryNotificationDto) {
    return this.notificationsService.findAll(query, user.id);
  }

  @Get('non-lues/count')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Compter les notifications non lues' })
  compterNonLues(@CurrentUser() user: any) {
    return this.notificationsService.compterNonLues(user.id);
  }

  @Patch('tout-marquer-lu')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  toutMarquerLu(@CurrentUser() user: any) {
    return this.notificationsService.toutMarquerLu(user.id);
  }

  @Patch(':id/lue')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  marquerLue(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.marquerLue(id, user.id);
  }
}