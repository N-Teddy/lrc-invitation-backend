import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { InteractionEvent, InteractionEventSchema } from '../schema/interaction-event.schema';
import { User, UserSchema } from '../schema/user.schema';
import { Reminder, ReminderSchema } from '../schema/reminder.schema';
import { Activity, ActivitySchema } from '../schema/activity.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: InteractionEvent.name, schema: InteractionEventSchema },
            { name: User.name, schema: UserSchema },
            { name: Reminder.name, schema: ReminderSchema },
            { name: Activity.name, schema: ActivitySchema },
        ]),
    ],
    controllers: [InteractionsController],
    providers: [InteractionsService],
})
export class InteractionsModule {}
