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

const PERMISSIONS_STORAGE_KEY = 'cmv_role_permissions_v1';

export const ROLE_HIERARCHY: Role[] = [
  Role.SUPERADMIN,
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
  Role.DISCIPULO,
  Role.HERMANO_MAYOR,
  Role.HERMANO_NUEVO,
];

const DEFAULT_ROLE_PERMISSION_MATRIX: Record<Role, RolePermissionProfile> = {
  [Role.SUPERADMIN]: {
    hierarchyRank: 0,
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

const deepCloneMatrix = (value: Record<Role, RolePermissionProfile>) =>
  JSON.parse(JSON.stringify(value)) as Record<Role, RolePermissionProfile>;

let rolePermissionMatrixState = deepCloneMatrix(DEFAULT_ROLE_PERMISSION_MATRIX);
let userPermissionOverridesState: Partial<Record<string, Partial<Record<AppFeatureKey, PermissionLevel>>>> = {};

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const persistPermissionMatrix = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    PERMISSIONS_STORAGE_KEY,
    JSON.stringify(rolePermissionMatrixState),
  );
};

const loadPermissionMatrix = () => {
  if (!canUseStorage()) {
    return;
  }

  const raw = window.localStorage.getItem(PERMISSIONS_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Record<Role, RolePermissionProfile>;
    rolePermissionMatrixState = {
      ...rolePermissionMatrixState,
      ...parsed,
    };
  } catch {
    // Keep defaults.
  }
};

loadPermissionMatrix();

export const ROLE_PERMISSION_MATRIX = rolePermissionMatrixState;

type PromotionKey = `${Role}>${Role}`;

const APOSTOL_ALLOWED_PROMOTIONS = new Set<PromotionKey>([
  `${Role.DISCIPULO}>${Role.LIDER_CELULA}`,
  `${Role.LIDER_CELULA}>${Role.PASTOR}`,
  `${Role.LIDER_CELULA}>${Role.LIDER_RED_CELULAS}`,
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

export const getPermissionLevel = (role: Role, feature: AppFeatureKey): PermissionLevel =>
  rolePermissionMatrixState[role].features[feature];

const maxPermission = (left: PermissionLevel, right: PermissionLevel): PermissionLevel => {
  const order: PermissionLevel[] = ['none', 'view', 'edit', 'manage'];
  return order.indexOf(left) >= order.indexOf(right) ? left : right;
};

export const getPermissionLevelForUser = (user: User, feature: AppFeatureKey): PermissionLevel => {
  const rolePermission = getPermissionLevel(user.role, feature);
  const override = userPermissionOverridesState[user.id]?.[feature];
  if (!override) {
    return rolePermission;
  }
  return maxPermission(rolePermission, override);
};

export const hasPermissionAtLeast = (
  role: Role,
  feature: AppFeatureKey,
  minimum: Exclude<PermissionLevel, 'none'>,
): boolean => {
  const order: PermissionLevel[] = ['none', 'view', 'edit', 'manage'];
  return order.indexOf(getPermissionLevel(role, feature)) >= order.indexOf(minimum);
};

export const hasPermissionAtLeastForUser = (
  user: User,
  feature: AppFeatureKey,
  minimum: Exclude<PermissionLevel, 'none'>,
): boolean => {
  const order: PermissionLevel[] = ['none', 'view', 'edit', 'manage'];
  return order.indexOf(getPermissionLevelForUser(user, feature)) >= order.indexOf(minimum);
};

export const canManageNotifications = (role: Role): boolean =>
  hasPermissionAtLeast(role, 'eventos', 'edit');

export const canPromoteRole = (actorRole: Role, fromRole: Role, toRole: Role): boolean => {
  if (actorRole !== Role.APOSTOL && actorRole !== Role.SUPERADMIN) {
    return false;
  }
  return APOSTOL_ALLOWED_PROMOTIONS.has(`${fromRole}>${toRole}`);
};

export const canManageEvents = (role: Role): boolean =>
  hasPermissionAtLeast(role, 'eventos', 'edit');

export const canManageEventsForUser = (user: User): boolean =>
  hasPermissionAtLeastForUser(user, 'eventos', 'edit');

export const isEventVisibleForUser = (event: Event, user: User): boolean => {
  if (!hasPermissionAtLeast(user.role, 'eventos', 'view')) {
    return false;
  }

  if (user.role === Role.APOSTOL || user.role === Role.SUPERADMIN) {
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

export const setRoleFeaturePermission = (
  role: Role,
  feature: AppFeatureKey,
  permission: PermissionLevel,
) => {
  rolePermissionMatrixState = {
    ...rolePermissionMatrixState,
    [role]: {
      ...rolePermissionMatrixState[role],
      features: {
        ...rolePermissionMatrixState[role].features,
        [feature]: permission,
      },
    },
  };
  persistPermissionMatrix();
};

export const resetRolePermissionsToDefault = () => {
  rolePermissionMatrixState = deepCloneMatrix(DEFAULT_ROLE_PERMISSION_MATRIX);
  persistPermissionMatrix();
};

export const applyRolePermissionsOverrides = (
  rows: Array<{ role: Role; feature: AppFeatureKey; permission: PermissionLevel }>,
) => {
  if (rows.length === 0) {
    return;
  }

  const next = deepCloneMatrix(rolePermissionMatrixState);
  for (const row of rows) {
    next[row.role].features[row.feature] = row.permission;
  }
  rolePermissionMatrixState = next;
  persistPermissionMatrix();
};

export const applyUserPermissionOverrides = (
  rows: Array<{ userId: string; feature: AppFeatureKey; permission: PermissionLevel }>,
) => {
  const next: Partial<Record<string, Partial<Record<AppFeatureKey, PermissionLevel>>>> = {};
  for (const row of rows) {
    if (!next[row.userId]) {
      next[row.userId] = {};
    }
    next[row.userId]![row.feature] = row.permission;
  }
  userPermissionOverridesState = next;
};
