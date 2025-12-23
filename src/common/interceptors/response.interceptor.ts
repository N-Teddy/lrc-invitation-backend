import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Types } from 'mongoose';

interface StandardResponse<T> {
    success: boolean;
    data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<StandardResponse<T>> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data: this.normalize(data),
            })),
        );
    }

    private normalize(value: any): any {
        if (Array.isArray(value)) {
            return value.map((item) => this.normalize(item));
        }

        if (value instanceof Types.ObjectId) {
            return String(value);
        }

        if (value instanceof Date) {
            return value;
        }

        if (value && typeof value === 'object') {
            const plain =
                typeof (value as any).toObject === 'function' ? (value as any).toObject() : value;
            const out: Record<string, any> = {};

            for (const [k, v] of Object.entries(plain)) {
                if (k === '_id') continue;
                out[k] = this.normalize(v);
            }

            const idSource = (plain as any)._id ?? (plain as any).id;
            if (idSource !== undefined) {
                out.id = this.normalize(idSource);
            }
            return out;
        }
        return value;
    }
}
