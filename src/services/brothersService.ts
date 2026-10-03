import { hermanosModuleService } from '../modules/hermanos/services/hermanosModuleService';
import { BrotherDataAudit, BrotherId, BrotherListItem, BrotherPersistenceSnapshot, BrotherProfile } from '../modules/hermanos/types';
import { AuditActor } from './supabaseAuditService';
import { supabaseCongregationService } from './supabaseCongregationService';
import { stageProgressionService } from './stageProgressionService';

let brothersCache: BrotherProfile[] = hermanosModuleService.list();
let cellsCache = hermanosModuleService.listCells();

const toBrotherListItem = (brother: BrotherProfile): BrotherListItem => ({
  id: brother.id,
  name: brother.name,
  fotoUrl: brother.fotoUrl,
  procesoActual: stageProgressionService.resolveProcess(brother),
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

  addBrother(brother: BrotherProfile): void {
    hermanosModuleService.addBrother(brother);
    refreshCachesFromBrothers(hermanosModuleService.list());
  },

  removeBrother(id: BrotherId): void {
    hermanosModuleService.removeBrother(id);
    refreshCachesFromBrothers(hermanosModuleService.list());
  },

  
  updateBrotherPhoto(id: BrotherId, photoUrl: string): void {
    const brother = this.findById(id);
    if (brother) {
      this.addBrother({ ...brother, fotoUrl: photoUrl });
    }
  },
clearMockBrothers(): void {
    hermanosModuleService.clearMockBrothers();
    refreshCachesFromBrothers(hermanosModuleService.list());
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
    refreshCachesFromBrothers(remote);
    return remote;
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
    cellsCache = remote;
    return remote;
  },

  async upsertBrotherAsync(
    input: {
      id?: string;
      nombres: string;
      apellidos: string;
      telefono?: string;
      direccion?: string;
      fechaNacimiento?: string;
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
