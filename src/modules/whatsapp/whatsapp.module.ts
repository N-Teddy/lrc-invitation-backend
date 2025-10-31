import { Module, Global } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';

@Global()
@Module({
    providers: [WhatsAppService],
    controllers: [WhatsAppController],
    exports: [WhatsAppService],
})
export class WhatsAppModule { }
