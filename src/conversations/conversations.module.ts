import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationState, ConversationStateSchema } from '../schema/conversation-state.schema';
import { ConversationStateService } from './conversation-state.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ConversationState.name, schema: ConversationStateSchema },
        ]),
    ],
    providers: [ConversationStateService],
    exports: [ConversationStateService],
})
export class ConversationsModule {}
