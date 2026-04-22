import { User } from '../types';

export type ManagedModuleKey = 'escuela_eddi' | 'ministerio_adoracion' | 'ministerio_multimedia' | 'ministerio_misericordia';

interface ModuleAccessConfig {
  responsibleUserIds: string[];
  responsibleNames: string[];
}

const MODULE_ACCESS: Record<ManagedModuleKey, ModuleAccessConfig> = {
  escuela_eddi: {
    responsibleUserIds: ['u-1', 'u-2'],
    responsibleNames: ['Pastor Carlos', 'Pastora Ana'],
  },
  ministerio_adoracion: {
    responsibleUserIds: ['u-1', 'u-3'],
    responsibleNames: ['Pastor Carlos', 'Pastor de Adoracion'],
  },
  ministerio_multimedia: {
    responsibleUserIds: ['u-1', 'u-4'],
    responsibleNames: ['Pastor Carlos', 'Pastor de Multimedia'],
  },
  ministerio_misericordia: {
    responsibleUserIds: ['u-1', 'u-5'],
    responsibleNames: ['Pastor Carlos', 'Pastor de Misericordia'],
  },
};

export const canEditManagedModule = (user: User, moduleKey: ManagedModuleKey): boolean => {
  return MODULE_ACCESS[moduleKey].responsibleUserIds.includes(user.id);
};

export const listModuleResponsibleNames = (moduleKey: ManagedModuleKey): string[] => {
  return [...MODULE_ACCESS[moduleKey].responsibleNames];
};
