export type EmailThemeTokens = {
    bg: string;
    surface: string;
    surface2: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
};

export type EmailTemplateThemeId = 'golden' | 'cobalt' | 'tide';

export const EMAIL_TEMPLATE_THEMES: Record<EmailTemplateThemeId, EmailThemeTokens> = {
    golden: {
        bg: '#FBF7EF',
        surface: '#FFFFFF',
        surface2: '#F6EFE4',
        text: '#1F2937',
        muted: '#6B7280',
        border: '#E9E2D6',
        primary: '#C98E0D',
        secondary: '#2563EB',
        accent: '#F1E2B8',
    },
    cobalt: {
        bg: '#F4F6FB',
        surface: '#FFFFFF',
        surface2: '#EEF2FA',
        text: '#111827',
        muted: '#6B7280',
        border: '#E5E7EB',
        primary: '#1D4ED8',
        secondary: '#FB7185',
        accent: '#DBE4FF',
    },
    tide: {
        bg: '#F7F2EA',
        surface: '#FFFFFF',
        surface2: '#F1ECE4',
        text: '#1F2937',
        muted: '#6B7280',
        border: '#E7E0D7',
        primary: '#0F766E',
        secondary: '#F97316',
        accent: '#FCE8D2',
    },
};

export const DEFAULT_EMAIL_TEMPLATE_THEME: EmailTemplateThemeId = 'golden';

export function isEmailTemplateTheme(value: string): value is EmailTemplateThemeId {
    return Object.prototype.hasOwnProperty.call(EMAIL_TEMPLATE_THEMES, value);
}

export function getEmailThemeTokens(theme: EmailTemplateThemeId) {
    return EMAIL_TEMPLATE_THEMES[theme];
}
