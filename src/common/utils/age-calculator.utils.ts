import { AgeGroup } from '../enums/age-group.enum';
import { AgeGroupConfig } from '../interfaces/age-group.interface';

export class AgeCalculator {
    /**
     * Calculate age in years from birth date
     */
    static calculateAge(birthDate: Date): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Calculate months until next birthday
     */
    static monthsUntilNextBirthday(birthDate: Date): number {
        const today = new Date();
        const birth = new Date(birthDate);
        const nextBirthday = new Date(
            today.getFullYear(),
            birth.getMonth(),
            birth.getDate(),
        );

        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = nextBirthday.getTime() - today.getTime();
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

        return diffMonths;
    }

    /**
     * Determine age group based on age and configuration
     */
    static determineAgeGroup(
        age: number,
        ageGroupConfigs: AgeGroupConfig[],
    ): AgeGroup | null {
        for (const config of ageGroupConfigs) {
            if (age >= config.minAge && age <= config.maxAge) {
                return config.group;
            }
        }
        return null;
    }

    /**
     * Check if child is nearing next age group
     */
    static isNearingNextGroup(
        birthDate: Date,
        currentGroup: AgeGroup,
        ageGroupConfigs: AgeGroupConfig[],
        thresholdMonths: number,
    ): boolean {
        const currentAge = this.calculateAge(birthDate);
        const monthsUntilBirthday = this.monthsUntilNextBirthday(birthDate);
        const nextAge = currentAge + 1;

        // Find current group config
        const currentConfig = ageGroupConfigs.find((c) => c.group === currentGroup);
        if (!currentConfig) return false;

        // Check if next age would be in a different group
        const nextGroup = this.determineAgeGroup(nextAge, ageGroupConfigs);
        if (!nextGroup || nextGroup === currentGroup) return false;

        // Check if within threshold
        return monthsUntilBirthday <= thresholdMonths;
    }

    /**
     * Get next age group
     */
    static getNextAgeGroup(
        currentGroup: AgeGroup,
        ageGroupConfigs: AgeGroupConfig[],
    ): AgeGroup | null {
        const groupOrder = [AgeGroup.A, AgeGroup.B, AgeGroup.C, AgeGroup.D];
        const currentIndex = groupOrder.indexOf(currentGroup);

        if (currentIndex === -1 || currentIndex === groupOrder.length - 1) {
            return null;
        }

        return groupOrder[currentIndex + 1];
    }
}
