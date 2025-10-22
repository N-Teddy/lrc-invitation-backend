import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { Region } from '../../common/enums/region.enum';

export class CreateChildDto {
    @ApiProperty({ description: 'Child name', example: 'Emmanuel Kamga' })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Birth date (YYYY-MM-DD)',
        example: '2015-03-15',
    })
    @IsDateString()
    birthDate: string;

    @ApiProperty({ description: 'Region', enum: Region })
    @IsEnum(Region)
    region: Region;

    @ApiProperty({
        description: 'Parent name',
        example: 'Mr. Kamga',
        required: false,
    })
    @IsString()
    @IsOptional()
    parentName?: string;

    @ApiProperty({
        description: 'Parent contact',
        example: '+237123456789',
        required: false,
    })
    @IsString()
    @IsOptional()
    parentContact?: string;
}

export class UpdateChildDto {
    @ApiProperty({ description: 'Child name', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: 'Birth date (YYYY-MM-DD)', required: false })
    @IsDateString()
    @IsOptional()
    birthDate?: string;

    @ApiProperty({ description: 'Region', enum: Region, required: false })
    @IsEnum(Region)
    @IsOptional()
    region?: Region;

    @ApiProperty({ description: 'Parent name', required: false })
    @IsString()
    @IsOptional()
    parentName?: string;

    @ApiProperty({ description: 'Parent contact', required: false })
    @IsString()
    @IsOptional()
    parentContact?: string;
}
