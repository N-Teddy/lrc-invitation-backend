import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('WhatsApp')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('whatsapp')
export class WhatsAppController {
    constructor(private readonly whatsAppService: WhatsAppService) { }

    @Get('status')
    @Roles(Role.DEV, Role.ADMIN)
    @ApiOperation({ summary: 'Get WhatsApp client status' })
    async getStatus() {
        return this.whatsAppService.getClientInfo();
    }
}
