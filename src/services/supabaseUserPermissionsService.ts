import { AppFeatureKey, PermissionLevel } from '../lib/permissionsMatrix';
import { getSupabaseClient } from './supabaseClient';

interface UserPermissionRow {
  user_id: string;
  feature: string;
  permission: string;
}

const FEATURES: AppFeatureKey[] = [
  'dashboard',
  'hermanos',
  'seguimiento',
  'eventos',
  'escuela_eddi',
  'ministerio_adoracion',
  'ministerio_multimedia',
  'ministerio_misericordia',
  'promociones',
];

const isFeature = (value: string): value is AppFeatureKey => FEATURES.includes(value as AppFeatureKey);
const isPermission = (value: string): value is PermissionLevel =>
  ['view', 'edit', 'manage'].includes(value);

export const supabaseUserPermissionsService = {
  async listAll(): Promise<Array<{ userId: string; feature: AppFeatureKey; permission: PermissionLevel }>> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('user_feature_permissions')
      .select('user_id,feature,permission');

    if (error || !data) {
      return [];
    }

    return (data as UserPermissionRow[])
      .filter((row) => isFeature(row.feature) && isPermission(row.permission))
      .map((row) => ({
        userId: row.user_id,
        feature: row.feature as AppFeatureKey,
        permission: row.permission as PermissionLevel,
      }));
  },

  async listForUser(userId: string): Promise<Array<{ feature: AppFeatureKey; permission: PermissionLevel }>> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('user_feature_permissions')
      .select('feature,permission')
      .eq('user_id', userId);

    if (error || !data) {
      return [];
    }

    return (data as Array<{ feature: string; permission: string }>)
      .filter((row) => isFeature(row.feature) && isPermission(row.permission))
      .map((row) => ({ feature: row.feature as AppFeatureKey, permission: row.permission as PermissionLevel }));
  },

  async upsert(userId: string, feature: AppFeatureKey, permission: PermissionLevel) {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const { error } = await client
      .from('user_feature_permissions')
      .upsert(
        {
          user_id: userId,
          feature,
          permission,
        },
        { onConflict: 'user_id,feature' },
      );

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  },

  async remove(userId: string, feature: AppFeatureKey) {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const { error } = await client
      .from('user_feature_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('feature', feature);

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  },
};
