import { ApiProperty } from '@nestjs/swagger';
import { Region } from '../../common/enums/region.enum';
import { AgeGroup } from '../../common/enums/age-group.enum';

export class ChildResponseDto {
    @ApiProperty({ description: 'Child ID' })
    id: number;

    @ApiProperty({ description: 'Child name' })
    name: string;

    @ApiProperty({ description: 'Birth date' })
    birthDate: Date;

    @ApiProperty({ description: 'Current age in years' })
    age: number;

    @ApiProperty({ description: 'Current age group', enum: AgeGroup })
    ageGroup: AgeGroup;

    @ApiProperty({ description: 'Region', enum: Region })
    region: Region;

    @ApiProperty({ description: 'Parent name' })
    parentName: string;

    @ApiProperty({ description: 'Parent contact' })
    parentContact: string;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;
}
