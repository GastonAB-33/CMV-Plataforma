import { Cell, Proceso } from '../../types';
import { BrotherId } from '../hermanos/types';

export const SEGUIMIENTO_STAGE_ORDER: Proceso[] = [
  Proceso.ALTAR,
  Proceso.GRUPO,
  Proceso.EXPERIENCIA,
  Proceso.EDDI,
  Proceso.DISCIPULO,
];

export type StageStatus = 'completed' | 'in-progress' | 'pending';

export const getStageStatusByOrder = (currentStage: Proceso, stage: Proceso): StageStatus => {
  const stageIndex = SEGUIMIENTO_STAGE_ORDER.indexOf(stage);
  const currentIndex = SEGUIMIENTO_STAGE_ORDER.indexOf(currentStage);

  if (stageIndex < currentIndex) {
    return 'completed';
  }
  if (stageIndex === currentIndex) {
    return 'in-progress';
  }
  return 'pending';
};

export interface StageDates {
  startDate?: string;
  endDate?: string;
}

export type StageDatesByProcess = Record<Proceso, StageDates>;
export type StageStatusByProcess = Record<Proceso, StageStatus>;

export interface BrotherProcessSnapshot {
  brotherId: BrotherId;
  brotherName: string;
  cellName: Cell;
  currentProcess: Proceso;
  stageDatesByProcess: StageDatesByProcess;
}

export interface BrotherProcessStageState {
  process: Proceso;
  status: StageStatus;
  isCurrent: boolean;
  dates: StageDates;
}

export interface BrotherProcessTracking {
  brotherId: BrotherId;
  brotherName: string;
  cellName: Cell;
  currentProcess: Proceso;
  stages: BrotherProcessStageState[];
}

export interface SeguimientoMatrixRow {
  brotherId: BrotherId;
  brotherName: string;
  cellName: Cell;
  currentProcess: Proceso;
  stageStatusByProcess: StageStatusByProcess;
}

export interface SeguimientoRepository {
  listProcessSnapshots(): BrotherProcessSnapshot[];
  findProcessSnapshotByBrotherId(brotherId: BrotherId): BrotherProcessSnapshot | undefined;
}
