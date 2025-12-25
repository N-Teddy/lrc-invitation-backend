import { Model } from 'mongoose';
import { ActionTokensService } from '../common/services/action-tokens.service';
import { ConversationStateService } from '../conversations/conversation-state.service';
import { NotificationDocument } from '../schema/notification.schema';
import { UserDocument } from '../schema/user.schema';
import { InteractionEventDocument } from '../schema/interaction-event.schema';
import { ReminderDocument } from '../schema/reminder.schema';
export declare class ActionsService {
    private readonly actionTokens;
    private readonly conversationStateService;
    private readonly notificationModel;
    private readonly userModel;
    private readonly interactionEventModel;
    private readonly reminderModel;
    constructor(actionTokens: ActionTokensService, conversationStateService: ConversationStateService, notificationModel: Model<NotificationDocument>, userModel: Model<UserDocument>, interactionEventModel: Model<InteractionEventDocument>, reminderModel: Model<ReminderDocument>);
    handle(token: string): Promise<string>;
    private applyReminderAction;
    private renderResult;
}
