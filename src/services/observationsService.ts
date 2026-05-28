import { Proceso } from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

export type ObservationRole = 'Pastor' | 'Líder' | 'Discípulo';

export interface Observation {
  id: string;
  brotherId: string;
  text: string;
  author: string;
  role: ObservationRole;
  createdAt: string;
  process: Proceso;
}

interface SupabaseObservationRow {
  id: string;
  hermano_id: string;
  comentario: string | null;
  detalle: string | null;
  tipo: string | null;
  proceso: string | null;
  fecha: string | null;
}

const normalizeText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeRole = (role?: string): ObservationRole => {
  const normalized = normalizeText(role ?? '');
  if (normalized.includes('pastor')) {
    return 'Pastor';
  }
  if (normalized.includes('lider')) {
    return 'Líder';
  }
  return 'Discípulo';
};

const normalizeProcess = (process?: string): Proceso => {
  const normalized = normalizeText(process ?? '');
  if (normalized === 'altar') {
    return Proceso.ALTAR;
  }
  if (normalized === 'grupo') {
    return Proceso.GRUPO;
  }
  if (normalized === 'experiencia') {
    return Proceso.EXPERIENCIA;
  }
  if (normalized === 'eddi') {
    return Proceso.EDDI;
  }
  if (normalized === 'discipulo') {
    return Proceso.DISCIPULO;
  }
  return Proceso.ALTAR;
};

const sortByCreatedAtDesc = (observations: Observation[]): Observation[] =>
  [...observations].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

const toObservationFromSupabase = (row: SupabaseObservationRow): Observation => ({
  id: row.id || `observation-${Date.now()}`,
  brotherId: row.hermano_id,
  text: row.comentario || '',
  author: row.detalle || 'Sin autor',
  role: normalizeRole(row.tipo ?? undefined),
  createdAt: row.fecha || new Date().toISOString(),
  process: normalizeProcess(row.proceso ?? undefined),
});

const getRequiredSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado para observaciones.');
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Cliente Supabase no disponible.');
  }

  return client;
};

export const getObservations = async (brotherId: string): Promise<Observation[]> => {
  if (!brotherId) {
    return [];
  }

  const client = getRequiredSupabaseClient();

  const { data, error } = await client
    .from('observaciones')
    .select('id,hermano_id,comentario,detalle,tipo,proceso,fecha')
    .eq('hermano_id', brotherId)
    .order('fecha', { ascending: false });

  if (error) {
    throw new Error(error.message || 'No se pudieron obtener observaciones desde Supabase.');
  }

  return sortByCreatedAtDesc(
    (data ?? []).map((row) => toObservationFromSupabase(row as SupabaseObservationRow)),
  );
};

export const addObservation = async (brotherId: string, observation: Observation): Promise<Observation> => {
  if (!brotherId) {
    throw new Error('brotherId es obligatorio para agregar observaciones.');
  }

  const text = observation.text.trim();
  if (!text) {
    throw new Error('text es obligatorio para agregar observaciones.');
  }

  const client = getRequiredSupabaseClient();

  const payload = {
    hermano_id: brotherId,
    comentario: text,
    detalle: observation.author?.trim() || null,
    tipo: observation.role,
    proceso: observation.process,
    fecha: observation.createdAt || new Date().toISOString(),
  };

  const { data, error } = await client
    .from('observaciones')
    .insert(payload)
    .select('id,hermano_id,comentario,detalle,tipo,proceso,fecha')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'No se pudo guardar la observación en Supabase.');
  }

  return toObservationFromSupabase(data as SupabaseObservationRow);
};

export const updateObservation = async (
  observationId: string,
  updates: Pick<Observation, 'text' | 'author' | 'role' | 'process'>,
): Promise<Observation> => {
  if (!observationId) {
    throw new Error('observationId es obligatorio para actualizar observaciones.');
  }

  const text = updates.text.trim();
  if (!text) {
    throw new Error('text es obligatorio para actualizar observaciones.');
  }

  const client = getRequiredSupabaseClient();
  const payload = {
    comentario: text,
    detalle: updates.author?.trim() || null,
    tipo: updates.role,
    proceso: updates.process,
  };

  const { data, error } = await client
    .from('observaciones')
    .update(payload)
    .eq('id', observationId)
    .select('id,hermano_id,comentario,detalle,tipo,proceso,fecha')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'No se pudo actualizar la observación en Supabase.');
  }

  return toObservationFromSupabase(data as SupabaseObservationRow);
};

export const deleteObservation = async (observationId: string): Promise<void> => {
  if (!observationId) {
    throw new Error('observationId es obligatorio para eliminar observaciones.');
  }

  const client = getRequiredSupabaseClient();
  const { error } = await client
    .from('observaciones')
    .delete()
    .eq('id', observationId);

  if (error) {
    throw new Error(error.message || 'No se pudo eliminar la observación en Supabase.');
  }
};
