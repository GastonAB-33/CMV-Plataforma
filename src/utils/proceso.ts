import { Proceso } from '../types';
import { getStageStatusByOrder, SEGUIMIENTO_STAGE_ORDER, StageStatus } from '../modules/seguimiento/types';

export const PROCESO_ORDER: Proceso[] = [...SEGUIMIENTO_STAGE_ORDER];

export type { StageStatus };

export const getStageStatus = (currentStage: Proceso, stageName: Proceso): StageStatus =>
  getStageStatusByOrder(currentStage, stageName);
