import { Event, Role, User } from '../types';

export type PermissionLevel = 'none' | 'view' | 'edit' | 'manage';
export type AppFeatureKey =
  | 'dashboard'
  | 'hermanos'
  | 'seguimiento'
  | 'eventos'
  | 'escuela_eddi'
  | 'ministerio_adoracion'
  | 'ministerio_multimedia'
  | 'ministerio_misericordia'
  | 'promociones';

export interface RolePermissionProfile {
  hierarchyRank: number;
  features: Record<AppFeatureKey, PermissionLevel>;
}

export const ROLE_HIERARCHY: Role[] = [
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
  Role.DISCIPULO,
  Role.HERMANO_MAYOR,
  Role.HERMANO_NUEVO,
];

export const ROLE_PERMISSION_MATRIX: Record<Role, RolePermissionProfile> = {
  [Role.APOSTOL]: {
    hierarchyRank: 1,
    features: {
      dashboard: 'manage',
      hermanos: 'manage',
      seguimiento: 'manage',
      eventos: 'manage',
      escuela_eddi: 'manage',
      ministerio_adoracion: 'manage',
      ministerio_multimedia: 'manage',
      ministerio_misericordia: 'manage',
      promociones: 'manage',
    },
  },
  [Role.PASTOR]: {
    hierarchyRank: 2,
    features: {
      dashboard: 'manage',
      hermanos: 'edit',
      seguimiento: 'edit',
      eventos: 'manage',
      escuela_eddi: 'view',
      ministerio_adoracion: 'view',
      ministerio_multimedia: 'view',
      ministerio_misericordia: 'view',
      promociones: 'none',
    },
  },
  [Role.LIDER_RED_CELULAS]: {
    hierarchyRank: 3,
    features: {
      dashboard: 'view',
      hermanos: 'edit',
      seguimiento: 'edit',
      eventos: 'edit',
      escuela_eddi: 'view',
      ministerio_adoracion: 'view',
      ministerio_multimedia: 'view',
      ministerio_misericordia: 'view',
      promociones: 'none',
    },
  },
  [Role.LIDER_CELULA]: {
    hierarchyRank: 4,
    features: {
      dashboard: 'view',
      hermanos: 'edit',
      seguimiento: 'edit',
      eventos: 'edit',
      escuela_eddi: 'view',
      ministerio_adoracion: 'view',
      ministerio_multimedia: 'view',
      ministerio_misericordia: 'view',
      promociones: 'none',
    },
  },
  [Role.DISCIPULO]: {
    hierarchyRank: 5,
    features: {
      dashboard: 'view',
      hermanos: 'view',
      seguimiento: 'view',
      eventos: 'view',
      escuela_eddi: 'view',
      ministerio_adoracion: 'view',
      ministerio_multimedia: 'view',
      ministerio_misericordia: 'view',
      promociones: 'none',
    },
  },
  [Role.HERMANO_MAYOR]: {
    hierarchyRank: 6,
    features: {
      dashboard: 'none',
      hermanos: 'view',
      seguimiento: 'view',
      eventos: 'view',
      escuela_eddi: 'none',
      ministerio_adoracion: 'none',
      ministerio_multimedia: 'none',
      ministerio_misericordia: 'none',
      promociones: 'none',
    },
  },
  [Role.HERMANO_NUEVO]: {
    hierarchyRank: 7,
    features: {
      dashboard: 'none',
      hermanos: 'none',
      seguimiento: 'none',
      eventos: 'none',
      escuela_eddi: 'none',
      ministerio_adoracion: 'none',
      ministerio_multimedia: 'none',
      ministerio_misericordia: 'none',
      promociones: 'none',
    },
  },
};

type PromotionKey = `${Role}>${Role}`;

const APOSTOL_ALLOWED_PROMOTIONS = new Set<PromotionKey>([
  `${Role.DISCIPULO}>${Role.LIDER_CELULA}`,
  `${Role.LIDER_CELULA}>${Role.PASTOR}`,
  `${Role.LIDER_CELULA}>${Role.LIDER_RED_CELULAS}`,
]);

const EVENT_MANAGEMENT_ROLES = new Set<Role>([
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
]);

const NOTIFICATION_MANAGEMENT_ROLES = new Set<Role>([
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
]);

const resolveUserCells = (user: User): Set<string> => {
  const cells = new Set<string>();
  if (user.primaryCell) {
    cells.add(user.primaryCell);
  }
  for (const cell of user.coveredCells ?? []) {
    cells.add(cell);
  }
  return cells;
};

export const getPermissionLevel = (role: Role, feature: AppFeatureKey): PermissionLevel => {
  return ROLE_PERMISSION_MATRIX[role].features[feature];
};

export const hasPermissionAtLeast = (
  role: Role,
  feature: AppFeatureKey,
  minimum: Exclude<PermissionLevel, 'none'>
): boolean => {
  const order: PermissionLevel[] = ['none', 'view', 'edit', 'manage'];
  return order.indexOf(getPermissionLevel(role, feature)) >= order.indexOf(minimum);
};

export const canManageNotifications = (role: Role): boolean => {
  return NOTIFICATION_MANAGEMENT_ROLES.has(role);
};

export const canPromoteRole = (actorRole: Role, fromRole: Role, toRole: Role): boolean => {
  if (actorRole !== Role.APOSTOL) {
    return false;
  }
  return APOSTOL_ALLOWED_PROMOTIONS.has(`${fromRole}>${toRole}`);
};

export const canManageEvents = (role: Role): boolean => {
  return EVENT_MANAGEMENT_ROLES.has(role);
};

export const isEventVisibleForUser = (event: Event, user: User): boolean => {
  if (!hasPermissionAtLeast(user.role, 'eventos', 'view')) {
    return false;
  }

  if (user.role === Role.APOSTOL) {
    return true;
  }

  const userCells = resolveUserCells(user);
  if (userCells.size === 0) {
    return false;
  }

  if (event.type === 'Red') {
    return true;
  }

  if (userCells.has(event.organizerCell)) {
    return true;
  }

  return (event.invitedCells ?? []).some((cell) => userCells.has(cell));
};

export const isEventInvitedForUser = (event: Event, user: User): boolean => {
  const userCells = resolveUserCells(user);
  if (userCells.size === 0 || userCells.has(event.organizerCell)) {
    return false;
  }
  return (event.invitedCells ?? []).some((cell) => userCells.has(cell));
};
