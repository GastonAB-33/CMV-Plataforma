import { Role } from '../types';

export type MultimediaSkillTag = 'PROYECCION' | 'LUCES' | 'SONIDO' | 'TRANSMISION';

export const MULTIMEDIA_SKILL_TAGS: MultimediaSkillTag[] = ['PROYECCION', 'LUCES', 'SONIDO', 'TRANSMISION'];

export const MULTIMEDIA_SKILL_LABELS: Record<MultimediaSkillTag, string> = {
  PROYECCION: 'Proyeccion',
  LUCES: 'Luces',
  SONIDO: 'Sonido',
  TRANSMISION: 'Transmision',
};

export interface BrotherMultimediaProfile {
  brotherId: string;
  tags: MultimediaSkillTag[];
  isActiveInMultimedia: boolean;
  updatedAt: string;
  updatedByRole: Role;
}

const STORAGE_KEY = 'cmv_multimedia_talent_profiles_v1';

let memoryProfiles: Record<string, BrotherMultimediaProfile> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const normalizeTags = (tags: MultimediaSkillTag[]): MultimediaSkillTag[] => {
  const unique = new Set<MultimediaSkillTag>();
  for (const tag of tags) {
    if (MULTIMEDIA_SKILL_TAGS.includes(tag)) {
      unique.add(tag);
    }
  }
  return Array.from(unique);
};

const readProfiles = (): Record<string, BrotherMultimediaProfile> => {
  if (!canUseStorage()) {
    return { ...memoryProfiles };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, BrotherMultimediaProfile>;
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const normalizedEntries: Array<[string, BrotherMultimediaProfile]> = Object.entries(parsed).map(([id, profile]) => [
      id,
      {
        brotherId: profile.brotherId || id,
        tags: normalizeTags(profile.tags ?? []),
        isActiveInMultimedia: Boolean(profile.isActiveInMultimedia),
        updatedAt: profile.updatedAt || new Date().toISOString(),
        updatedByRole: profile.updatedByRole ?? Role.PASTOR,
      },
    ]);

    return Object.fromEntries(normalizedEntries);
  } catch {
    return {};
  }
};

const writeProfiles = (next: Record<string, BrotherMultimediaProfile>) => {
  memoryProfiles = { ...next };

  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};

const upsertProfile = (
  brotherId: string,
  updater: (previous: BrotherMultimediaProfile | undefined) => BrotherMultimediaProfile
): BrotherMultimediaProfile => {
  const current = readProfiles();
  const updated = updater(current[brotherId]);
  const next = {
    ...current,
    [brotherId]: updated,
  };
  writeProfiles(next);
  return updated;
};

export const multimediaTalentService = {
  listProfiles(): BrotherMultimediaProfile[] {
    return Object.values(readProfiles()).sort((left, right) => left.brotherId.localeCompare(right.brotherId));
  },

  getProfile(brotherId: string): BrotherMultimediaProfile | undefined {
    return readProfiles()[brotherId];
  },

  getTagsForBrother(brotherId: string): MultimediaSkillTag[] {
    return readProfiles()[brotherId]?.tags ?? [];
  },

  setTagsForBrother(brotherId: string, tags: MultimediaSkillTag[], actorRole: Role): BrotherMultimediaProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: normalizeTags(tags),
      isActiveInMultimedia: previous?.isActiveInMultimedia ?? false,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },

  setActiveMinistryMember(brotherId: string, isActive: boolean, actorRole: Role): BrotherMultimediaProfile {
    return upsertProfile(brotherId, (previous) => ({
      brotherId,
      tags: previous?.tags ?? [],
      isActiveInMultimedia: isActive,
      updatedAt: new Date().toISOString(),
      updatedByRole: actorRole,
    }));
  },
};
