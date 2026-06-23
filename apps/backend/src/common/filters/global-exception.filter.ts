import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  FastifyReply,
  FastifyRequest,
} from 'fastify';


@Catch()
export class GlobalExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();

    const request =
      ctx.getRequest<FastifyRequest>();

    const response =
      ctx.getResponse<FastifyReply>();


    let status =
      HttpStatus.INTERNAL_SERVER_ERROR;


    let error: {
      code: string;
      message: string;
      details?: unknown;
    } = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    };


    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();


      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const data =
          exceptionResponse as Record<
            string,
            unknown
          >;


        /**
         * Validation errors
         */
        if (
          status === HttpStatus.BAD_REQUEST &&
          Array.isArray(data.message)
        ) {
          error = {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: data.message,
          };
        }

        /**
         * Other HTTP errors
         */
        else {
          error = {
            code: String(
              data.error ?? 'HTTP_ERROR',
            )
              .toUpperCase()
              .replace(/\s/g, '_'),

            message: String(
              data.message ?? 'Request failed',
            ),
          };
        }
      }

      /**
       * String-based exceptions
       */
      else {
        error = {
          code: 'HTTP_ERROR',
          message: String(exceptionResponse),
        };
      }
    }


    response.status(status).send({
      success: false,
      error,

      metadata: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}