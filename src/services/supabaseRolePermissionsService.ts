import { AppFeatureKey, PermissionLevel } from '../lib/permissionsMatrix';
import { Role } from '../types';
import { getSupabaseClient } from './supabaseClient';

interface RolePermissionRow {
  role: string;
  feature: string;
  permission: PermissionLevel;
}

const isRole = (value: string): value is Role =>
  Object.values(Role).includes(value as Role);

const isFeature = (value: string): value is AppFeatureKey =>
  [
    'dashboard',
    'hermanos',
    'seguimiento',
    'eventos',
    'escuela_eddi',
    'ministerio_adoracion',
    'ministerio_multimedia',
    'ministerio_misericordia',
    'promociones',
  ].includes(value);

const isPermission = (value: string): value is PermissionLevel =>
  ['none', 'view', 'edit', 'manage'].includes(value);

export const supabaseRolePermissionsService = {
  async list(): Promise<Array<{ role: Role; feature: AppFeatureKey; permission: PermissionLevel }>> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('role_feature_permissions')
      .select('role,feature,permission');

    if (error || !data) {
      return [];
    }

    return (data as RolePermissionRow[])
      .filter((row) => isRole(row.role) && isFeature(row.feature) && isPermission(row.permission))
      .map((row) => ({
        role: row.role as Role,
        feature: row.feature as AppFeatureKey,
        permission: row.permission,
      }));
  },

  async upsert(input: { role: Role; feature: AppFeatureKey; permission: PermissionLevel }) {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const { error } = await client
      .from('role_feature_permissions')
      .upsert(
        {
          role: input.role,
          feature: input.feature,
          permission: input.permission,
        },
        { onConflict: 'role,feature' },
      );

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  },
};

