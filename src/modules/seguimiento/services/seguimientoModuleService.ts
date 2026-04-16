import { BrotherId } from '../../hermanos/types';
import { Proceso } from '../../../types';
import { InMemorySeguimientoRepository } from '../repositories/inMemorySeguimientoRepository';
import {
  BrotherProcessSnapshot,
  BrotherProcessTracking,
  getStageStatusByOrder,
  SeguimientoMatrixRow,
  SeguimientoRepository,
  SEGUIMIENTO_STAGE_ORDER,
  StageStatus,
  StageStatusByProcess,
} from '../types';

const toStageStatusByProcess = (snapshot: BrotherProcessSnapshot): StageStatusByProcess => ({
  [Proceso.ALTAR]: getStageStatusByOrder(snapshot.currentProcess, Proceso.ALTAR),
  [Proceso.GRUPO]: getStageStatusByOrder(snapshot.currentProcess, Proceso.GRUPO),
  [Proceso.EXPERIENCIA]: getStageStatusByOrder(snapshot.currentProcess, Proceso.EXPERIENCIA),
  [Proceso.EDDI]: getStageStatusByOrder(snapshot.currentProcess, Proceso.EDDI),
  [Proceso.DISCIPULO]: getStageStatusByOrder(snapshot.currentProcess, Proceso.DISCIPULO),
});

const toMatrixRow = (snapshot: BrotherProcessSnapshot): SeguimientoMatrixRow => ({
  brotherId: snapshot.brotherId,
  brotherName: snapshot.brotherName,
  cellName: snapshot.cellName,
  currentProcess: snapshot.currentProcess,
  stageStatusByProcess: toStageStatusByProcess(snapshot),
});

const toTracking = (snapshot: BrotherProcessSnapshot): BrotherProcessTracking => ({
  brotherId: snapshot.brotherId,
  brotherName: snapshot.brotherName,
  cellName: snapshot.cellName,
  currentProcess: snapshot.currentProcess,
  stages: SEGUIMIENTO_STAGE_ORDER.map((process) => ({
    process,
    status: getStageStatusByOrder(snapshot.currentProcess, process),
    isCurrent: process === snapshot.currentProcess,
    dates: { ...snapshot.stageDatesByProcess[process] },
  })),
});

export class SeguimientoModuleService {
  constructor(private readonly repository: SeguimientoRepository) {}

  getStageOrder() {
    return [...SEGUIMIENTO_STAGE_ORDER];
  }

  getStageStatus(currentStage: BrotherProcessSnapshot['currentProcess'], stage: BrotherProcessSnapshot['currentProcess']): StageStatus {
    return getStageStatusByOrder(currentStage, stage);
  }

  listMatrixRows(): SeguimientoMatrixRow[] {
    return this.repository.listProcessSnapshots().map(toMatrixRow);
  }

  listCells(): SeguimientoMatrixRow['cellName'][] {
    const uniqueCells = new Set<SeguimientoMatrixRow['cellName']>();
    for (const row of this.listMatrixRows()) {
      uniqueCells.add(row.cellName);
    }
    return Array.from(uniqueCells);
  }

  findTrackingByBrotherId(brotherId: BrotherId): BrotherProcessTracking | undefined {
    const snapshot = this.repository.findProcessSnapshotByBrotherId(brotherId);
    return snapshot ? toTracking(snapshot) : undefined;
  }

  listTracking(): BrotherProcessTracking[] {
    return this.repository.listProcessSnapshots().map(toTracking);
  }

  getCurrentProcess(brotherId: BrotherId): BrotherProcessSnapshot['currentProcess'] | undefined {
    return this.repository.findProcessSnapshotByBrotherId(brotherId)?.currentProcess;
  }

  getStageDates(brotherId: BrotherId) {
    const snapshot = this.repository.findProcessSnapshotByBrotherId(brotherId);
    if (!snapshot) {
      return undefined;
    }
    return {
      ...snapshot.stageDatesByProcess,
    };
  }

  async listMatrixRowsAsync(): Promise<SeguimientoMatrixRow[]> {
    return this.listMatrixRows();
  }

  async findTrackingByBrotherIdAsync(brotherId: BrotherId): Promise<BrotherProcessTracking | undefined> {
    return this.findTrackingByBrotherId(brotherId);
  }
}

const seguimientoRepository = new InMemorySeguimientoRepository();

export const seguimientoModuleService = new SeguimientoModuleService(seguimientoRepository);
