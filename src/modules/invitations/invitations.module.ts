import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { Invitation } from '../../entities/invitation.entity';
import { Child } from '../../entities/child.entity';
import { Activity } from '../../entities/activity.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Invitation, Child, Activity])],
    controllers: [InvitationsController],
    providers: [InvitationsService],
    exports: [InvitationsService],
})
export class InvitationsModule { }
