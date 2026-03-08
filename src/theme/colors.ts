export const colors = {
    'main-bg': '#181A1B',
    'tabs-bg': '#242526',
    'tabs-border-color': '#3A3A3A',
    'text-color': '#FFFFFF',
    'card-bg': '#1D1E21',
    'card-border-color': '#202024',
} as const;

export type AppColorName = keyof typeof colors;
