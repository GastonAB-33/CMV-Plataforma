import { hermanosModuleService } from '../modules/hermanos/services/hermanosModuleService';
import { BrotherDataAudit, BrotherId, BrotherListItem, BrotherPersistenceSnapshot, BrotherProfile } from '../modules/hermanos/types';

export const brothersService = {
  list(): BrotherProfile[] {
    return hermanosModuleService.list();
  },

  findById(id: BrotherId): BrotherProfile | undefined {
    return hermanosModuleService.findById(id);
  },

  listCells() {
    return hermanosModuleService.listCells();
  },

  listForListing(): BrotherListItem[] {
    return hermanosModuleService.listForListing();
  },

  auditDataCompleteness(): BrotherDataAudit[] {
    return hermanosModuleService.auditDataCompleteness();
  },

  exportPersistenceSnapshots(): BrotherPersistenceSnapshot[] {
    return hermanosModuleService.exportPersistenceSnapshots();
  },

  async listAsync(): Promise<BrotherProfile[]> {
    return hermanosModuleService.listAsync();
  },

  async findByIdAsync(id: BrotherId): Promise<BrotherProfile | undefined> {
    return hermanosModuleService.findByIdAsync(id);
  },
};
