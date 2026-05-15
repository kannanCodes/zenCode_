const STORAGE_KEY = 'zencode_admin_mentor_expertise_options';

export const DEFAULT_EXPERTISE_OPTIONS = [
  'DSA',
  'Frontend',
  'Backend',
  'System Design',
] as const;

const normalize = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

export function loadExpertiseOptions(): string[] {
  const base = [...DEFAULT_EXPERTISE_OPTIONS];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return base;

    const extras: string[] = [];
    const seen = new Set(base.map((x) => x.toLowerCase()));

    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const v = normalize(item);
      if (!v) continue;
      if (v.length > 40) continue;
      const key = v.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      extras.push(v);
    }

    return [...base, ...extras];
  } catch {
    return base;
  }
}

export function persistExpertiseOptions(options: string[]): void {
  const baseSet = new Set(DEFAULT_EXPERTISE_OPTIONS.map((x) => x.toLowerCase()));
  const extras = options
    .map(normalize)
    .filter(Boolean)
    .filter((x) => x.length <= 40)
    .filter((x) => !baseSet.has(x.toLowerCase()));

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const item of extras) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
}

export function addExpertiseOption(option: string): string[] {
  const v = normalize(option);
  if (!v) return loadExpertiseOptions();

  const current = loadExpertiseOptions();
  const exists = current.some((x) => x.toLowerCase() === v.toLowerCase());
  if (exists) return current;

  const next = [...current, v];
  persistExpertiseOptions(next);
  return next;
}

export function removeExpertiseOption(option: string): string[] {
  const v = normalize(option);
  if (!v) return loadExpertiseOptions();

  const baseSet = new Set(DEFAULT_EXPERTISE_OPTIONS.map((x) => x.toLowerCase()));
  if (baseSet.has(v.toLowerCase())) {
    // Never remove built-in options
    return loadExpertiseOptions();
  }

  const current = loadExpertiseOptions();
  const next = current.filter((x) => x.toLowerCase() !== v.toLowerCase());
  persistExpertiseOptions(next);
  return next;
}


