export const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_IDS;

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  javascript: 'JavaScript (Node.js)',
  python: 'Python 3',
};

export const DOCKER_IMAGE_MAP: Record<
  SupportedLanguage,
  { image: string; runtime: string; extension: string }
> = {
  python: {
    image: 'python:3.10-alpine',
    runtime: 'python3 /tmp/solution.py',
    extension: 'py',
  },
  javascript: {
    image: 'node:18-alpine',
    runtime: 'node /tmp/solution.js',
    extension: 'js',
  },
};

export const DEFAULT_TIMEOUT = 10000; // 10 seconds
export const MAX_MEMORY = 256000;     // 256MB
