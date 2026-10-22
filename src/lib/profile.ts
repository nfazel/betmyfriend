export type ProfileFields = {
  displayName: string;
  age: number;
  location: string;
  interests: string[];
};

export type ProfileInput = {
  displayName?: unknown;
  age?: unknown;
  location?: unknown;
  interests?: unknown;
};

export function parseInterests(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function validateProfile(input: ProfileInput): { valid: true; data: ProfileFields } | { valid: false; error: string } {
  const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
  const location = typeof input.location === 'string' ? input.location.trim() : '';
  const age = typeof input.age === 'number' ? input.age : Number(input.age);
  const interests = parseInterests(input.interests);

  if (!displayName) {
    return { valid: false, error: 'Display name is required.' };
  }
  if (!Number.isInteger(age) || age < 18 || age > 120) {
    return { valid: false, error: 'Age must be a whole number between 18 and 120.' };
  }
  if (!location) {
    return { valid: false, error: 'Location is required.' };
  }
  if (interests.length === 0) {
    return { valid: false, error: 'Add at least one interest.' };
  }

  return {
    valid: true,
    data: { displayName, age, location, interests },
  };
}

export function isProfileComplete(profile: {
  displayName?: string | null;
  age?: number | null;
  location?: string | null;
  interests?: string[] | null;
} | null): boolean {
  if (!profile) return false;
  if (!profile.displayName?.trim()) return false;
  if (typeof profile.age !== 'number' || !Number.isInteger(profile.age)) return false;
  if (!profile.location?.trim()) return false;
  if (!Array.isArray(profile.interests) || profile.interests.length === 0) return false;
  return true;
}
