import { Proceso } from '../../../types';
import { hermanosModuleService } from '../../hermanos/services/hermanosModuleService';
import { BrotherProfile } from '../../hermanos/types';
import { EDEMGradeEntry, EDEMRepository, EDEMStageSnapshot } from '../types';

const toGradeEntries = (brother: BrotherProfile): EDEMGradeEntry[] =>
  (brother.edem?.notasExamenes ?? []).map((grade) => ({
    id: grade.id,
    brotherId: brother.id,
    materia: grade.materia,
    modulo: grade.modulo,
    fecha: grade.fecha,
    nota: grade.nota,
    estado: grade.estado,
    observacion: grade.observacion,
  }));

const toStageSnapshot = (brother: BrotherProfile): EDEMStageSnapshot => ({
  brotherId: brother.id,
  currentProcess: brother.procesoActual,
  fechaInicio: brother.edem?.fechaInicio,
  fechaFin: brother.edem?.fechaFin,
  grades: toGradeEntries(brother),
});

const cloneGradeEntries = (grades: EDEMGradeEntry[]): EDEMGradeEntry[] =>
  grades.map((grade) => ({ ...grade }));

const cloneStageSnapshot = (snapshot: EDEMStageSnapshot): EDEMStageSnapshot => ({
  ...snapshot,
  grades: cloneGradeEntries(snapshot.grades),
});

export class InMemoryEdemRepository implements EDEMRepository {
  listStageSnapshots(): EDEMStageSnapshot[] {
    return hermanosModuleService
      .list()
      .filter((brother) => brother.procesoActual === Proceso.EDEM || Boolean(brother.edem))
      .map(toStageSnapshot)
      .map(cloneStageSnapshot);
  }

  findStageSnapshotByBrotherId(brotherId: string): EDEMStageSnapshot | undefined {
    const snapshot = this.listStageSnapshots().find((entry) => entry.brotherId === brotherId);
    return snapshot ? cloneStageSnapshot(snapshot) : undefined;
  }
}
