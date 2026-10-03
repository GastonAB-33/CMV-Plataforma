import { Proceso } from '../types';
import { BrotherProfile } from '../modules/hermanos/types';
import { altarService, getAltarState } from './altarService';
import { stageDatesService } from './stageDatesService';
import { eddiModuleService } from '../modules/eddi/services/eddiModuleService';
import { edemModuleService } from '../modules/edem/services/edemModuleService';
import { grupoVidaApprovalService } from './grupoVidaApprovalService';
import { liderCelulaApprovalService } from './liderCelulaApprovalService';

export interface StageProgressionInfo {
  brotherId: string;
  currentStageNumber: number; // 1 to 8
  currentProcess: Proceso;
  currentStageName: string;
  currentStageBadgeLabel: string;
  stageStatuses: Record<number, 'COMPLETADA' | 'ACTUAL' | 'BLOQUEADA'>;
  isStageCompleted: (stageNumber: number) => boolean;
  isStageActive: (stageNumber: number) => boolean;
  isStageLocked: (stageNumber: number) => boolean;
  stageCompletionDetails: Record<number, {
    completed: boolean;
    reasonIfIncomplete?: string;
  }>;
}

export const STAGE_NAMES: Record<number, string> = {
  1: 'Altar Familiar',
  2: 'Hermano Menor',
  3: 'EDDI Escuela de Discipulados',
  4: 'Discípulo Conector',
  5: 'Hermano Mayor',
  6: 'Líder de Célula',
  7: 'EDEM Escuela de Entrenamiento Ministerial',
  8: 'Líder Ministerial',
};

export const STAGE_BADGE_LABELS: Record<number, string> = {
  1: 'Altar Familiar (Hermano nuevo)',
  2: 'Hermano menor',
  3: 'EDDI Escuela de Discipulados',
  4: 'Discípulo conector',
  5: 'Hermano mayor',
  6: 'Líder de célula',
  7: 'EDEM Escuela de Entrenamiento Ministerial',
  8: 'Líder ministerial',
};

export const stageProgressionService = {
  /**
   * Resuelve la progresión secuencial estricta de un hermano.
   * Regla de oro: No se puede avanzar a la etapa N si la etapa N-1 no está completada.
   */
  resolveProgression(brother: Pick<BrotherProfile, 'id' | 'name'> & Partial<BrotherProfile>): StageProgressionInfo {
    const brotherId = brother.id;
    const stageDates = stageDatesService.getBrotherStageDates(brotherId);
    const altarInfo = altarService.getAltarInfo(brotherId);
    const eddiTracking = eddiModuleService.getBrotherEddiTracking(brotherId);
    const edemTracking = edemModuleService.getBrotherEdemTracking(brotherId);
    const grupoApproval = grupoVidaApprovalService.getApproval(brotherId);
    const liderApproval = liderCelulaApprovalService.getApproval(brotherId);

    // ETAPA 1: Altar Familiar
    // Requiere fecha de fin y que no esté interrumpido.
    const altarEndDate = altarInfo.fechaFin || brother.altar?.fechaFin;
    const altarStatus = getAltarState(altarInfo);
    const isStage1Complete = Boolean(altarEndDate && altarEndDate.trim() !== '') && !altarInfo.isInterrumpido && altarStatus === 'FINALIZADO';
    let stage1Reason: string | undefined;
    if (!isStage1Complete) {
      if (altarInfo.isInterrumpido) {
        stage1Reason = 'El Altar Familiar se encuentra interrumpido.';
      } else if (!altarEndDate || altarEndDate.trim() === '') {
        stage1Reason = 'Falta registrar la fecha de finalización del Altar Familiar.';
      } else {
        stage1Reason = 'El Altar Familiar aún no está finalizado.';
      }
    }

    // ETAPA 2: Hermano Menor (Experiencia Transformadora + Grupo de Vida)
    // Requiere Etapa 1 completada + Experiencia realizada + Grupo de Vida finalizado (no interrumpido)
    const expDate = stageDates?.experienciaFechaRealizacion || brother.experiencia?.fechaRealizacion;
    const hasExperiencia = Boolean(expDate && expDate.trim() !== '');

    const grupoEndDate = stageDates?.grupoFechaFin || brother.grupo?.fechaFin || brother.eddi?.fechaInicio || eddiTracking.stageDates.startDate;
    const isGrupoInterrumpido = Boolean(stageDates?.grupoInterrumpido || brother.grupo?.interrumpido);
    const hasGrupoFinalizado = Boolean(grupoEndDate && grupoEndDate.trim() !== '') && !isGrupoInterrumpido;

    const isStage2Complete = isStage1Complete && hasExperiencia && hasGrupoFinalizado;
    let stage2Reason: string | undefined;
    if (!isStage1Complete) {
      stage2Reason = 'Requiere completar la Etapa 1 (Altar Familiar).';
    } else if (isGrupoInterrumpido) {
      stage2Reason = 'El Grupo de Vida se encuentra interrumpido.';
    } else if (!hasExperiencia && !hasGrupoFinalizado) {
      stage2Reason = 'Falta realizar la Experiencia Transformadora y finalizar Grupo de Vida.';
    } else if (!hasExperiencia) {
      stage2Reason = 'Falta registrar la fecha de la Experiencia Transformadora.';
    } else if (!hasGrupoFinalizado) {
      stage2Reason = 'Falta registrar la fecha de finalización del Grupo de Vida.';
    }

    // ETAPA 3: EDDI Escuela de Discipulados
    // Requiere Etapa 2 completada + fecha de fin de EDDI registrada
    const eddiEndDate = stageDates?.eddiFechaFin || brother.eddi?.fechaFin || eddiTracking.stageDates.endDate;
    const hasEddiFinalizado = Boolean(eddiEndDate && eddiEndDate.trim() !== '');

    const isStage3Complete = isStage2Complete && hasEddiFinalizado;
    let stage3Reason: string | undefined;
    if (!isStage2Complete) {
      stage3Reason = 'Requiere completar la Etapa 2 (Hermano Menor).';
    } else if (!hasEddiFinalizado) {
      stage3Reason = 'Falta registrar la fecha de finalización de EDDI.';
    }

    // ETAPA 4: Discípulo Conector
    // Requiere Etapa 3 completada + Aprobación de Grupo de Vida (o fecha fin discípulo)
    const hasDiscipuloApproved = grupoApproval.isAprobado || Boolean(stageDates?.discipuloFechaFin && stageDates.discipuloFechaFin.trim() !== '');

    const isStage4Complete = isStage3Complete && hasDiscipuloApproved;
    let stage4Reason: string | undefined;
    if (!isStage3Complete) {
      stage4Reason = 'Requiere completar la Etapa 3 (EDDI).';
    } else if (!hasDiscipuloApproved) {
      stage4Reason = 'Falta habilitación / aprobación para apertura de Grupo de Vida.';
    }

    // ETAPA 5: Hermano Mayor
    // Requiere Etapa 4 completada + Aprobación de Líder de Célula (o fecha fin hermano mayor)
    const hasHermanoMayorApproved = liderApproval.isAprobado || Boolean(stageDates?.hermanoMayorFechaFin && stageDates.hermanoMayorFechaFin.trim() !== '');

    const isStage5Complete = isStage4Complete && hasHermanoMayorApproved;
    let stage5Reason: string | undefined;
    if (!isStage4Complete) {
      stage5Reason = 'Requiere completar la Etapa 4 (Discípulo Conector).';
    } else if (!hasHermanoMayorApproved) {
      stage5Reason = 'Falta aprobación ministerial como Líder de Célula.';
    }

    // ETAPA 6: Líder de Célula
    // Requiere Etapa 5 completada + Inicio de cursada EDEM (o fin de liderazgo inicial de célula)
    const edemStartDate = stageDates?.edemFechaInicio || brother.edem?.fechaInicio || edemTracking.stageDates.startDate || stageDates?.liderCelulaFechaFin;
    const hasLiderCelulaComplete = Boolean(edemStartDate && edemStartDate.trim() !== '');

    const isStage6Complete = isStage5Complete && hasLiderCelulaComplete;
    let stage6Reason: string | undefined;
    if (!isStage5Complete) {
      stage6Reason = 'Requiere completar la Etapa 5 (Hermano Mayor).';
    } else if (!hasLiderCelulaComplete) {
      stage6Reason = 'Falta registrar inicio de Escuela EDEM.';
    }

    // ETAPA 7: EDEM Escuela de Entrenamiento Ministerial
    // Requiere Etapa 6 completada + Fin de cursada EDEM
    const edemEndDate = stageDates?.edemFechaFin || brother.edem?.fechaFin || edemTracking.stageDates.endDate;
    const hasEdemComplete = Boolean(edemEndDate && edemEndDate.trim() !== '');

    const isStage7Complete = isStage6Complete && hasEdemComplete;
    let stage7Reason: string | undefined;
    if (!isStage6Complete) {
      stage7Reason = 'Requiere completar la Etapa 6 (Líder de Célula).';
    } else if (!hasEdemComplete) {
      stage7Reason = 'Falta registrar la fecha de finalización de EDEM.';
    }

    // ETAPA 8: Líder Ministerial
    // Requiere Etapa 7 completada + Ministerio asignado
    const hasMinisterioAsignado = Boolean(stageDates?.ministerioAsignado);
    const isStage8Complete = isStage7Complete && hasMinisterioAsignado;
    let stage8Reason: string | undefined;
    if (!isStage7Complete) {
      stage8Reason = 'Requiere completar la Etapa 7 (EDEM).';
    } else if (!hasMinisterioAsignado) {
      stage8Reason = 'Falta asignación de alguno de los 5 ministerios.';
    }

    // Determinar la etapa actual (primera etapa que NO esté completada, del 1 al 8)
    let currentStageNumber = 1;
    if (!isStage1Complete) {
      currentStageNumber = 1;
    } else if (!isStage2Complete) {
      currentStageNumber = 2;
    } else if (!isStage3Complete) {
      currentStageNumber = 3;
    } else if (!isStage4Complete) {
      currentStageNumber = 4;
    } else if (!isStage5Complete) {
      currentStageNumber = 5;
    } else if (!isStage6Complete) {
      currentStageNumber = 6;
    } else if (!isStage7Complete) {
      currentStageNumber = 7;
    } else {
      currentStageNumber = 8;
    }

    // Mapeo a enum Proceso para compatibilidad con el resto del sistema
    const currentProcessByStage: Record<number, Proceso> = {
      1: Proceso.ALTAR,
      2: Proceso.GRUPO,
      3: Proceso.EDDI,
      4: Proceso.DISCIPULO,
      5: Proceso.DISCIPULO,
      6: Proceso.DISCIPULO,
      7: Proceso.EDEM,
      8: Proceso.EDEM,
    };

    const completionMap: Record<number, boolean> = {
      1: isStage1Complete,
      2: isStage2Complete,
      3: isStage3Complete,
      4: isStage4Complete,
      5: isStage5Complete,
      6: isStage6Complete,
      7: isStage7Complete,
      8: isStage8Complete,
    };

    const reasonsMap: Record<number, string | undefined> = {
      1: stage1Reason,
      2: stage2Reason,
      3: stage3Reason,
      4: stage4Reason,
      5: stage5Reason,
      6: stage6Reason,
      7: stage7Reason,
      8: stage8Reason,
    };

    const stageStatuses: Record<number, 'COMPLETADA' | 'ACTUAL' | 'BLOQUEADA'> = {
      1: isStage1Complete ? 'COMPLETADA' : currentStageNumber === 1 ? 'ACTUAL' : 'BLOQUEADA',
      2: isStage2Complete ? 'COMPLETADA' : currentStageNumber === 2 ? 'ACTUAL' : 'BLOQUEADA',
      3: isStage3Complete ? 'COMPLETADA' : currentStageNumber === 3 ? 'ACTUAL' : 'BLOQUEADA',
      4: isStage4Complete ? 'COMPLETADA' : currentStageNumber === 4 ? 'ACTUAL' : 'BLOQUEADA',
      5: isStage5Complete ? 'COMPLETADA' : currentStageNumber === 5 ? 'ACTUAL' : 'BLOQUEADA',
      6: isStage6Complete ? 'COMPLETADA' : currentStageNumber === 6 ? 'ACTUAL' : 'BLOQUEADA',
      7: isStage7Complete ? 'COMPLETADA' : currentStageNumber === 7 ? 'ACTUAL' : 'BLOQUEADA',
      8: isStage8Complete ? 'COMPLETADA' : currentStageNumber === 8 ? 'ACTUAL' : 'BLOQUEADA',
    };

    const stageCompletionDetails: StageProgressionInfo['stageCompletionDetails'] = {};
    for (let i = 1; i <= 8; i++) {
      stageCompletionDetails[i] = {
        completed: completionMap[i],
        reasonIfIncomplete: reasonsMap[i],
      };
    }

    const currentStageName = STAGE_NAMES[currentStageNumber] || 'Altar Familiar';
    let currentStageBadgeLabel = STAGE_BADGE_LABELS[currentStageNumber] || 'Hermano nuevo';
    if (currentStageNumber === 8 && stageDates?.ministerioAsignado) {
      currentStageBadgeLabel = `Líder Ministerial (${stageDates.ministerioAsignado})`;
    }

    return {
      brotherId,
      currentStageNumber,
      currentProcess: currentProcessByStage[currentStageNumber],
      currentStageName,
      currentStageBadgeLabel,
      stageStatuses,
      isStageCompleted: (n: number) => Boolean(completionMap[n]),
      isStageActive: (n: number) => currentStageNumber === n,
      isStageLocked: (n: number) => n > currentStageNumber,
      stageCompletionDetails,
    };
  },

  /**
   * Resuelve el Proceso enum correspondiente a la etapa actual calculada.
   */
  resolveProcess(brother: Pick<BrotherProfile, 'id' | 'name'> & Partial<BrotherProfile>): Proceso {
    return this.resolveProgression(brother).currentProcess;
  },

  /**
   * Resuelve la etiqueta para el badge de cabecera.
   */
  resolveBadgeLabel(brother: Pick<BrotherProfile, 'id' | 'name'> & Partial<BrotherProfile>): string {
    return this.resolveProgression(brother).currentStageBadgeLabel;
  }
};
