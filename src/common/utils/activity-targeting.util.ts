import { ChildGroup, TargetingCode } from '../enums/activity.enum';

export function targetGroupsForTargetingCode(code: TargetingCode): ChildGroup[] {
    switch (code) {
        case TargetingCode.PreA:
            return [ChildGroup.PreA];
        case TargetingCode.AB:
            return [ChildGroup.A, ChildGroup.B];
        case TargetingCode.CD:
            return [ChildGroup.C, ChildGroup.D];
        case TargetingCode.ABCD:
        default:
            return [ChildGroup.A, ChildGroup.B, ChildGroup.C, ChildGroup.D, ChildGroup.PreA];
    }
}

export function isValidConferenceDuration(days: number | undefined): boolean {
    return days === 2 || days === 5;
}

