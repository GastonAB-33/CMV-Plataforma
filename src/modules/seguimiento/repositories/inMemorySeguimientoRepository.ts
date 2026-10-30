import { Proceso } from '../../../types';
import { hermanosModuleService } from '../../hermanos/services/hermanosModuleService';
import { BrotherProfile } from '../../hermanos/types';
import { BrotherProcessSnapshot, SeguimientoRepository, StageDatesByProcess } from '../types';
import { stageProgressionService } from '../../../services/stageProgressionService';

const toStageDatesByProcess = (brother: BrotherProfile): StageDatesByProcess => ({
  [Proceso.ALTAR]: {
    startDate: brother.altar?.fechaInicio,
    endDate: brother.altar?.fechaFin,
  },
  [Proceso.GRUPO]: {
    startDate: brother.grupo?.fechaInicio,
    endDate: brother.grupo?.fechaFin,
  },
  [Proceso.EXPERIENCIA]: {
    startDate: brother.experiencia?.fechaRealizacion,
  },
  [Proceso.EDDI]: {
    startDate: brother.eddi?.fechaInicio,
    endDate: brother.eddi?.fechaFin,
  },
  [Proceso.DISCIPULO]: {
    startDate: brother.discipulo?.fechaInicio,
  },
  [Proceso.EDDI2]: {
    startDate: brother.eddi2?.fechaInicio,
    endDate: brother.eddi2?.fechaFin,
  },
  [Proceso.EDDI3]: {
    startDate: brother.eddi3?.fechaInicio,
    endDate: brother.eddi3?.fechaFin,
  },
  [Proceso.LIDER_CELULA]: {
    startDate: brother.liderCelula?.fechaInicio,
    endDate: brother.liderCelula?.fechaFin,
  },
  [Proceso.EDEM]: {
    startDate: brother.edem?.fechaInicio,
    endDate: brother.edem?.fechaFin,
  },
});

const cloneStageDatesByProcess = (stageDatesByProcess: StageDatesByProcess): StageDatesByProcess => ({
  [Proceso.ALTAR]: { ...stageDatesByProcess[Proceso.ALTAR] },
  [Proceso.GRUPO]: { ...stageDatesByProcess[Proceso.GRUPO] },
  [Proceso.EXPERIENCIA]: { ...stageDatesByProcess[Proceso.EXPERIENCIA] },
  [Proceso.EDDI]: { ...stageDatesByProcess[Proceso.EDDI] },
  [Proceso.DISCIPULO]: { ...stageDatesByProcess[Proceso.DISCIPULO] },
  [Proceso.EDDI2]: { ...stageDatesByProcess[Proceso.EDDI2] },
  [Proceso.EDDI3]: { ...stageDatesByProcess[Proceso.EDDI3] },
  [Proceso.LIDER_CELULA]: { ...stageDatesByProcess[Proceso.LIDER_CELULA] },
  [Proceso.EDEM]: { ...stageDatesByProcess[Proceso.EDEM] },
});

const cloneSnapshot = (snapshot: BrotherProcessSnapshot): BrotherProcessSnapshot => ({
  ...snapshot,
  stageDatesByProcess: cloneStageDatesByProcess(snapshot.stageDatesByProcess),
});

const toSnapshot = (brother: BrotherProfile): BrotherProcessSnapshot => ({
  brotherId: brother.id,
  brotherName: brother.name,
  cellName: brother.acompanamiento.celulaName,
  currentProcess: stageProgressionService.resolveProcess(brother),
  stageDatesByProcess: toStageDatesByProcess(brother),
});

export class InMemorySeguimientoRepository implements SeguimientoRepository {
  listProcessSnapshots(): BrotherProcessSnapshot[] {
    return hermanosModuleService.list().map(toSnapshot).map(cloneSnapshot);
  }

  findProcessSnapshotByBrotherId(brotherId: string): BrotherProcessSnapshot | undefined {
    const snapshot = this.listProcessSnapshots().find((entry) => entry.brotherId === brotherId);
    return snapshot ? cloneSnapshot(snapshot) : undefined;
  }
}
