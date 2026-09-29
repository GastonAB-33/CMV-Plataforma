import { Role } from '../types';

export interface BrotherLiderCelulaApproval {
  brotherId: string;
  isAprobado: boolean;
  fechaAprobacion?: string;
  aprobadoPor?: {
    id?: string;
    name: string;
    role: Role;
  };
  observaciones?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_lider_celula_approvals_v1';

let memoryApprovals: Record<string, BrotherLiderCelulaApproval> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherLiderCelulaApproval> => {
  if (!canUseStorage()) return { ...memoryApprovals };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeStorage = (data: Record<string, BrotherLiderCelulaApproval>) => {
  memoryApprovals = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota
    }
  }
};

export const liderCelulaApprovalService = {
  getApproval(brotherId: string): BrotherLiderCelulaApproval {
    if (!brotherId) {
      return {
        brotherId: '',
        isAprobado: false,
        updatedAt: new Date().toISOString(),
      };
    }
    const data = readStorage();
    const item = data[brotherId];
    if (!item) {
      return {
        brotherId,
        isAprobado: false,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  },

  approveLiderCelula(
    brotherId: string,
    actor: { id?: string; name: string; role: Role },
    observaciones?: string
  ): BrotherLiderCelulaApproval {
    const data = readStorage();
    const now = new Date().toISOString();
    const record: BrotherLiderCelulaApproval = {
      brotherId,
      isAprobado: true,
      fechaAprobacion: now,
      aprobadoPor: actor,
      observaciones: observaciones?.trim() || undefined,
      updatedAt: now,
    };
    data[brotherId] = record;
    writeStorage(data);
    return record;
  },

  revokeApproval(brotherId: string): BrotherLiderCelulaApproval {
    const data = readStorage();
    const now = new Date().toISOString();
    const record: BrotherLiderCelulaApproval = {
      brotherId,
      isAprobado: false,
      updatedAt: now,
    };
    data[brotherId] = record;
    writeStorage(data);
    return record;
  },

  listApproved(): BrotherLiderCelulaApproval[] {
    const data = readStorage();
    return Object.values(data).filter((item) => item.isAprobado);
  },
};
