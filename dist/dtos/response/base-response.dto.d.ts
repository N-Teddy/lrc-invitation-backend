export declare class BaseSuccessResponseDto<T> {
    success: boolean;
    data?: T;
}
export declare class BaseErrorResponseDto {
    success: boolean;
    error: string;
    statusCode: number;
}
