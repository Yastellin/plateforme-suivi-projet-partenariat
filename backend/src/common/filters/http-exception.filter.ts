import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur interne du serveur';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse() as any;
      message = errorResponse.message || exception.message;
      if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
        errors = errorResponse.errors;
      } else if (typeof errorResponse === 'string') {
        errors = [errorResponse];
      } else if (typeof errorResponse.message === 'string') {
        errors = [errorResponse.message];
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Erreur non interceptée: ${exception.message}`, exception.stack);
      message = 'Erreur interne du serveur';
    }

    response.status(status).json({
      status: 'error',
      message: message,
      data: null,
      errors: errors.length > 0 ? errors : null,
      signature: 'ITDCMADA',
    });
  }
}