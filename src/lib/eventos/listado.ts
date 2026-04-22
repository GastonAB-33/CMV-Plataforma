import type { AuthSession } from '@/lib/auth/types';
import type { Celula, Evento, Usuario } from '@/lib/sheets/types';

export interface EventoListadoItem {
  id: string;
  tipoContenido: 'evento' | 'noticia';
  titulo: string;
  tipo: string;
  celula: string;
  fecha: string;
  hora: string;
  canalPublicacion: 'interna' | 'publica';
  estadoPublicacion: 'borrador' | 'publicado' | 'archivado';
  syncPublicaEstado: 'no_aplica' | 'pendiente' | 'sincronizado' | 'error';
  resumen: string;
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

  return eventos.filter(
    (evento) => !evento.celulaId || evento.celulaId === usuarioActual.celulaId,
  );
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

  return visibles
    .slice()
    .sort((left, right) => {
      const leftTime = Date.parse(left.actualizadoEn ?? left.creadoEn ?? '');
      const rightTime = Date.parse(right.actualizadoEn ?? right.creadoEn ?? '');
      return (
        (Number.isNaN(rightTime) ? 0 : rightTime) -
        (Number.isNaN(leftTime) ? 0 : leftTime)
      );
    })
    .map((evento) => {
      const isNoticia = evento.tipoContenido === 'noticia';

      return {
        id: evento.id,
        tipoContenido: evento.tipoContenido,
        titulo: evento.titulo || 'Sin titulo',
        tipo: isNoticia ? 'noticia' : (evento.tipoEvento ?? 'grupal'),
        celula: evento.celulaId
          ? celulasById.get(evento.celulaId)?.nombre ?? 'Sin celula'
          : 'General',
        fecha: isNoticia
          ? (evento.noticiaFecha ?? 'Sin fecha')
          : (evento.fechaRealizacion ?? 'Sin fecha'),
        hora: isNoticia ? '-' : (evento.horaRealizacion ?? '-'),
        canalPublicacion: evento.canalPublicacion,
        estadoPublicacion: evento.estadoPublicacion,
        syncPublicaEstado: evento.syncPublicaEstado ?? 'no_aplica',
        resumen: isNoticia
          ? (evento.noticiaTexto ?? evento.descripcion ?? 'Sin resumen')
          : (evento.descripcion ?? '-'),
        creador: evento.creadorId
          ? usuariosById.get(evento.creadorId)?.nombre ?? 'Sin creador'
          : 'Sin creador',
      };
    });
}
