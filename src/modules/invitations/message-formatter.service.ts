import { Injectable } from '@nestjs/common';
import { InvitationList, InvitedChild } from './invitation-list.service';

@Injectable()
export class MessageFormatterService {
    formatInvitationList(invitationList: InvitationList): string {
        const { activity, primaryInvitees, nearingAgeInvitees, statistics } = invitationList;

        let message = `📋 *INVITATION LIST*\n\n`;
        message += `*Activity:* ${activity.name}\n`;
        message += `*Date:* ${this.formatDate(activity.date)}\n`;
        message += `*Type:* ${this.capitalizeFirst(activity.type)}\n`;
        message += `*Groups:* ${activity.allowedGroups.join(', ')}\n\n`;

        message += `📊 *STATISTICS*\n`;
        message += `Total Children: ${statistics.totalCount}\n`;
        message += `Primary Invitees: ${statistics.primaryCount}\n`;
        message += `Nearing Age: ${statistics.nearingCount}\n`;

        if (activity.type === 'conference') {
            message += `\n*Conference Eligibility:*\n`;
            message += `✅ Eligible (≥3): ${statistics.eligibleCount}\n`;
            message += `⚠️ Partial (1-2): ${statistics.partialCount}\n`;
            message += `❌ Insufficient (0): ${statistics.insufficientCount}\n`;
        }

        if (primaryInvitees.length > 0) {
            message += `\n\n👥 *PRIMARY INVITEES (${primaryInvitees.length})*\n`;
            message += this.formatChildrenList(primaryInvitees, activity.type === 'conference');
        }

        if (nearingAgeInvitees.length > 0) {
            message += `\n\n🔔 *NEARING AGE GROUP (${nearingAgeInvitees.length})*\n`;
            message += this.formatChildrenList(nearingAgeInvitees, activity.type === 'conference');
        }

        message += `\n\n_Generated: ${this.formatDateTime(invitationList.generatedAt)}_`;

        return message;
    }

    private formatChildrenList(children: InvitedChild[], includeEligibility: boolean): string {
        return children
            .map((child, index) => {
                let line = `${index + 1}. ${child.fullName}`;
                line += ` (${child.currentGroup})`;

                if (includeEligibility && child.conferenceEligibility) {
                    const { participationCount, color } = child.conferenceEligibility;
                    const emoji = color === 'green' ? '✅' : color === 'yellow' ? '⚠️' : '❌';
                    line += ` ${emoji} ${participationCount} services`;
                }

                return line;
            })
            .join('\n');
    }

    formatShortSummary(invitationList: InvitationList): string {
        const { activity, statistics } = invitationList;

        let message = `📋 ${activity.name}\n`;
        message += `📅 ${this.formatDate(activity.date)}\n`;
        message += `👥 ${statistics.totalCount} children invited`;

        if (activity.type === 'conference') {
            message += `\n✅ ${statistics.eligibleCount} eligible`;
        }

        return message;
    }

    formatGroupedByRegion(invitationList: InvitationList, groupByRegion: boolean = false): string {
        // If you want to group by region in the future
        // This is a placeholder for future enhancement
        return this.formatInvitationList(invitationList);
    }

    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    private formatDateTime(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString('en-US', options);
    }

    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
