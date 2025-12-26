import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment, PaymentSchema } from '../schema/payment.schema';
import { User, UserSchema } from '../schema/user.schema';
import { MonitorProfile, MonitorProfileSchema } from '../schema/monitor-profile.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AppConfigService } from '../config/app-config.service';
import { TownScopeService } from '../common/services/town-scope.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: User.name, schema: UserSchema },
            { name: MonitorProfile.name, schema: MonitorProfileSchema },
        ]),
        NotificationsModule,
    ],
    controllers: [PaymentsController],
    providers: [PaymentsService, AppConfigService, TownScopeService],
    exports: [PaymentsService],
})
export class PaymentsModule {}
