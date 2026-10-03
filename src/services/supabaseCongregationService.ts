import { BrotherListItem, BrotherProfile } from '../modules/hermanos/types';
import { Cell, Proceso, Role } from '../types';
import { canonicalizeCellName, normalizeCellKey } from './cellNormalization';
import { supabaseAuditService, type AuditActor } from './supabaseAuditService';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { parseLeaderIds } from './supabaseCellsService';
import { marriagesService } from './marriagesService';

interface SupabaseCelulaRow {
  id: string;
  nombre: string;
  activa: boolean | null;
  lider_id: string | null;
  descripcion: string | null;
}

interface SupabaseHermanoRow {
  id: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
  celula_id: string | null;
  estado: string | null;
  fecha_ingreso: string | null;
  foto_url: string | null;
}

interface SupabaseProcesoRow {
  hermano_id: string;
  tipo: string;
  estado: string;
  created_at: string;
}

interface UpsertBrotherInput {
  id?: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string;
  celulaId?: string;
  estado?: string;
  fechaIngreso?: string;
  fotoUrl?: string;
}

interface UpsertCellInput {
  id?: string;
  nombre: string;
  liderId?: string;
  descripcion?: string;
  activa?: boolean;
}

const FALLBACK_CELL: Cell = 'Vida';

const normalizeText = (value?: string): string =>
  (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toProceso = (value?: string): Proceso => {
  const normalized = normalizeText(value);
  if (normalized.includes('altar')) {
    return Proceso.ALTAR;
  }
  if (normalized.includes('grupo')) {
    return Proceso.GRUPO;
  }
  if (normalized.includes('experiencia')) {
    return Proceso.EXPERIENCIA;
  }
  if (normalized.includes('eddi')) {
    return Proceso.EDDI;
  }
  if (normalized.includes('discip')) {
    return Proceso.DISCIPULO;
  }
  return Proceso.ALTAR;
};

const coerceCellName = (value?: string): Cell => {
  const raw = canonicalizeCellName(value);
  if (!raw) {
    return FALLBACK_CELL;
  }
  return raw as Cell;
};

const buildName = (row: SupabaseHermanoRow): string =>
  [row.nombres, row.apellidos].map((part) => part.trim()).filter(Boolean).join(' ');

const calculateAge = (birthDate?: string | null): number | undefined => {
  if (!birthDate) {
    return undefined;
  }

  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
};

const toBrotherProfile = (
  row: SupabaseHermanoRow,
  cellNameById: Map<string, string>,
  processByBrotherId: Map<string, SupabaseProcesoRow>,
  cellLeadersById?: Map<string, string>,
): BrotherProfile => {
  const cellName = coerceCellName(
    row.celula_id ? cellNameById.get(row.celula_id) : undefined,
  );
  const process = processByBrotherId.get(row.id);
  const liderCelulaName = row.celula_id && cellLeadersById ? cellLeadersById.get(row.celula_id) : undefined;

  return {
    id: row.id,
    name: buildName(row),
    fotoUrl: row.foto_url ?? undefined,
    edad: calculateAge(row.fecha_nacimiento),
    fechaNacimiento: row.fecha_nacimiento ?? undefined,
    telefono: row.telefono ?? undefined,
    role: Role.HERMANO_NUEVO,
    procesoActual: toProceso(process?.tipo ?? row.estado ?? undefined),
    acompanamiento: {
      celulaName: cellName,
      liderCelulaName,
    },
    observations: [],
    disciples: [],
  };
};

const toBrotherListItem = (brother: BrotherProfile): BrotherListItem => ({
  id: brother.id,
  name: brother.name,
  fotoUrl: brother.fotoUrl,
  procesoActual: brother.procesoActual,
  cellName: brother.acompanamiento.celulaName,
  acompananteName: brother.acompanamiento.acompananteName,
});

export const supabaseCongregationService = {
  isEnabled(): boolean {
    return isSupabaseConfigured();
  },

  async listCells(): Promise<Cell[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const { data, error } = await client
      .from('celulas')
      .select('nombre')
      .eq('activa', true)
      .order('nombre', { ascending: true });

    if (error || !data) {
      return [];
    }

    const seen = new Set<string>();
    return data
      .map((row) => coerceCellName(row.nombre))
      .filter((cell) => {
        const key = normalizeCellKey(cell);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  },

  async listBrothers(): Promise<BrotherProfile[]> {
    const client = getSupabaseClient();
    if (!client) {
      return [];
    }

    const [{ data: cells, error: cellsError }, { data: brothers, error: brothersError }, { data: processes, error: processError }] =
      await Promise.all([
        client.from('celulas').select('id,nombre,activa,lider_id,descripcion'),
        client
          .from('hermanos')
          .select('id,nombres,apellidos,telefono,direccion,fecha_nacimiento,celula_id,estado,fecha_ingreso,foto_url')
          .order('nombres', { ascending: true }),
        client
          .from('procesos')
          .select('hermano_id,tipo,estado,created_at')
          .order('created_at', { ascending: false }),
      ]);

    if (cellsError || brothersError || processError) {
      return [];
    }

    const cellRows = (cells ?? []) as SupabaseCelulaRow[];
    const brotherRows = (brothers ?? []) as SupabaseHermanoRow[];
    const processRows = (processes ?? []) as SupabaseProcesoRow[];

    const cellNameById = new Map<string, string>();
    for (const cell of cellRows) {
      cellNameById.set(cell.id, cell.nombre);
    }

    // Map brother names
    const brotherNameById = new Map<string, string>();
    for (const b of brotherRows) {
      brotherNameById.set(b.id, buildName(b));
    }

    // Resolve leaders for each cell
    const cellLeadersById = new Map<string, string>();
    const allMarriages = marriagesService.list();

    for (const cell of cellRows) {
      const leaderIds = parseLeaderIds(cell.descripcion);
      const effectiveIds = leaderIds.length > 0 ? leaderIds : (cell.lider_id ? [cell.lider_id] : []);
      const leaderNames = effectiveIds
        .map((id) => brotherNameById.get(id))
        .filter((name): name is string => Boolean(name));

      if (leaderNames.length === 0) {
        continue;
      }

      // Check if these leaders match a configured marriage
      const matchingMarriage = allMarriages.find(
        (m) =>
          effectiveIds.includes(m.spouse1Id) && effectiveIds.includes(m.spouse2Id),
      );

      if (matchingMarriage) {
        cellLeadersById.set(
          cell.id,
          `${matchingMarriage.label} (${leaderNames.join(' y ')})`,
        );
      } else {
        cellLeadersById.set(cell.id, leaderNames.join(' y '));
      }
    }

    const processByBrotherId = new Map<string, SupabaseProcesoRow>();
    for (const process of processRows) {
      if (!processByBrotherId.has(process.hermano_id)) {
        processByBrotherId.set(process.hermano_id, process);
      }
    }

    return brotherRows.map((row) =>
      toBrotherProfile(row, cellNameById, processByBrotherId, cellLeadersById),
    );
  },

  async listBrotherItems(): Promise<BrotherListItem[]> {
    const brothers = await this.listBrothers();
    return brothers.map(toBrotherListItem);
  },

  async upsertBrother(
    input: UpsertBrotherInput,
    actor?: AuditActor,
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const payload: Record<string, unknown> = {
      nombres: input.nombres.trim(),
      apellidos: input.apellidos.trim(),
    };

    if (input.telefono !== undefined) {
      payload.telefono = input.telefono.trim() || null;
    }
    if (input.direccion !== undefined) {
      payload.direccion = input.direccion.trim() || null;
    }
    if (input.fechaNacimiento !== undefined) {
      payload.fecha_nacimiento = input.fechaNacimiento || null;
    }
    if (input.celulaId !== undefined) {
      payload.celula_id = input.celulaId || null;
    }
    if (input.estado !== undefined) {
      payload.estado = input.estado.trim() || null;
    }
    if (input.fechaIngreso !== undefined) {
      payload.fecha_ingreso = input.fechaIngreso || null;
    }
    if (input.fotoUrl !== undefined) {
      payload.foto_url = input.fotoUrl.trim() || null;
    }

    let data: { id: string } | null = null;
    let error: { message?: string } | null = null;

    if (input.id) {
      const updateResult = await client
        .from('hermanos')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();
      data = updateResult.data;
      error = updateResult.error;
    } else {
      const insertResult = await client
        .from('hermanos')
        .insert(payload)
        .select('id')
        .single();
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo guardar hermano.' };
    }

    await supabaseAuditService.log({
      actor,
      modulo: 'hermanos',
      entityType: 'hermano',
      entityId: data.id,
      action: input.id ? 'update' : 'create',
      afterData: payload,
    });

    return { ok: true, id: data.id };
  },

  async upsertCell(
    input: UpsertCellInput,
    actor?: AuditActor,
  ): Promise<{ ok: boolean; id?: string; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { ok: false, error: 'Supabase no configurado.' };
    }

    const cellName = canonicalizeCellName(input.nombre);

    const { data: existingCells, error: existingCellError } = await client
      .from('celulas')
      .select('id,nombre,activa');

    if (existingCellError) {
      return { ok: false, error: existingCellError.message ?? 'No se pudo buscar la célula.' };
    }

    const existingCell = (existingCells ?? []).find((cell) =>
      normalizeCellKey(canonicalizeCellName(cell.nombre)) === normalizeCellKey(cellName) && cell.activa !== false
    );

    if (existingCell?.id) {
      return { ok: true, id: existingCell.id };
    }

    const payload = {
      nombre: cellName,
      lider_id: input.liderId ?? null,
      descripcion: input.descripcion?.trim() || null,
      activa: input.activa ?? true,
    };

    const { data, error } = await client
      .from('celulas')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? 'No se pudo guardar celula.' };
    }

    await supabaseAuditService.log({
      actor,
      modulo: 'celulas',
      entityType: 'celula',
      entityId: data.id,
      action: 'create',
      afterData: payload,
    });

    return { ok: true, id: data.id };
  },
};
