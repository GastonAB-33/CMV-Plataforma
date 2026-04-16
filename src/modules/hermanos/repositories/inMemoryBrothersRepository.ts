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

export class InMemoryBrothersRepository implements BrothersRepository {
  private readonly brothers: BrotherProfile[];

  constructor(seed: Brother[] = MOCK_BROTHERS) {
    this.brothers = seed.map(normalizeBrother);
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
}
