import { Controller, Get, Header, Param } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ActionsService } from './actions.service';

@ApiExcludeController()
@Public()
@Controller('actions')
export class ActionsController {
    constructor(private readonly actionsService: ActionsService) {}

    @Get(':token')
    @Header('Content-Type', 'text/html')
    handle(@Param('token') token: string) {
        return this.actionsService.handle(token);
    }
}
