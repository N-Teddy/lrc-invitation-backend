import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost?: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost ?? {};
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const isHttp = exception instanceof HttpException;
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = isHttp
            ? ((exception.getResponse() as any)?.message ?? (exception as any).message)
            : 'Internal server error';

        const body = {
            success: false,
            error: message,
            statusCode: status,
            path: request?.url,
        };

        if (httpAdapter) {
            httpAdapter.reply(response, body, status);
        } else {
            response.status(status).json(body);
        }
    }
}
