export const colors = {
    'main-bg': '#181A1B',
    'tabs-bg': '#242526',
    'tabs-border-color': '#3A3A3A',
    'text-color': '#FFFFFF',
    'card-bg': '#1D1E21',
    'card-border-color': '#202024',
    'accent-color': '#60A5FA',
    'accent-color-strong': '#3B82F6',
    'accent-border-color': '#BFDBFE',
    'warning-color': '#FB923C',
    'neutral-button-bg': '#4B5563',
    'neutral-button-border': '#9CA3AF',
    'not-found-text-color': '#D8B4FE',
    'not-found-border-color': '#C084FC',
    'not-found-bg-color': '#9333EA',
    'overlay-color': 'rgba(0, 0, 0, 0.3)',
    transparent: 'transparent',
} as const;

export type AppColorName = keyof typeof colors;
