import { Proceso } from '../../../types';
import { hermanosModuleService } from '../../hermanos/services/hermanosModuleService';
import { BrotherProfile } from '../../hermanos/types';
import { EDDIGradeEntry, EDDIRepository, EDDIStageSnapshot } from '../types';

const toGradeEntries = (brother: BrotherProfile): EDDIGradeEntry[] =>
  (brother.eddi?.notasExamenes ?? []).map((grade) => ({
    id: grade.id,
    brotherId: brother.id,
    materia: grade.materia,
    modulo: grade.modulo,
    fecha: grade.fecha,
    nota: grade.nota,
    estado: grade.estado,
    observacion: grade.observacion,
  }));

const toStageSnapshot = (brother: BrotherProfile): EDDIStageSnapshot => ({
  brotherId: brother.id,
  currentProcess: brother.procesoActual,
  fechaInicio: brother.eddi?.fechaInicio,
  fechaFin: brother.eddi?.fechaFin,
  grades: toGradeEntries(brother),
});

const cloneGradeEntries = (grades: EDDIGradeEntry[]): EDDIGradeEntry[] =>
  grades.map((grade) => ({ ...grade }));

const cloneStageSnapshot = (snapshot: EDDIStageSnapshot): EDDIStageSnapshot => ({
  ...snapshot,
  grades: cloneGradeEntries(snapshot.grades),
});

export class InMemoryEddiRepository implements EDDIRepository {
  listStageSnapshots(): EDDIStageSnapshot[] {
    return hermanosModuleService
      .list()
      .filter((brother) => brother.procesoActual === Proceso.EDDI || brother.procesoActual === Proceso.DISCIPULO || Boolean(brother.eddi))
      .map(toStageSnapshot)
      .map(cloneStageSnapshot);
  }

  findStageSnapshotByBrotherId(brotherId: string): EDDIStageSnapshot | undefined {
    const snapshot = this.listStageSnapshots().find((entry) => entry.brotherId === brotherId);
    return snapshot ? cloneStageSnapshot(snapshot) : undefined;
  }
}
