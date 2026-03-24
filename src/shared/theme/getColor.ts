import type { AppColorName } from '@/src/shared/theme/colors';
import { colors } from '@/src/shared/theme/colors';

export const getColor = (name: string, fallback?: string) =>
    colors[name as AppColorName] ?? fallback ?? name;
