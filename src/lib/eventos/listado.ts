import type { AuthSession } from '@/lib/auth/types';
import type { Celula, Evento, Usuario } from '@/lib/sheets/types';

export interface EventoListadoItem {
  id: string;
  titulo: string;
  tipo: 'grupal' | 'individual';
  celula: string;
  fecha: string;
  hora: string;
  creador: string;
}

interface BuildEventosListadoParams {
  session: AuthSession;
  usuarioActual: Usuario | null;
  eventos: Evento[];
  celulas: Celula[];
  usuarios: Usuario[];
}

export function getVisibleEventos(
  session: AuthSession,
  usuarioActual: Usuario | null,
  eventos: Evento[],
): Evento[] {
  if (session.rol === 'apostol') {
    return eventos;
  }

  if (!usuarioActual?.celulaId) {
    return [];
  }

  return eventos.filter((evento) => evento.celulaId === usuarioActual.celulaId);
}

export function buildEventosListado({
  session,
  usuarioActual,
  eventos,
  celulas,
  usuarios,
}: BuildEventosListadoParams): EventoListadoItem[] {
  const visibles = getVisibleEventos(session, usuarioActual, eventos);
  const celulasById = new Map(celulas.map((celula) => [celula.id, celula]));
  const usuariosById = new Map(usuarios.map((usuario) => [usuario.id, usuario]));

  return visibles.map((evento) => ({
    id: evento.id,
    titulo: evento.titulo || 'Sin título',
    tipo: evento.tipo,
    celula: evento.celulaId ? celulasById.get(evento.celulaId)?.nombre ?? 'Sin célula' : 'Sin célula',
    fecha: evento.fecha || 'Sin fecha',
    hora: evento.hora || 'Sin hora',
    creador: evento.creadorId
      ? usuariosById.get(evento.creadorId)?.nombre ?? 'Sin creador'
      : 'Sin creador',
  }));
}
