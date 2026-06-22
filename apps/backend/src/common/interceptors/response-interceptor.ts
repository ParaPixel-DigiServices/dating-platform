import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { success: true; data: T }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ success: true; data: T }> {

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),
    );
  }
}