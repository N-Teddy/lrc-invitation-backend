import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SendMethod {
    WHATSAPP = 'whatsapp',
    EMAIL = 'email',
    BOTH = 'both',
}

export class SendInvitationListDto {
    @ApiPropertyOptional({ enum: SendMethod, default: SendMethod.WHATSAPP })
    @IsOptional()
    @IsEnum(SendMethod)
    method?: SendMethod;

    @ApiPropertyOptional({ example: 'Custom message for this invitation' })
    @IsOptional()
    @IsString()
    customMessage?: string;
}
