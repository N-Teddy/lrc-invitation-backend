import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
    constructor(resource: string, identifier: string | number) {
        super(
            {
                statusCode: HttpStatus.NOT_FOUND,
                message: `${resource} with identifier '${identifier}' not found`,
                error: 'Not Found',
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
