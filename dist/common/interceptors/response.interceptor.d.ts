import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
interface StandardResponse<T> {
    success: boolean;
    data?: T;
}
export declare class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>>;
    private normalize;
}
export {};
