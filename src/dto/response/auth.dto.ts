import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { Region } from '../../common/enums/region.enum';

export class MonitorInfoDto {
    @ApiProperty({ description: 'Monitor ID', example: 1 })
    id: number;

    @ApiProperty({ description: 'Monitor name', example: 'John Doe' })
    name: string;

    @ApiProperty({ description: 'Monitor email', example: 'john.doe@church.org' })
    email: string;

    @ApiProperty({ description: 'Monitor role', enum: Role, example: Role.MONITOR })
    role: Role;

    @ApiProperty({
        description: 'Assigned town',
        enum: Region,
        example: Region.YAOUNDE,
    })
    assignedTown: Region;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({ description: 'Monitor information', type: MonitorInfoDto })
    monitor: MonitorInfoDto;
}
