import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MulterError } from 'multer';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erreur interne du serveur';

    if (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Le fichier depasse la taille maximale autorisee';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const error = exception.getResponse();

      if (typeof error === 'string') {
        message = error;
      } else if (typeof error === 'object' && error !== null) {
        message =
          (error as { message?: string | string[] }).message ?? message;
      }
    } else if (exception instanceof Error && exception.message) {
      if (exception.message === 'Type de fichier non autorise') {
        status = HttpStatus.BAD_REQUEST;
        message = exception.message;
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
