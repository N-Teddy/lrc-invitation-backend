import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { CreateUserDto, UpdateUserDto } from '../dtos/request/user.dto';
import { UsersService } from './users.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dtos/response/user.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post()
    @ApiCreatedResponse({ type: UserResponseDto })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get()
    @ApiOkResponse({ type: [UserResponseDto] })
    findAll() {
        return this.usersService.findAll();
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get(':id')
    @ApiOkResponse({ type: UserResponseDto })
    findOne(@Param('id') id: string) {
        return this.usersService.findOneOrFail(id);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Patch(':id')
    @ApiOkResponse({ type: UserResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
