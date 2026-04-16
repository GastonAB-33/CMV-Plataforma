import { Proceso } from '../types';

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

interface BackendBaseResponse {
  ok?: boolean;
  error?: string;
  message?: string;
}

interface BackendObservation {
  id?: string;
  brotherId?: string;
  text?: string;
  author?: string;
  role?: string;
  createdAt?: string;
  process?: string;
}

interface BackendGetResponse extends BackendBaseResponse {
  data?: BackendObservation[];
}

interface BackendCreateResponse extends BackendBaseResponse {
  data?: BackendObservation;
}

const API_URL = 'http://localhost:3001/api/observaciones';

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

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const getResponseErrorMessage = (payload: BackendBaseResponse | null, fallback: string): string =>
  payload?.error ?? payload?.message ?? fallback;

const toObservation = (row: BackendObservation, fallbackBrotherId: string): Observation => ({
  id: row.id || `observation-${Date.now()}`,
  brotherId: row.brotherId || fallbackBrotherId,
  text: row.text || '',
  author: row.author || 'Sin autor',
  role: normalizeRole(row.role),
  createdAt: row.createdAt || new Date().toISOString(),
  process: normalizeProcess(row.process),
});

export const getObservations = async (brotherId: string): Promise<Observation[]> => {
  if (!brotherId) {
    return [];
  }

  const response = await fetch(`${API_URL}/${encodeURIComponent(brotherId)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await parseJson<BackendGetResponse>(response);

  if (!response.ok) {
    throw new Error(getResponseErrorMessage(payload, 'No se pudieron obtener observaciones.'));
  }

  if (payload?.ok === false) {
    throw new Error(getResponseErrorMessage(payload, 'El backend devolvió un error al obtener observaciones.'));
  }

  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return sortByCreatedAtDesc(rows.map((row) => toObservation(row, brotherId)));
};

export const addObservation = async (brotherId: string, observation: Observation): Promise<Observation> => {
  if (!brotherId) {
    throw new Error('brotherId es obligatorio para agregar observaciones.');
  }

  const text = observation.text.trim();
  if (!text) {
    throw new Error('text es obligatorio para agregar observaciones.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      brotherId,
      text,
      author: observation.author,
      role: observation.role,
      process: observation.process,
    }),
  });

  const payload = await parseJson<BackendCreateResponse>(response);

  if (!response.ok) {
    throw new Error(getResponseErrorMessage(payload, 'No se pudo agregar la observación.'));
  }

  if (payload?.ok === false) {
    throw new Error(getResponseErrorMessage(payload, 'El backend devolvió un error al agregar la observación.'));
  }

  if (payload?.data) {
    return toObservation(payload.data, brotherId);
  }

  return {
    id: `observation-${Date.now()}`,
    brotherId,
    text,
    author: observation.author,
    role: observation.role,
    createdAt: new Date().toISOString(),
    process: observation.process,
  };
};
