import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from '../schema/payment.schema';
import { User, UserSchema } from '../schema/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: User.name, schema: UserSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, AppConfigService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
