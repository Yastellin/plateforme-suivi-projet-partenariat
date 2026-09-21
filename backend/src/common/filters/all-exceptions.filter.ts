import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ReponseMappee {
  status: number;
  message: string;
  errors: string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

      // Rate limiting : message francise
    if (
        exception instanceof HttpException &&
        exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS
    ) {
        return this.repondre(response, {
        status: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Trop de requetes. Veuillez reessayer dans quelques instants.',
        errors: [],
        });
    }

    // 1. Erreur HTTP explicite (NotFoundException, ConflictException, etc.)
    if (exception instanceof HttpException) {
      const mapped = this.mapperHttp(exception);
      return this.repondre(response, mapped);
    }

    // 2. Erreur Prisma (detection par structure : code Pxxxx ou nom PrismaClient*)
    if (this.estErreurPrisma(exception)) {
      const code = (exception as any).code as string | undefined;
      const meta = (exception as any).meta;

      const mapped = this.mapperPrisma(code, meta, exception);

      if (mapped.status >= 500) {
        const messageLog = exception instanceof Error ? exception.message : String(exception);
        this.logger.error(
          `Erreur Prisma ${code ?? 'sans code'} sur ${request.method} ${request.url} : ${messageLog}`,
        );
      }

      return this.repondre(response, mapped);
    }

    // 3. Fallback : erreur inattendue
    const messageLog = exception instanceof Error ? exception.message : String(exception);
    const stackLog = exception instanceof Error ? exception.stack : undefined;
    const nameLog = (exception as any)?.name ?? 'inconnu';
    const codeLog = (exception as any)?.code ?? 'aucun';
    const ctorLog = (exception as any)?.constructor?.name ?? 'inconnu';

    this.logger.error(
      `Erreur non interceptee [${nameLog} / code=${codeLog} / ctor=${ctorLog}] ` +
        `sur ${request.method} ${request.url} : ${messageLog}`,
      stackLog,
    );

    return this.repondre(response, {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erreur interne du serveur',
      errors: [],
    });
  }

  private repondre(response: Response, mapped: ReponseMappee): void {
    response.status(mapped.status).json({
      status: 'error',
      message: mapped.message,
      data: null,
      errors: mapped.errors.length > 0 ? mapped.errors : null,
      signature: 'ITDCMADA',
    });
  }

  private mapperHttp(exception: HttpException): ReponseMappee {
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as any;

    let message = exception.message;
    let errors: string[] = [];

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (typeof errorResponse === 'object' && errorResponse !== null) {
      if (Array.isArray(errorResponse.message)) {
        errors = errorResponse.message;
        message = 'Donnees invalides';
      } else if (typeof errorResponse.message === 'string') {
        message = errorResponse.message;
        errors = [errorResponse.message];
      }
      if (Array.isArray(errorResponse.errors)) {
        errors = errorResponse.errors;
      }
    }

    return { status, message, errors };
  }

  private estErreurPrisma(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') return false;
    const e = exception as any;

    if (typeof e.code === 'string' && /^P\d{4}$/.test(e.code)) return true;
    if (typeof e.name === 'string' && e.name.startsWith('PrismaClient')) return true;
    if (typeof e.message === 'string' && /Invalid `prisma\./.test(e.message)) return true;

    const ctorName = e.constructor?.name;
    if (typeof ctorName === 'string' && ctorName.startsWith('PrismaClient')) return true;

    if (
      typeof e.message === 'string' &&
      /Unknown argument|Unknown field|Invalid value/.test(e.message)
    ) {
      return true;
    }

    return false;
  }

  private mapperPrisma(code: string | undefined, meta: any, exception: unknown): ReponseMappee {
    const cible = meta?.target;

    // Erreurs Prisma sans code Pxxxx (PrismaClientValidationError,
    // PrismaClientInitializationError, etc.)
    if (!code) {
      const e = exception as any;
      const nom = typeof e?.name === 'string' ? e.name : '';
      const message = typeof e?.message === 'string' ? e.message : '';

      if (nom === 'PrismaClientValidationError' || /Invalid `prisma\./.test(message)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Donnees invalides envoyees a la base de donnees',
          errors: [],
        };
      }

      if (nom === 'PrismaClientInitializationError') {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Base de donnees indisponible, veuillez reessayer plus tard',
          errors: [],
        };
      }

      if (nom === 'PrismaClientRustPanicError' || nom === 'PrismaClientUnknownRequestError') {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur interne du serveur',
          errors: [],
        };
      }

      // Erreur Prisma sans code et sans nom reconnu
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Donnees invalides envoyees a la base de donnees',
        errors: [],
      };
    }

    switch (code) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Une valeur est trop longue pour le champ concerne',
          errors: cible ? [`Champ : ${this.formaterCible(cible)}`] : [],
        };

      case 'P2001':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Ressource non trouvee',
          errors: [],
        };

      case 'P2002': {
        const champs = cible ? this.formaterCible(cible) : 'champ unique';
        return {
          status: HttpStatus.CONFLICT,
          message: `Un enregistrement avec cette valeur existe deja (${champs})`,
          errors: [`Contrainte d unicite : ${champs}`],
        };
      }

      case 'P2003':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Operation impossible : des donnees liees existent ou manquent',
          errors: cible ? [`Reference : ${this.formaterCible(cible)}`] : [],
        };

      case 'P2004':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Contrainte de base de donnees non respectee',
          errors: [],
        };

      case 'P2005':
      case 'P2006':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valeur invalide pour un champ',
          errors: [],
        };

      case 'P2007':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Erreur de validation des donnees',
          errors: [],
        };

      case 'P2008':
      case 'P2009':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Requete invalide',
          errors: [],
        };

      case 'P2011': {
        const champ = cible ? this.formaterCible(cible) : 'champ requis';
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `Un champ obligatoire est manquant (${champ})`,
          errors: [],
        };
      }

      case 'P2012':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Une variable obligatoire est manquante',
          errors: [],
        };

      case 'P2013':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Argument obligatoire manquant',
          errors: [],
        };

      case 'P2014':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Relation obligatoire manquante : une ressource liee est requise',
          errors: [],
        };

      case 'P2015':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Enregistrement lie introuvable',
          errors: [],
        };

      case 'P2020':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valeur hors limites pour un champ numerique',
          errors: [],
        };

      case 'P2024':
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Base de donnees saturee, veuillez reessayer',
          errors: [],
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Ressource non trouvee ou deja supprimee',
          errors: [],
        };

      default:
        this.logger.error(`Code Prisma non mappe : ${code}`);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur interne du serveur',
          errors: [],
        };
    }
  }

  private formaterCible(cible: unknown): string {
    if (Array.isArray(cible)) return cible.join(', ');
    if (typeof cible === 'string') return cible;
    return 'champ inconnu';
  }
}