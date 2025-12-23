import { ApiProperty } from '@nestjs/swagger';

export class BaseSuccessResponseDto<T> {
    @ApiProperty({ default: true })
    success: boolean = true;

    @ApiProperty({ required: false })
    data?: T;
}

export class BaseErrorResponseDto {
    @ApiProperty({ default: false })
    success: boolean = false;

    @ApiProperty()
    error: string;

    @ApiProperty()
    statusCode: number;
}
