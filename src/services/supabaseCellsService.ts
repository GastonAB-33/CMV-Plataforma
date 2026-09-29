import { canonicalizeCellName, normalizeCellKey } from './cellNormalization';
import { getSupabaseClient } from './supabaseClient';

const CONFIG_PREFIX = 'CMV_CELL_CONFIG:';

export interface CellLeader {
  id: string;
  name: string;
}

export interface CellConfigRow {
  id: string;
  nombre: string;
  activa: boolean;
  leaderIds: string[];
  leaders: CellLeader[];
}

export interface UpsertCellConfigInput {
  id?: string;
  nombre: string;
  activa: boolean;
  leaderIds: string[];
}

interface SupabaseCellRow {
  id: string;
  nombre: string;
  activa: boolean | null;
  descripcion: string | null;
}

interface SupabaseBrotherRow {
  id: string;
  nombres: string;
  apellidos: string;
}

export const parseLeaderIds = (description?: string | null): string[] => {
  if (!description?.startsWith(CONFIG_PREFIX)) {
    return [];
  }

  try {
    const parsed = JSON.parse(description.slice(CONFIG_PREFIX.length)) as { leaderIds?: unknown };
    if (!Array.isArray(parsed.leaderIds)) {
      return [];
    }
    return parsed.leaderIds.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
};

const serializeLeaderIds = (leaderIds: string[]): string =>
  `${CONFIG_PREFIX}${JSON.stringify({ leaderIds })}`;

const buildBrotherName = (row: SupabaseBrotherRow): string =>
  [row.nombres, row.apellidos].map((part) => part.trim()).filter(Boolean).join(' ');

export const supabaseCellsService = {
  async list(): Promise<CellConfigRow[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const [{ data: cells, error: cellsError }, { data: brothers, error: brothersError }] = await Promise.all([
      client
        .from('celulas')
        .select('id,nombre,activa,descripcion')
        .order('nombre', { ascending: true }),
      client
        .from('hermanos')
        .select('id,nombres,apellidos')
        .order('nombres', { ascending: true }),
    ]);

    if (cellsError || brothersError) {
      return [];
    }

    const brotherById = new Map(
      ((brothers ?? []) as SupabaseBrotherRow[]).map((brother) => [
        brother.id,
        {
          id: brother.id,
          name: buildBrotherName(brother),
        },
      ]),
    );

    return ((cells ?? []) as SupabaseCellRow[])
      .filter((cell) => !cell.nombre.includes('(unificada)'))
      .map((cell) => {
        const leaderIds = parseLeaderIds(cell.descripcion);
        return {
          id: cell.id,
          nombre: cell.nombre,
          activa: cell.activa ?? true,
          leaderIds,
          leaders: leaderIds
            .map((leaderId) => brotherById.get(leaderId))
            .filter((leader): leader is CellLeader => Boolean(leader)),
        };
      });
  },

  async upsert(input: UpsertCellConfigInput): Promise<{ ok: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const canonicalName = canonicalizeCellName(input.nombre);
    const payload = {
      nombre: canonicalName,
      activa: input.activa,
      descripcion: serializeLeaderIds(Array.from(new Set(input.leaderIds))),
    };

    if (input.id) {
      const { data, error } = await client
        .from('celulas')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();

      if (error || !data) {
        return { ok: false, error: error?.message ?? 'No se pudo actualizar la célula.' };
      }

      return { ok: true, id: data.id as string };
    }

    const { data: existing, error: existingError } = await client
      .from('celulas')
      .select('id')
      .eq('nombre', canonicalName)
      .maybeSingle();

    if (existingError) {
      return { ok: false, error: existingError.message };
    }

    if (existing?.id) {
      const { error } = await client
        .from('celulas')
        .update(payload)
        .eq('id', existing.id);

      if (error) {
        return { ok: false, error: error.message };
      }
      return { ok: true, id: existing.id as string };
    }

    const { data, error } = await client
      .from('celulas')
      .insert({
        ...payload,
        lider_id: null,
      })
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo crear la célula.' };
    }

    return { ok: true, id: data.id as string };
  },

  async deactivate(id: string): Promise<{ ok: boolean; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const { error } = await client
      .from('celulas')
      .update({ activa: false })
      .eq('id', id);

    return error ? { ok: false, error: error.message } : { ok: true };
  },

  async findCanonicalCellId(cellName: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }

    const canonicalName = canonicalizeCellName(cellName);
    const { data: cells, error } = await client
      .from('celulas')
      .select('id,nombre,activa');

    if (error || !cells) {
      return null;
    }

    const canonicalKey = normalizeCellKey(canonicalName);
    const found = (cells as Array<{ id: string; nombre: string; activa: boolean | null }>).find(
      (cell) => normalizeCellKey(canonicalizeCellName(cell.nombre)) === canonicalKey && cell.activa !== false,
    );

    return found?.id ?? null;
  },
};
