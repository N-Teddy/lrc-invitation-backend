import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, catchError, map, throwError } from 'rxjs';

interface StandardResponse<T> {
    success: boolean;
    data?: T;
    error?: any;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
            })),
            catchError((error) =>
                throwError(() => ({
                    success: false,
                    error: error?.message ?? 'Unexpected error',
                })),
            ),
        );
    }
}
