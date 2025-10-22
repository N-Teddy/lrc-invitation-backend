import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
} from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import {
    CreateChildDto,
    UpdateChildDto,
} from '../../dto/request/children.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AgeGroup } from '../../common/enums/age-group.enum';
import { Region } from '../../common/enums/region.enum';

@ApiTags('Children')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children')
export class ChildrenController {
    constructor(private readonly childrenService: ChildrenService) { }

    @Post()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Register a new child' })
    @ApiResponse({ status: 201, description: 'Child registered successfully' })
    @ApiResponse({ status: 409, description: 'Child already exists' })
    create(@Body() createChildDto: CreateChildDto) {
        return this.childrenService.create(createChildDto);
    }

    @Get()
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get all children' })
    @ApiQuery({ name: 'ageGroup', required: false, enum: AgeGroup })
    @ApiQuery({ name: 'town', required: false, enum: Region })
    @ApiQuery({ name: 'search', required: false })
    @ApiResponse({ status: 200, description: 'List of children' })
    findAll(
        @Query('ageGroup') ageGroup?: AgeGroup,
        @Query('town') town?: Region,
        @Query('search') search?: string,
    ) {
        const filters: any = {};
        if (ageGroup) filters.ageGroup = ageGroup;
        if (town) filters.town = town;
        if (search) filters.search = search;

        return this.childrenService.findAll(filters);
    }

    @Get('statistics')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR)
    @ApiOperation({ summary: 'Get children statistics' })
    @ApiResponse({ status: 200, description: 'Children statistics' })
    getStatistics() {
        return this.childrenService.getStatistics();
    }

    @Get(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Get a child by ID' })
    @ApiResponse({ status: 200, description: 'Child details' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.childrenService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.DEV, Role.ADMIN, Role.CHIEF_MONITOR, Role.MONITOR)
    @ApiOperation({ summary: 'Update a child' })
    @ApiResponse({ status: 200, description: 'Child updated successfully' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateChildDto: UpdateChildDto,
    ) {
        return this.childrenService.update(id, updateChildDto);
    }

    @Delete(':id')
    @Roles(Role.DEV, Role.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a child' })
    @ApiResponse({ status: 204, description: 'Child deleted successfully' })
    @ApiResponse({ status: 404, description: 'Child not found' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.childrenService.remove(id);
    }
}
