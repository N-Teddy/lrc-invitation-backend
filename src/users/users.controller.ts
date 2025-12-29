import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { LifecycleStatus, MonitorLevel, UserRole } from '../common/enums/user.enum';
import { CreateUserDto, UpdateMyPreferencesDto, UpdateUserDto } from '../dtos/request/user.dto';
import { UsersService } from './users.service';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { UserResponseDto } from '../dtos/response/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    UploadedFile,
    UseInterceptors,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { MediaService } from '../media/media.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationContextType } from '../common/enums/notification.enum';
import { AppConfigService } from '../config/app-config.service';
import { ApproveUserResponseDto } from '../dtos/response/user-approval.dto';
import { UsersListResponseDto } from '../dtos/response/users-list.dto';
import { RejectUserResponseDto } from '../dtos/response/user-rejection.dto';
import { Town } from '../common/enums/activity.enum';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly mediaService: MediaService,
        private readonly notificationService: NotificationService,
        private readonly config: AppConfigService,
    ) {}

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post()
    @ApiCreatedResponse({ type: UserResponseDto })
    create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Get()
    @ApiOkResponse({ type: UsersListResponseDto })
    findAll(
        @Query('q') q?: string,
        @Query('role') role?: UserRole,
        @Query('status') status?: LifecycleStatus,
        @Query('pendingApproval') pendingApproval?: 'true' | 'false',
        @Query('town') town?: Town,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.usersService.listUsers({
            q,
            role,
            status,
            pendingApproval:
                pendingApproval === 'true' ? true : pendingApproval === 'false' ? false : undefined,
            town,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
        });
    }

    @Roles([UserRole.Monitor])
    @Get(':id([0-9a-fA-F]{24})')
    @ApiOkResponse({ type: UserResponseDto })
    findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
        const isSelf = String(currentUser?.id ?? currentUser?._id) === id;
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        if (!isSelf && !isSuper) {
            throw new ForbiddenException('Not allowed');
        }
        return this.usersService.findOneOrFail(id);
    }

    @Roles([UserRole.Monitor])
    @Patch(':id([0-9a-fA-F]{24})')
    @ApiOkResponse({ type: UserResponseDto })
    update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() currentUser: any) {
        const isSelf = String(currentUser?.id ?? currentUser?._id) === id;
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        if (!isSelf && !isSuper) {
            throw new ForbiddenException('Not allowed');
        }
        if (dto.monitorLevel !== undefined && !isSuper) {
            throw new ForbiddenException('Only Super Monitors can change monitor level');
        }
        return this.usersService.update(id, dto, currentUser);
    }

    @Roles([UserRole.Monitor])
    @Patch('me')
    @ApiOkResponse({ type: UserResponseDto })
    updateMe(@Body() dto: UpdateMyPreferencesDto, @CurrentUser() currentUser: any) {
        return this.usersService.updateMyPreferences(currentUser, dto);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post(':id/approve')
    @ApiOkResponse({ type: ApproveUserResponseDto })
    async approve(@Param('id') id: string, @CurrentUser() currentUser: any) {
        await this.usersService.assertCanApproveMonitorRegistration(currentUser, id);
        const { user, magicToken } = await this.usersService.approveMonitorRegistration(id);

        const to = user.email as string | undefined;
        const magicLinkSent = !!(to && magicToken);
        if (magicLinkSent) {
            const magicLinkUrl = `${this.config.frontendBaseUrl}/auth/magic?token=${magicToken}`;
            await this.notificationService.send({
                userId: user.id,
                to,
                subject: 'Your account is approved',
                message: `Hello ${user.fullName},\n\nYour account has been approved. Use this link to sign in: ${magicLinkUrl}\nThis link expires in 30 minutes.`,
                templateName: 'magic-link',
                templateData: {
                    fullName: user.fullName,
                    frontendBaseUrl: this.config.frontendBaseUrl,
                    token: magicToken,
                    magicLink: magicLinkUrl,
                    expiresInMinutes: 30,
                },
                contextType: NotificationContextType.Reminder,
                contextId: user.id,
            });
        }

        return { approved: true, magicLinkSent, user };
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Post(':id/reject')
    @ApiOkResponse({ type: RejectUserResponseDto })
    async reject(@Param('id') id: string, @CurrentUser() currentUser: any) {
        await this.usersService.assertCanApproveMonitorRegistration(currentUser, id);
        const user = await this.usersService.rejectMonitorRegistration(id);
        return { rejected: true, user };
    }

    @Roles([UserRole.Monitor])
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
    @ApiOkResponse({ type: UserResponseDto })
    async uploadProfileImage(
        @Param('id') id: string,
        @UploadedFile() file: any,
        @CurrentUser() currentUser: any,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        const isSelf = String(currentUser?.id ?? currentUser?._id) === id;
        const isSuper = currentUser?.monitorLevel === MonitorLevel.Super;
        if (!isSelf && !isSuper) {
            throw new ForbiddenException('Not allowed');
        }

        const profileImage = await this.mediaService.uploadProfileImage(file);
        return this.usersService.updateProfileImage(id, profileImage);
    }

    @Roles([UserRole.Monitor], [MonitorLevel.Super])
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
