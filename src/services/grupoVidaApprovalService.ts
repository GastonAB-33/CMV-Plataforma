import { Role } from '../types';

export interface BrotherGrupoVidaApproval {
  brotherId: string;
  isAprobado: boolean;
  fechaAprobacion?: string;
  approvedAt?: string;
  aprobadoPor?: {
    id?: string;
    name: string;
    role: Role;
  };
  approvedBy?: {
    id?: string;
    name: string;
    role: Role;
  };
  nombreGrupoVida?: string;
  grupoVidaNombre?: string;
  observaciones?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'cmv_grupo_vida_approvals_v1';

let memoryApprovals: Record<string, BrotherGrupoVidaApproval> = {};

const canUseStorage = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStorage = (): Record<string, BrotherGrupoVidaApproval> => {
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

const writeStorage = (data: Record<string, BrotherGrupoVidaApproval>) => {
  memoryApprovals = { ...data };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota
    }
  }
};

export const grupoVidaApprovalService = {
  getApproval(brotherId: string): BrotherGrupoVidaApproval {
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
    return {
      ...item,
      approvedAt: item.approvedAt ?? item.fechaAprobacion,
      fechaAprobacion: item.fechaAprobacion ?? item.approvedAt,
      approvedBy: item.approvedBy ?? item.aprobadoPor,
      aprobadoPor: item.aprobadoPor ?? item.approvedBy,
      grupoVidaNombre: item.grupoVidaNombre ?? item.nombreGrupoVida,
      nombreGrupoVida: item.nombreGrupoVida ?? item.grupoVidaNombre,
    };
  },

  approveGrupoVida(
    brotherId: string,
    actor: { id?: string; name: string; role: Role },
    nombreGrupoVida?: string,
    observaciones?: string,
  ): BrotherGrupoVidaApproval {
    const data = readStorage();
    const now = new Date().toISOString();
    const groupName = nombreGrupoVida?.trim() || undefined;
    const record: BrotherGrupoVidaApproval = {
      brotherId,
      isAprobado: true,
      fechaAprobacion: now,
      approvedAt: now,
      aprobadoPor: actor,
      approvedBy: actor,
      nombreGrupoVida: groupName,
      grupoVidaNombre: groupName,
      observaciones: observaciones?.trim() || undefined,
      updatedAt: now,
    };
    data[brotherId] = record;
    writeStorage(data);
    return record;
  },

  revokeApproval(brotherId: string): BrotherGrupoVidaApproval {
    const data = readStorage();
    const now = new Date().toISOString();
    const record: BrotherGrupoVidaApproval = {
      brotherId,
      isAprobado: false,
      updatedAt: now,
    };
    data[brotherId] = record;
    writeStorage(data);
    return record;
  },

  revokeGrupoVida(brotherId: string): BrotherGrupoVidaApproval {
    return this.revokeApproval(brotherId);
  },

  listApproved(): BrotherGrupoVidaApproval[] {
    const data = readStorage();
    return Object.values(data).filter((item) => item.isAprobado);
  },
};
