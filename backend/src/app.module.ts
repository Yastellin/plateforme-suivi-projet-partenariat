import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PartenairesModule } from './partenaires/partenaires.module';
import { PartenariatsModule } from './partenariats/partenariats.module';
import { ProjetsModule } from './projets/projets.module';
import { CotutellesModule } from './cotutelles/cotutelles.module';
import { EtablissementsModule } from './etablissements/etablissements.module';
import { StorageModule } from './storage/storage.module';
import { DocumentsModule } from './documents/documents.module';
import { ConventionsModule } from './conventions/conventions.module';
import { PublicationsModule } from './publications/publications.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { NotificationsModule } from './notifications/notifications.module';
import { TableauDeBordModule } from './tableau-de-bord/tableau-de-bord.module';
import { StatistiquesModule } from './statistiques/statistiques.module';
import { ReferentielsModule } from './referentiels/referentiels.module';
import { ArchivesModule } from './archives/archives.module';
import { RechercheModule } from './recherche/recherche.module';
import { HealthModule } from './health/health.module';
import { CleanupModule } from './cleanup/cleanup.module';
import { DatabaseModule } from './database/database.module';
import { SyntheseModule } from './synthese/synthese.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting global : 100 requetes par minute et par IP.
    // Le TTL est en millisecondes dans @nestjs/throttler v6.
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: process.env.NODE_ENV === 'development' ? 1000 : 100,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    HealthModule,
    PrismaModule,
    AuthModule,
    EtablissementsModule,
    PartenairesModule,
    PartenariatsModule,
    ProjetsModule,
    CotutellesModule,
    StorageModule,
    DocumentsModule,
    ConventionsModule,
    PublicationsModule,
    NotificationsModule,
    TableauDeBordModule,
    StatistiquesModule,
    ReferentielsModule,
    ArchivesModule,
    RechercheModule,
    CleanupModule,
    SyntheseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}