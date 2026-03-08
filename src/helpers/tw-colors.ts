import { colors } from '@/src/theme/colors';
import type { AppColorName } from '@/src/theme/colors';

export const twColors: Record<AppColorName, string> = { ...colors };

export const getColor = (name: string, fallback?: string) =>
    twColors[name as AppColorName] ?? fallback ?? name;
