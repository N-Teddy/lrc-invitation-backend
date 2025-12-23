import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../dtos/response/user.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    @Get('me')
    @ApiOkResponse({ type: UserResponseDto })
    me(@CurrentUser() user: any): UserResponseDto {
        return user;
    }
}
