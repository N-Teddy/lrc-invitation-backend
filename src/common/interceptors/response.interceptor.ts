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
                data: this.attachId(data),
            })),
            catchError((error) =>
                throwError(() => ({
                    success: false,
                    error: error?.message ?? 'Unexpected error',
                })),
            ),
        );
    }

    private attachId(value: any): any {
        if (Array.isArray(value)) {
            return value.map((item) => this.attachId(item));
        }
        if (value && typeof value === 'object') {
            if (value._id) {
                const id = value.id ? value.id : String(value._id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { _id, ...rest } = value;
                return { ...rest, id };
            }
        }
        return value;
    }
}
