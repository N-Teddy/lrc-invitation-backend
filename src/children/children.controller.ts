import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { BulkCreateChildrenDto, CreateChildMultipartDto } from '../dtos/request/child.dto';
import {
    BulkCreateChildrenResponseDto,
    ChildResponseDto,
    ChildrenListResponseDto,
} from '../dtos/response/child.dto';
import { ChildStatsResponseDto } from '../dtos/response/child-stats.dto';
import { ChildrenService } from './children.service';

@ApiBearerAuth()
@ApiTags('children')
@Controller('children')
export class ChildrenController {
    constructor(private readonly childrenService: ChildrenService) {}

    @Roles([UserRole.Monitor])
    @Get()
    @ApiOkResponse({ type: ChildrenListResponseDto })
    list(
        @Query('q') q: string | undefined,
        @Query('includeArchived') includeArchived: string | undefined,
        @Query('page') page: string | undefined,
        @Query('limit') limit: string | undefined,
        @CurrentUser() currentUser: any,
    ) {
        return this.childrenService.list(
            {
                q,
                includeArchived: includeArchived === 'true',
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            },
            currentUser,
        );
    }

    @Roles([UserRole.Monitor])
    @Get(':id')
    @ApiOkResponse({ type: ChildResponseDto })
    get(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.childrenService.get(id, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Get(':id/stats')
    @ApiOkResponse({ type: ChildStatsResponseDto })
    stats(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.childrenService.getStats(id, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 2 * 1024 * 1024 },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string' },
                dateOfBirth: { type: 'string', example: '2014-06-02' },
                guardiansJson: {
                    type: 'string',
                    example:
                        '[{\"fullName\":\"Jane Doe\",\"phoneE164\":\"+237693087159\",\"relationship\":\"Mother\"}]',
                },
                preferredLanguage: { type: 'string', example: 'en' },
                whatsAppPhoneE164: { type: 'string', example: '+237693087159' },
                whatsAppOptIn: { type: 'boolean', example: true },
                file: { type: 'string', format: 'binary' },
            },
            required: ['fullName', 'dateOfBirth', 'guardiansJson'],
        },
    })
    @ApiCreatedResponse({ type: ChildResponseDto })
    create(
        @Body() dto: CreateChildMultipartDto,
        @UploadedFile() file: any,
        @CurrentUser() currentUser: any,
    ) {
        return this.childrenService.create(dto, file, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post('bulk')
    @ApiCreatedResponse({ type: BulkCreateChildrenResponseDto })
    bulk(@Body() dto: BulkCreateChildrenDto, @CurrentUser() currentUser: any) {
        return this.childrenService.bulkCreate(dto.children ?? [], currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/profile-image')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 2 * 1024 * 1024 },
        }),
    )
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @ApiOkResponse({ type: ChildResponseDto })
    uploadProfileImage(
        @Param('id') id: string,
        @UploadedFile() file: any,
        @CurrentUser() currentUser: any,
    ) {
        return this.childrenService.uploadProfileImage(id, file, currentUser);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Official, MonitorLevel.Super])
    @Post(':id/archive')
    @ApiOkResponse({ type: ChildResponseDto })
    archive(@Param('id') id: string, @CurrentUser() currentUser: any) {
        return this.childrenService.archive(id, currentUser);
    }
}
