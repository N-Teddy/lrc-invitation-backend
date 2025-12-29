import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user.enum';
import { BirthdayTodayResponseDto } from '../dtos/response/birthday.dto';
import { BirthdaysService } from './birthdays.service';

@ApiBearerAuth()
@ApiTags('birthdays')
@Controller('birthdays')
export class BirthdaysController {
    constructor(private readonly birthdaysService: BirthdaysService) {}

    @Roles([UserRole.Monitor])
    @Get('today')
    @ApiOkResponse({ type: BirthdayTodayResponseDto })
    async today() {
        const items = await this.birthdaysService.getTodayMonitorBirthdays(new Date());
        return { items };
    }
}
