import { Role } from '../types';
import { getSupabaseClient } from './supabaseClient';
import { supabaseAuditService, type AuditActor } from './supabaseAuditService';
import { createClient } from '@supabase/supabase-js';

export interface AppUserRow {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  activo: boolean;
  celulaId: string | null;
}

const OWNER_SUPERADMIN_EMAIL = 'ale.97.28+usercmv@gmail.com';

const normalizeRole = (value?: string): Role => {
  const raw = String(value ?? '').trim().toUpperCase();
  if (raw in Role) {
    return Role[raw as keyof typeof Role];
  }
  return Role.HERMANO_NUEVO;
};

export const supabaseUsersService = {
  async provisionAuthUser(
    email: string,
    password: string,
  ): Promise<{ ok: boolean; userId?: string; error?: string }> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return { ok: false, error: 'Supabase no esta configurado.' };
    }

    // Cliente aislado para no afectar la sesion del admin actual.
    const isolatedClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await isolatedClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user?.id) {
      return {
        ok: false,
        error: error?.message ?? 'No se pudo crear la credencial de acceso.',
      };
    }

    await isolatedClient.auth.signOut();
    return { ok: true, userId: data.user.id };
  },

  async listUsers(): Promise<AppUserRow[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('usuarios')
      .select('id,nombre,email,rol,activo,celula_id')
      .order('nombre', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      rol: normalizeRole(row.rol),
      activo: Boolean(row.activo),
      celulaId: row.celula_id ?? null,
    }));
  },

  async upsertUser(
    input: {
      id?: string;
      nombre: string;
      email: string;
      rol: Role;
      activo: boolean;
      celulaId?: string | null;
    },
    actor?: AuditActor,
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const payload = {
      nombre: input.nombre.trim(),
      email: input.email.trim().toLowerCase(),
      rol: input.rol,
      activo: input.activo,
      celula_id: input.celulaId ?? null,
    };

    if (payload.rol === Role.SUPERADMIN && payload.email !== OWNER_SUPERADMIN_EMAIL) {
      return { ok: false, error: 'SUPERADMIN solo puede asignarse al usuario propietario.' };
    }

    if (payload.email === OWNER_SUPERADMIN_EMAIL && payload.rol !== Role.SUPERADMIN) {
      return { ok: false, error: 'El usuario propietario debe conservar rol SUPERADMIN.' };
    }

    let id = input.id;
    let errorMessage: string | null = null;

    if (id) {
      const { error } = await client.from('usuarios').update(payload).eq('id', id);
      if (error) {
        errorMessage = error.message;
      }
    } else {
      const payloadWithId = input.id ? { ...payload, id: input.id } : payload;
      const { data, error } = await client
        .from('usuarios')
        .insert(payloadWithId)
        .select('id')
        .single();
      if (error || !data) {
        errorMessage = error?.message ?? 'No se pudo crear usuario.';
      } else {
        id = data.id;
      }
    }

    if (errorMessage || !id) {
      return { ok: false, error: errorMessage ?? 'No se pudo guardar usuario.' };
    }

    await supabaseAuditService.log({
      actor,
      modulo: 'configuracion_usuarios',
      entityType: 'usuario',
      entityId: id,
      action: input.id ? 'update' : 'create',
      afterData: payload,
    });

    return { ok: true, id };
  },
};
