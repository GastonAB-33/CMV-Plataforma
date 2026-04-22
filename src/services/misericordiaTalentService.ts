import { Role } from '../types';

export type MisericordiaSkillTag = 'COCINA' | 'PREPARACION' | 'REPARTO' | 'EVANGELISMO';

export const MISERICORDIA_SKILL_TAGS: MisericordiaSkillTag[] = ['COCINA', 'PREPARACION', 'REPARTO', 'EVANGELISMO'];

export const MISERICORDIA_SKILL_LABELS: Record<MisericordiaSkillTag, string> = {
  COCINA: 'Cocina',
  PREPARACION: 'Preparacion',
  REPARTO: 'Reparto',
  EVANGELISMO: 'Evangelismo',
};

export interface BrotherMisericordiaProfile {
  brotherId: string;
  tags: MisericordiaSkillTag[];
  isActiveInMisericordia: boolean;
  updatedAt: string;
  updatedByRole: Role;
}

const STORAGE_KEY = 'cmv_misericordia_talent_profiles_v1';

let memoryProfiles: Record<string, BrotherMisericordiaProfile> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTags = (tags: MisericordiaSkillTag[]): MisericordiaSkillTag[] => {
  const unique = new Set<MisericordiaSkillTag>();
  for (const tag of tags) {
    if (MISERICORDIA_SKILL_TAGS.includes(tag)) {
      unique.add(tag);
    }
  }
  return Array.from(unique);
};

const readProfiles = (): Record<string, BrotherMisericordiaProfile> => {
  if (!canUseStorage()) {
    return { ...memoryProfiles };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, BrotherMisericordiaProfile>;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const normalizedEntries: Array<[string, BrotherMisericordiaProfile]> = Object.entries(parsed).map(([id, profile]) => [
      id,
      {
        brotherId: profile.brotherId || id,
        tags: normalizeTags(profile.tags ?? []),
        isActiveInMisericordia: Boolean(profile.isActiveInMisericordia),
        updatedAt: profile.updatedAt || new Date().toISOString(),
        updatedByRole: profile.updatedByRole ?? Role.PASTOR,
      },
    ]);

    return Object.fromEntries(normalizedEntries);
  } catch {
    return {};
  }
};

const writeProfiles = (next: Record<string, BrotherMisericordiaProfile>) => {
  memoryProfiles = { ...next };

  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const upsertProfile = (
  brotherId: string,
  updater: (previous: BrotherMisericordiaProfile | undefined) => BrotherMisericordiaProfile
): BrotherMisericordiaProfile => {
  const current = readProfiles();
  const updated = updater(current[brotherId]);
  const next = {
    ...current,
    [brotherId]: updated,
  };
  writeProfiles(next);
  return updated;
};

export const misericordiaTalentService = {
  listProfiles(): BrotherMisericordiaProfile[] {
    return Object.values(readProfiles()).sort((left, right) => left.brotherId.localeCompare(right.brotherId));
  },

  getProfile(brotherId: string): BrotherMisericordiaProfile | undefined {
    return readProfiles()[brotherId];
  },

  getTagsForBrother(brotherId: string): MisericordiaSkillTag[] {
    return readProfiles()[brotherId]?.tags ?? [];
  },

  setTagsForBrother(brotherId: string, tags: MisericordiaSkillTag[], actorRole: Role): BrotherMisericordiaProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: normalizeTags(tags),
      isActiveInMisericordia: previous?.isActiveInMisericordia ?? false,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },

  setActiveMinistryMember(brotherId: string, isActive: boolean, actorRole: Role): BrotherMisericordiaProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: previous?.tags ?? [],
      isActiveInMisericordia: isActive,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },

  isBrotherActiveMember(brotherId: string): boolean {
    return Boolean(readProfiles()[brotherId]?.isActiveInMisericordia);
  },
};
