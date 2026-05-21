import { hermanosModuleService } from '../modules/hermanos/services/hermanosModuleService';
import { BrotherDataAudit, BrotherId, BrotherListItem, BrotherPersistenceSnapshot, BrotherProfile } from '../modules/hermanos/types';
import { AuditActor } from './supabaseAuditService';
import { supabaseCongregationService } from './supabaseCongregationService';

let brothersCache: BrotherProfile[] = hermanosModuleService.list();
let cellsCache = hermanosModuleService.listCells();

const toBrotherListItem = (brother: BrotherProfile): BrotherListItem => ({
  id: brother.id,
  name: brother.name,
  fotoUrl: brother.fotoUrl,
  procesoActual: brother.procesoActual,
  cellName: brother.acompanamiento.celulaName,
  acompananteName: brother.acompanamiento.acompananteName,
});

const refreshCachesFromBrothers = (brothers: BrotherProfile[]) => {
  brothersCache = brothers;
  const uniqueCells = new Set(cellsCache);
  for (const brother of brothers) {
    uniqueCells.add(brother.acompanamiento.celulaName);
  }
  cellsCache = Array.from(uniqueCells);
};

export const brothersService = {
  list(): BrotherProfile[] {
    return brothersCache;
  },

  findById(id: BrotherId): BrotherProfile | undefined {
    return brothersCache.find((brother) => brother.id === id);
  },

  listCells() {
    return cellsCache;
  },

  listForListing(): BrotherListItem[] {
    return brothersCache.map(toBrotherListItem);
  },

  async listForListingAsync(): Promise<BrotherListItem[]> {
    const brothers = await this.listAsync();
    return brothers.map(toBrotherListItem);
  },

  auditDataCompleteness(): BrotherDataAudit[] {
    return hermanosModuleService.auditDataCompleteness();
  },

  exportPersistenceSnapshots(): BrotherPersistenceSnapshot[] {
    return hermanosModuleService.exportPersistenceSnapshots();
  },

  async listAsync(): Promise<BrotherProfile[]> {
    if (!supabaseCongregationService.isEnabled()) {
      const local = await hermanosModuleService.listAsync();
      refreshCachesFromBrothers(local);
      return local;
    }

    const remote = await supabaseCongregationService.listBrothers();
    if (remote.length > 0) {
      refreshCachesFromBrothers(remote);
      return remote;
    }

    const local = await hermanosModuleService.listAsync();
    refreshCachesFromBrothers(local);
    return local;
  },

  async findByIdAsync(id: BrotherId): Promise<BrotherProfile | undefined> {
    const brothers = await this.listAsync();
    return brothers.find((brother) => brother.id === id) ?? undefined;
  },

  async listCellsAsync() {
    if (!supabaseCongregationService.isEnabled()) {
      const localCells = hermanosModuleService.listCells();
      cellsCache = localCells;
      return localCells;
    }

    const remote = await supabaseCongregationService.listCells();
    if (remote.length > 0) {
      cellsCache = remote;
      return remote;
    }

    const localCells = hermanosModuleService.listCells();
    cellsCache = localCells;
    return localCells;
  },

  async upsertBrotherAsync(
    input: {
      id?: string;
      nombres: string;
      apellidos: string;
      telefono?: string;
      direccion?: string;
      celulaId?: string;
      estado?: string;
      fechaIngreso?: string;
      fotoUrl?: string;
    },
    actor?: AuditActor,
  ) {
    const result = await supabaseCongregationService.upsertBrother(input, actor);
    if (result.ok) {
      await this.listAsync();
    }
    return result;
  },

  async upsertCellAsync(
    input: {
      id?: string;
      nombre: string;
      liderId?: string;
      descripcion?: string;
      activa?: boolean;
    },
    actor?: AuditActor,
  ) {
    const result = await supabaseCongregationService.upsertCell(input, actor);
    if (result.ok) {
      await this.listCellsAsync();
    }
    return result;
  },
};
