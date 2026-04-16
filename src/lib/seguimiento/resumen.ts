import type { AuthSession } from '@/lib/auth/types';
import { getVisibleHermanos } from '@/lib/hermanos/visibility';
import type { Celula, Hermano, Proceso, Usuario } from '@/lib/sheets/types';

const PROCESS_ORDER = ['altar', 'grupo', 'experiencia', 'eddi', 'discipulo'] as const;

type ProcessKey = (typeof PROCESS_ORDER)[number];

type ProcessStatus = 'pendiente' | 'en_proceso' | 'completado';

export interface SeguimientoRow {
  id: string;
  nombre: string;
  celula: string;
  responsable: string;
  etapaActual: string;
  estadoGeneral: ProcessStatus;
  procesos: Record<ProcessKey, ProcessStatus>;
}

interface BuildSeguimientoRowsParams {
  session: AuthSession;
  usuarioActual: Usuario | null;
  hermanos: Hermano[];
  celulas: Celula[];
  usuarios: Usuario[];
  procesos: Proceso[];
}

function normalizeStatus(value: string | undefined): ProcessStatus {
  if (value === 'completado' || value === 'en_proceso') {
    return value;
  }

  return 'pendiente';
}

function getNombreCompleto(hermano: Hermano): string {
  return `${hermano.nombres} ${hermano.apellidos}`.trim() || 'Sin nombre';
}

function getEstadoGeneral(procesos: Record<ProcessKey, ProcessStatus>): ProcessStatus {
  const estados = PROCESS_ORDER.map((key) => procesos[key]);

  if (estados.every((estado) => estado === 'completado')) {
    return 'completado';
  }

  if (estados.some((estado) => estado === 'en_proceso')) {
    return 'en_proceso';
  }

  return 'pendiente';
}

function getEtapaActual(procesos: Record<ProcessKey, ProcessStatus>): string {
  const enCurso = PROCESS_ORDER.find((key) => procesos[key] !== 'completado');

  if (!enCurso) {
    return 'Completado';
  }

  return enCurso;
}

export function buildSeguimientoRows({
  session,
  usuarioActual,
  hermanos,
  celulas,
  usuarios,
  procesos,
}: BuildSeguimientoRowsParams): SeguimientoRow[] {
  const hermanosVisibles = getVisibleHermanos({ session, usuarioActual, hermanos });
  const celulasById = new Map(celulas.map((celula) => [celula.id, celula]));
  const usuariosById = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

  return hermanosVisibles.map((hermano) => {
    const procesosHermano = procesos.filter((proceso) => proceso.hermanoId === hermano.id);

    const resumenProcesos = PROCESS_ORDER.reduce<Record<ProcessKey, ProcessStatus>>(
      (acc, processKey) => {
        const proceso = procesosHermano.find(
          (item) => item.tipo.trim().toLowerCase() === processKey,
        );

        acc[processKey] = normalizeStatus(proceso?.estado?.trim().toLowerCase());
        return acc;
      },
      {
        altar: 'pendiente',
        grupo: 'pendiente',
        experiencia: 'pendiente',
        eddi: 'pendiente',
        discipulo: 'pendiente',
      },
    );

    const celula = hermano.celulaId ? celulasById.get(hermano.celulaId) : null;
    const responsable = celula?.liderId ? usuariosById.get(celula.liderId) : null;
    const estadoGeneral = getEstadoGeneral(resumenProcesos);

    return {
      id: hermano.id,
      nombre: getNombreCompleto(hermano),
      celula: celula?.nombre ?? 'Sin célula',
      responsable: responsable?.nombre ?? 'Sin responsable',
      etapaActual: getEtapaActual(resumenProcesos),
      estadoGeneral,
      procesos: resumenProcesos,
    };
  });
}

export const seguimientoProcessOrder = PROCESS_ORDER;
