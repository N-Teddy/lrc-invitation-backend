import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { MonitorLevel, UserRole } from '../common/enums/user.enum';
import { CreateUserDto, UpdateUserDto } from '../dtos/request/user.dto';
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
