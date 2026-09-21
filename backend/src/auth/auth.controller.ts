import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HttpCode } from '@nestjs/common';

class LogoutDto {
  @ApiPropertyOptional({ description: 'Refresh token a revoquer (optionnel)' })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Connexion utilisateur' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rafraichir le token d acces (rotation du refresh token)' })
  async refresh(@Body() dto: RefreshDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deconnexion (revoque les refresh tokens)' })
  async logout(@CurrentUser() user: any, @Body() dto: LogoutDto): Promise<{ message: string }> {
    await this.authService.logout(user.id, dto.refresh_token);
    return { message: 'Déconnexion réussie' };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Informations de l utilisateur connecte' })
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}