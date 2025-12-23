import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        const started = Date.now();

        return next.handle().pipe(
            tap({
                next: () => {
                    const ms = Date.now() - started;
                    this.logger.log(`${method} ${url} ${ms}ms`);
                },
                error: (err) => {
                    const ms = Date.now() - started;
                    this.logger.error(`${method} ${url} ${ms}ms - ${err?.message ?? err}`);
                },
            }),
        );
    }
}
