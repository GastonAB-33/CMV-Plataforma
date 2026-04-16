import type { AuthSession } from '@/lib/auth/types';
import { getVisibleHermanos } from '@/lib/hermanos/visibility';
import type { Celula, Hermano, Usuario } from '@/lib/sheets/types';

export interface HermanoListadoItem {
  id: string;
  nombre: string;
  celula: string;
  responsable: string;
  estadoActual: string;
  fechaIngreso: string;
}

interface BuildListadoParams {
  session: AuthSession;
  usuarioActual: Usuario | null;
  hermanos: Hermano[];
  celulas: Celula[];
  usuarios: Usuario[];
}

function getNombreCompleto(hermano: Hermano): string {
  return `${hermano.nombres} ${hermano.apellidos}`.trim();
}

export function buildHermanosListado({
  session,
  usuarioActual,
  hermanos,
  celulas,
  usuarios,
}: BuildListadoParams): HermanoListadoItem[] {
  const celulasPorId = new Map(celulas.map((celula) => [celula.id, celula]));
  const usuariosPorId = new Map(usuarios.map((usuario) => [usuario.id, usuario]));
  const hermanosVisibles = getVisibleHermanos({ session, usuarioActual, hermanos });

  return hermanosVisibles.map((hermano) => {
    const celula = hermano.celulaId ? celulasPorId.get(hermano.celulaId) : null;
    const responsable = celula?.liderId ? usuariosPorId.get(celula.liderId) : null;

    return {
      id: hermano.id,
      nombre: getNombreCompleto(hermano) || 'Sin nombre',
      celula: celula?.nombre ?? 'Sin célula',
      responsable: responsable?.nombre ?? 'Sin responsable',
      estadoActual: hermano.estado ?? 'Sin estado',
      fechaIngreso: hermano.fechaIngreso ?? hermano.creadoEn ?? 'Sin fecha',
    };
  });
}
