import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ReponseMappee {
  status: number;
  message: string;
  errors: string[];
}

/** Erreur remontee par le pilote PostgreSQL (pg) sous forme de code SQLSTATE. */
interface ErreurPostgres {
  code?: string;
  detail?: string;
  constraint?: string;
  column?: string;
  table?: string;
}

/**
 * Traduit les erreurs de la base de donnees en reponses HTTP normalisees.
 *
 * Les codes SQLSTATE evites correspondent a ceux remontes par le pilote
 * PostgreSQL via TypeORM (QueryFailedError.driverError.code).
 */
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
      return this.repondre(response, this.mapperHttp(exception));
    }

    // 2. Erreur de base de donnees (PostgreSQL / TypeORM)
    const erreurPg = this.extraireErreurPostgres(exception);
    if (erreurPg) {
      const mapped = this.mapperPostgres(erreurPg, exception);

      if (mapped.status >= 500) {
        this.logger.error(
          `Erreur PostgreSQL ${erreurPg.code ?? 'sans code'} sur ${request.method} ${request.url} : ` +
            `${exception instanceof Error ? exception.message : String(exception)}`,
        );
      }

      return this.repondre(response, mapped);
    }

    // 3. Erreur metier TypeORM (ressource introuvable, propriete inconnue...)
    const erreurTypeorm = this.mapperTypeorm(exception);
    if (erreurTypeorm) {
      return this.repondre(response, erreurTypeorm);
    }

    // 4. Fallback : erreur inattendue
    const messageLog =
      exception instanceof Error ? exception.message : String(exception);
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
        errors = errorResponse.message.map(String);
        message = errors[0] ?? 'Données invalides';
      } else if (typeof errorResponse.message === 'string') {
        message = errorResponse.message;
        errors = [errorResponse.message];
      }
      if (Array.isArray(errorResponse.errors)) {
        errors = errorResponse.errors.map(String);
      }
    }

    return { status, message, errors };
  }

  /**
   * Recupere le code SQLSTATE de l'erreur, qu'elle vienne de TypeORM
   * (QueryFailedError.driverError) ou directement du pilote pg.
   */
  private extraireErreurPostgres(exception: unknown): ErreurPostgres | null {
    if (!exception || typeof exception !== 'object') return null;
    const e = exception as any;

    const candidats: any[] = [e.driverError, e.original, e];
    for (const candidat of candidats) {
      if (!candidat || typeof candidat !== 'object') continue;
      // Les codes SQLSTATE sont alphanumeriques sur 5 caracteres (23505, 22P02...)
      if (
        typeof candidat.code === 'string' &&
        /^[0-9A-Z]{5}$/.test(candidat.code)
      ) {
        return candidat as ErreurPostgres;
      }
    }

    return null;
  }

  private mapperTypeorm(exception: unknown): ReponseMappee | null {
    if (!exception || typeof exception !== 'object') return null;
    const e = exception as any;
    const nom = typeof e.name === 'string' ? e.name : '';

    if (nom === 'EntityNotFoundError') {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Ressource non trouvee',
        errors: [],
      };
    }

    if (nom === 'EntityPropertyNotFoundError') {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Critere de recherche invalide',
        errors: [],
      };
    }

    if (nom === 'QueryFailedError') {
      // QueryFailedError sans code SQLSTATE exploitable : erreur serveur
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erreur interne du serveur',
        errors: [],
      };
    }

    return null;
  }

  private mapperPostgres(
    erreur: ErreurPostgres,
    exception: unknown,
  ): ReponseMappee {
    switch (erreur.code) {
      // --- Contraintes d'integrite ---
      case '23505':
        if (erreur.constraint === 'uq_coordonnee_type_valeur') {
          return {
            status: HttpStatus.CONFLICT,
            message:
              'Cette adresse e-mail ou ce numéro de téléphone appartient déjà à une autre personne ou un autre partenaire.',
            errors: [],
          };
        }
        if (erreur.constraint === 'uq_partenaire_identite_active') {
          return {
            status: HttpStatus.CONFLICT,
            message:
              'Un partenaire actif de même nom et pays existe déjà pour cet établissement.',
            errors: [],
          };
        }
        return {
          status: HttpStatus.CONFLICT,
          message: 'Une donnée identique existe déjà.',
          errors: [],
        };

      case '23503':
        return {
          status: HttpStatus.CONFLICT,
          message:
            'Cette opération est impossible car une donnée liée est absente ou utilise encore cet élément.',
          errors: [],
        };

      case '23502':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Un champ obligatoire est manquant.',
          errors: [],
        };

      case '23514':
      case '23P01':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Les données ne respectent pas les règles métier.',
          errors: [],
        };

      // --- Valeurs invalides ---
      case '22P02':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Le format d'une donnée est invalide.",
          errors: [],
        };

      case '22001':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Une valeur est trop longue pour le champ concerne',
          errors: [],
        };

      case '22003':
      case '22007':
      case '22008':
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            'Une valeur est hors limites ou présente un format invalide.',
          errors: [],
        };

      // --- Disponibilite ---
      case '40001':
      case '40P01':
      case '53300':
      case '57P01':
      case '57P03':
      case '08000':
      case '08003':
      case '08006':
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message:
            'Base de donnees indisponible, veuillez reessayer dans quelques instants',
          errors: [],
        };

      // --- Erreurs de programmation (schema, requete) ---
      case '42P01':
      case '42703':
      case '42601':
      case '42883':
      case '3D000':
        this.logger.error(
          `Requete invalide ou schema desynchronise (${erreur.code}) : ${this.detailMessage(erreur)}`,
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur interne du serveur',
          errors: [],
        };

      default:
        this.logger.error(
          `Code PostgreSQL non mappe : ${erreur.code ?? 'inconnu'} ` +
            `(${exception instanceof Error ? exception.message : String(exception)})`,
        );
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erreur interne du serveur',
          errors: [],
        };
    }
  }

  private detailMessage(erreur: ErreurPostgres): string {
    return erreur.detail || erreur.constraint || '';
  }
}
