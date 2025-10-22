import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessLogicException extends HttpException {
    constructor(message: string) {
        super(
            {
                statusCode: HttpStatus.BAD_REQUEST,
                message,
                error: 'Business Logic Error',
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}
