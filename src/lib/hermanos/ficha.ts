import type { AuthSession } from '@/lib/auth/types';
import { getVisibleHermanos } from '@/lib/hermanos/visibility';
import type {
  Celula,
  Hermano,
  Observacion,
  Proceso,
  Usuario,
} from '@/lib/sheets/types';

const PROCESS_ORDER = ['altar', 'grupo', 'experiencia', 'eddi', 'discipulo'] as const;

type ProcessKey = (typeof PROCESS_ORDER)[number];

type ProcessStatus = 'pendiente' | 'en_proceso' | 'completado';

export interface HermanoFicha {
  id: string;
  nombreCompleto: string;
  celula: string;
  responsable: string;
  estadoActual: string;
  fechaIngreso: string;
  procesos: Array<{ tipo: ProcessKey; estado: ProcessStatus }>;
  observaciones: Array<{
    id: string;
    fecha: string;
    comentario: string;
    tipo: string;
    autor: string;
  }>;
}

interface BuildFichaParams {
  hermanoId: string;
  session: AuthSession;
  usuarioActual: Usuario | null;
  hermanos: Hermano[];
  celulas: Celula[];
  usuarios: Usuario[];
  procesos: Proceso[];
  observaciones: Observacion[];
}

function normalizeEstado(value: string | undefined): ProcessStatus {
  if (value === 'en_proceso' || value === 'completado') {
    return value;
  }

  return 'pendiente';
}

function normalizeDateToTimestamp(dateValue: string): number {
  const parsed = Date.parse(dateValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildHermanoFicha({
  hermanoId,
  session,
  usuarioActual,
  hermanos,
  celulas,
  usuarios,
  procesos,
  observaciones,
}: BuildFichaParams): HermanoFicha | null {
  const visibles = getVisibleHermanos({ session, usuarioActual, hermanos });
  const hermano = visibles.find((item) => item.id === hermanoId);

  if (!hermano) {
    return null;
  }

  const celulasById = new Map(celulas.map((celula) => [celula.id, celula]));
  const usuariosById = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

  const celula = hermano.celulaId ? celulasById.get(hermano.celulaId) : null;
  const responsable = celula?.liderId ? usuariosById.get(celula.liderId) : null;

  const procesosPorTipo = new Map(
    procesos
      .filter((proceso) => proceso.hermanoId === hermano.id)
      .map((proceso) => [proceso.tipo.trim().toLowerCase(), proceso]),
  );

  const procesosResumen = PROCESS_ORDER.map((tipo) => ({
    tipo,
    estado: normalizeEstado(procesosPorTipo.get(tipo)?.estado?.trim().toLowerCase()),
  }));

  const observacionesResumen = observaciones
    .filter((observacion) => observacion.hermanoId === hermano.id)
    .map((observacion) => ({
      id: observacion.id,
      fecha: observacion.fecha || 'Sin fecha',
      comentario: observacion.comentario || observacion.detalle || 'Sin comentario',
      tipo: observacion.tipo || 'general',
      autor: observacion.autorId
        ? usuariosById.get(observacion.autorId)?.nombre ?? 'Autor desconocido'
        : 'Sin autor',
    }))
    .sort((a, b) => normalizeDateToTimestamp(b.fecha) - normalizeDateToTimestamp(a.fecha));

  return {
    id: hermano.id,
    nombreCompleto: `${hermano.nombres} ${hermano.apellidos}`.trim() || 'Sin nombre',
    celula: celula?.nombre ?? 'Sin célula',
    responsable: responsable?.nombre ?? 'Sin responsable',
    estadoActual: hermano.estado ?? 'Sin estado',
    fechaIngreso: hermano.fechaIngreso ?? hermano.creadoEn ?? 'Sin fecha',
    procesos: procesosResumen,
    observaciones: observacionesResumen,
  };
}
