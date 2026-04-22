import { Role } from '../types';

export type MusicalSkillTag = 'CANTANTE' | 'GUITARRISTA' | 'BAJISTA' | 'PIANISTA' | 'BATERISTA';

export const MUSICAL_SKILL_TAGS: MusicalSkillTag[] = ['CANTANTE', 'GUITARRISTA', 'BAJISTA', 'PIANISTA', 'BATERISTA'];

export const MUSICAL_SKILL_LABELS: Record<MusicalSkillTag, string> = {
  CANTANTE: 'Cantante',
  GUITARRISTA: 'Guitarrista',
  BAJISTA: 'Bajista',
  PIANISTA: 'Pianista',
  BATERISTA: 'Baterista',
};

export interface BrotherMusicalProfile {
  brotherId: string;
  tags: MusicalSkillTag[];
  isActiveInWorship: boolean;
  updatedAt: string;
  updatedByRole: Role;
}

const STORAGE_KEY = 'cmv_worship_talent_profiles_v1';

let memoryProfiles: Record<string, BrotherMusicalProfile> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTags = (tags: MusicalSkillTag[]): MusicalSkillTag[] => {
  const unique = new Set<MusicalSkillTag>();
  for (const tag of tags) {
    if (MUSICAL_SKILL_TAGS.includes(tag)) {
      unique.add(tag);
    }
  }
  return Array.from(unique);
};

const readProfiles = (): Record<string, BrotherMusicalProfile> => {
  if (!canUseStorage()) {
    return { ...memoryProfiles };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, BrotherMusicalProfile>;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const normalizedEntries: Array<[string, BrotherMusicalProfile]> = Object.entries(parsed).map(([id, profile]) => [
      id,
      {
        brotherId: profile.brotherId || id,
        tags: normalizeTags(profile.tags ?? []),
        isActiveInWorship: Boolean(profile.isActiveInWorship),
        updatedAt: profile.updatedAt || new Date().toISOString(),
        updatedByRole: profile.updatedByRole ?? Role.PASTOR,
      },
    ]);

    return Object.fromEntries(normalizedEntries);
  } catch {
    return {};
  }
};

const writeProfiles = (next: Record<string, BrotherMusicalProfile>) => {
  memoryProfiles = { ...next };

  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const upsertProfile = (
  brotherId: string,
  updater: (previous: BrotherMusicalProfile | undefined) => BrotherMusicalProfile
): BrotherMusicalProfile => {
  const current = readProfiles();
  const updated = updater(current[brotherId]);
  const next = {
    ...current,
    [brotherId]: updated,
  };
  writeProfiles(next);
  return updated;
};

export const worshipTalentService = {
  listProfiles(): BrotherMusicalProfile[] {
    return Object.values(readProfiles()).sort((left, right) => left.brotherId.localeCompare(right.brotherId));
  },

  getProfile(brotherId: string): BrotherMusicalProfile | undefined {
    return readProfiles()[brotherId];
  },

  getTagsForBrother(brotherId: string): MusicalSkillTag[] {
    return readProfiles()[brotherId]?.tags ?? [];
  },

  setTagsForBrother(brotherId: string, tags: MusicalSkillTag[], actorRole: Role): BrotherMusicalProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: normalizeTags(tags),
      isActiveInWorship: previous?.isActiveInWorship ?? false,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },

  setActiveMinistryMember(brotherId: string, isActive: boolean, actorRole: Role): BrotherMusicalProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: previous?.tags ?? [],
      isActiveInWorship: isActive,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },

  isBrotherActiveMember(brotherId: string): boolean {
    return Boolean(readProfiles()[brotherId]?.isActiveInWorship);
  },
};

