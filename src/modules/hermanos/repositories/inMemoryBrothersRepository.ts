import { MOCK_BROTHERS } from '../../../data/mocks';
import { Brother } from '../../../types';
import { BrotherId, BrotherProfile, BrothersRepository } from '../types';

const cloneObservations = (observations: BrotherProfile['observations']) =>
  observations.map((entry) => ({ ...entry }));

const cloneTimelineObservations = (
  observations: NonNullable<BrotherProfile['altar']>['observaciones'] | undefined
) =>
  observations?.map((entry) => ({
    ...entry,
    author: { ...entry.author },
  }));

const normalizeBrother = (brother: Brother | BrotherProfile): BrotherProfile => ({
  ...brother,
  acompanamiento: { ...brother.acompanamiento },
  altar: brother.altar
    ? {
        ...brother.altar,
        realizadoPor: brother.altar.realizadoPor ? [...brother.altar.realizadoPor] : undefined,
        observaciones: cloneTimelineObservations(brother.altar.observaciones),
      }
    : undefined,
  grupo: brother.grupo
    ? {
        ...brother.grupo,
        observaciones: cloneTimelineObservations(brother.grupo.observaciones),
      }
    : undefined,
  experiencia: brother.experiencia
    ? {
        ...brother.experiencia,
        observaciones: cloneTimelineObservations(brother.experiencia.observaciones),
      }
    : undefined,
  eddi: brother.eddi
    ? {
        ...brother.eddi,
        notasExamenes: brother.eddi.notasExamenes?.map((grade) => ({ ...grade })),
        observaciones: cloneTimelineObservations(brother.eddi.observaciones),
      }
    : undefined,
  discipulo: brother.discipulo
    ? {
        ...brother.discipulo,
        observaciones: cloneTimelineObservations(brother.discipulo.observaciones),
      }
    : undefined,
  observations: cloneObservations(brother.observations ?? []),
  disciples: brother.disciples ? [...brother.disciples] : [],
});

const cloneBrotherProfile = (brother: BrotherProfile): BrotherProfile => normalizeBrother(brother);

const MOCK_STORAGE_KEY = 'cmv_mock_simulated_brothers_v1';

const readSavedMockBrothers = (): BrotherProfile[] => {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeBrother) : [];
  } catch {
    return [];
  }
};

const writeSavedMockBrothers = (brothers: BrotherProfile[]) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const mocks = brothers.filter((b) => b.id.startsWith('mock-altar-'));
    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(mocks));
  } catch {
    // Ignore quota
  }
};

export class InMemoryBrothersRepository implements BrothersRepository {
  private readonly brothers: BrotherProfile[];

  constructor(seed: Brother[] = MOCK_BROTHERS) {
    const seedBrothers = seed.map(normalizeBrother);
    const savedMocks = readSavedMockBrothers();
    const seedIds = new Set(seedBrothers.map((b) => b.id));
    const nonDuplicatedMocks = savedMocks.filter((m) => !seedIds.has(m.id));
    this.brothers = [...seedBrothers, ...nonDuplicatedMocks];
  }

  list(): BrotherProfile[] {
    return this.brothers.map(cloneBrotherProfile);
  }

  findById(id: BrotherId): BrotherProfile | undefined {
    const brother = this.brothers.find((entry) => entry.id === id);
    return brother ? cloneBrotherProfile(brother) : undefined;
  }

  listCells(): BrotherProfile['acompanamiento']['celulaName'][] {
    const uniqueCells = new Set<BrotherProfile['acompanamiento']['celulaName']>();
    for (const brother of this.brothers) {
      uniqueCells.add(brother.acompanamiento.celulaName);
    }
    return Array.from(uniqueCells);
  }

  addBrother(brother: BrotherProfile): void {
    const existingIndex = this.brothers.findIndex((entry) => entry.id === brother.id);
    if (existingIndex >= 0) {
      this.brothers[existingIndex] = cloneBrotherProfile(brother);
    } else {
      this.brothers.push(cloneBrotherProfile(brother));
    }
    writeSavedMockBrothers(this.brothers);
  }

  removeBrother(id: BrotherId): void {
    const index = this.brothers.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      this.brothers.splice(index, 1);
    }
    writeSavedMockBrothers(this.brothers);
  }

  clearMockBrothers(): void {
    const remaining = this.brothers.filter((b) => !b.id.startsWith('mock-altar-'));
    this.brothers.length = 0;
    this.brothers.push(...remaining);
    writeSavedMockBrothers(this.brothers);
  }
}
