import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';
import { Region } from '../../common/enums/region.enum';

export class MonitorResponseDto {
    @ApiProperty({ description: 'Monitor ID' })
    id: number;

    @ApiProperty({ description: 'Monitor name' })
    name: string;

    @ApiProperty({ description: 'Monitor email' })
    email: string;

    @ApiProperty({ description: 'Phone number' })
    phoneNumber: string;

    @ApiProperty({ description: 'Monitor role', enum: Role })
    role: Role;

    @ApiProperty({ description: 'Assigned town', enum: Region })
    assignedTown: Region;

    @ApiProperty({ description: 'Yearly fee paid status' })
    yearlyFeePaid: boolean;

    @ApiProperty({ description: 'Yearly fee amount' })
    yearlyFeeAmount: number;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;
}
