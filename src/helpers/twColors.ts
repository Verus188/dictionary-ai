import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const full = resolveConfig(tailwindConfig as any);

export const twColors: Record<string, string> =
  (full?.theme as any)?.colors ?? {};

export const getColor = (name: string, fallback?: string) =>
  twColors[name] ?? fallback ?? name;
