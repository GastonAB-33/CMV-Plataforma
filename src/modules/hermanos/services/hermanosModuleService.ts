import { InMemoryBrothersRepository } from '../repositories/inMemoryBrothersRepository';
import {
  BrotherDataAudit,
  BrotherId,
  BrotherListItem,
  BrotherPersistenceSnapshot,
  BrotherProfile,
  BrothersRepository,
} from '../types';

const collectMissingFields = (brother: BrotherProfile): string[] => {
  const missingFields: string[] = [];

  if (!brother.acompanamiento.acompananteName) {
    missingFields.push('acompanamiento.acompananteName');
  }
  if (!brother.acompanamiento.liderCelulaName) {
    missingFields.push('acompanamiento.liderCelulaName');
  }
  if (!brother.acompanamiento.pastorName) {
    missingFields.push('acompanamiento.pastorName');
  }
  if (!brother.acompanamiento.apostolName) {
    missingFields.push('acompanamiento.apostolName');
  }

  if (!brother.altar?.fechaInicio) {
    missingFields.push('altar.fechaInicio');
  }
  if (!brother.grupo?.fechaInicio) {
    missingFields.push('grupo.fechaInicio');
  }
  if (!brother.experiencia?.fechaRealizacion) {
    missingFields.push('experiencia.fechaRealizacion');
  }
  if (!brother.eddi?.fechaInicio) {
    missingFields.push('eddi.fechaInicio');
  }
  if (!brother.discipulo?.fechaInicio) {
    missingFields.push('discipulo.fechaInicio');
  }

  return missingFields;
};

const toListItem = (brother: BrotherProfile): BrotherListItem => ({
  id: brother.id,
  name: brother.name,
  fotoUrl: brother.fotoUrl,
  procesoActual: brother.procesoActual,
  cellName: brother.acompanamiento.celulaName,
  acompananteName: brother.acompanamiento.acompananteName,
});

const toPersistenceSnapshot = (brother: BrotherProfile): BrotherPersistenceSnapshot => ({
  id: brother.id,
  name: brother.name,
  photoUrl: brother.fotoUrl ?? null,
  role: brother.role,
  currentProcess: brother.procesoActual,
  mentoring: {
    cellName: brother.acompanamiento.celulaName,
    acompananteName: brother.acompanamiento.acompananteName ?? null,
    liderCelulaName: brother.acompanamiento.liderCelulaName ?? null,
    pastorName: brother.acompanamiento.pastorName ?? null,
    apostolName: brother.acompanamiento.apostolName ?? null,
  },
  stages: {
    altar: brother.altar ?? null,
    grupo: brother.grupo ?? null,
    experiencia: brother.experiencia ?? null,
    eddi: brother.eddi ?? null,
    discipulo: brother.discipulo ?? null,
  },
  observations: brother.observations.map((entry) => ({ ...entry })),
  disciples: brother.disciples ? [...brother.disciples] : [],
});

export class HermanosModuleService {
  constructor(private readonly repository: BrothersRepository) {}

  list(): BrotherProfile[] {
    return this.repository.list();
  }

  findById(id: BrotherId): BrotherProfile | undefined {
    return this.repository.findById(id);
  }

  listCells() {
    return this.repository.listCells();
  }

  listForListing(): BrotherListItem[] {
    return this.repository.list().map(toListItem);
  }

  auditDataCompleteness(): BrotherDataAudit[] {
    return this.repository.list().map((brother) => ({
      brotherId: brother.id,
      missingFields: collectMissingFields(brother),
    }));
  }

  exportPersistenceSnapshots(): BrotherPersistenceSnapshot[] {
    return this.repository.list().map(toPersistenceSnapshot);
  }

  async listAsync(): Promise<BrotherProfile[]> {
    return this.list();
  }

  async findByIdAsync(id: BrotherId): Promise<BrotherProfile | undefined> {
    return this.findById(id);
  }
}

const brothersRepository = new InMemoryBrothersRepository();

export const hermanosModuleService = new HermanosModuleService(brothersRepository);
