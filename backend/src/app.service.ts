//app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Bienvenue sur la plateforme de gestion des projets et partenariats de l\'Université de Fianarantsoa';
  }
}