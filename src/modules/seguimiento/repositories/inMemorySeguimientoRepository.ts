import { Proceso } from '../../../types';
import { hermanosModuleService } from '../../hermanos/services/hermanosModuleService';
import { BrotherProfile } from '../../hermanos/types';
import { BrotherProcessSnapshot, SeguimientoRepository, StageDatesByProcess } from '../types';

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
});

const cloneStageDatesByProcess = (stageDatesByProcess: StageDatesByProcess): StageDatesByProcess => ({
  [Proceso.ALTAR]: { ...stageDatesByProcess[Proceso.ALTAR] },
  [Proceso.GRUPO]: { ...stageDatesByProcess[Proceso.GRUPO] },
  [Proceso.EXPERIENCIA]: { ...stageDatesByProcess[Proceso.EXPERIENCIA] },
  [Proceso.EDDI]: { ...stageDatesByProcess[Proceso.EDDI] },
  [Proceso.DISCIPULO]: { ...stageDatesByProcess[Proceso.DISCIPULO] },
});

const cloneSnapshot = (snapshot: BrotherProcessSnapshot): BrotherProcessSnapshot => ({
  ...snapshot,
  stageDatesByProcess: cloneStageDatesByProcess(snapshot.stageDatesByProcess),
});

const toSnapshot = (brother: BrotherProfile): BrotherProcessSnapshot => ({
  brotherId: brother.id,
  brotherName: brother.name,
  cellName: brother.acompanamiento.celulaName,
  currentProcess: brother.procesoActual,
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
