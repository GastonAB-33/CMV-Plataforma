import { BaseEntityService } from '@/lib/sheets/services/base-entity.service';
import type { Evento } from '@/lib/sheets/types';

export class EventosService extends BaseEntityService<'Eventos'> {
  constructor() {
    super('Eventos');
  }

  protected fromRow(row: Record<string, string>): Evento {
    const normalizedTipoContenido = row.tipoContenido?.trim().toLowerCase();
    const tipoContenido: Evento['tipoContenido'] =
      normalizedTipoContenido === 'noticia' ? 'noticia' : 'evento';

    const normalizedTipoEvento =
      (row.tipoEvento ?? row.tipo)?.trim().toLowerCase() === 'individual'
        ? 'individual'
        : 'grupal';

    const normalizedCanal = row.canalPublicacion?.trim().toLowerCase();
    const canalPublicacion: Evento['canalPublicacion'] =
      normalizedCanal === 'publica' ? 'publica' : 'interna';

    const normalizedEstado = row.estadoPublicacion?.trim().toLowerCase();
    const estadoPublicacion: Evento['estadoPublicacion'] =
      normalizedEstado === 'borrador' || normalizedEstado === 'archivado'
        ? normalizedEstado
        : 'publicado';

    const normalizedSync = row.syncPublicaEstado?.trim().toLowerCase();
    const syncPublicaEstado: Evento['syncPublicaEstado'] =
      normalizedSync === 'pendiente' ||
      normalizedSync === 'sincronizado' ||
      normalizedSync === 'error' ||
      normalizedSync === 'no_aplica'
        ? normalizedSync
        : canalPublicacion === 'publica'
          ? 'sincronizado'
          : 'no_aplica';

    return {
      id: row.id ?? '',
      tipoContenido,
      titulo: row.titulo ?? row.nombre ?? '',
      tipoEvento: normalizedTipoEvento,
      celulaId: row.celulaId,
      fechaRealizacion: row.fechaRealizacion ?? row.fecha ?? '',
      horaRealizacion: row.horaRealizacion ?? row.hora,
      canalPublicacion,
      estadoPublicacion,
      publicadoEnInterna: row.publicadoEnInterna,
      publicadoEnPublica: row.publicadoEnPublica,
      syncPublicaEstado,
      syncPublicaError: row.syncPublicaError,
      noticiaFecha: row.noticiaFecha,
      noticiaTexto: row.noticiaTexto,
      noticiaImagen: row.noticiaImagen,
      noticiaBadge: row.noticiaBadge,
      noticiaLink: row.noticiaLink,
      creadorId: row.creadorId,
      descripcion: row.descripcion,
      creadoEn: row.creadoEn,
      actualizadoEn: row.actualizadoEn,
    };
  }

  protected toRow(entity: Evento): Record<string, string> {
    return {
      id: entity.id,
      tipoContenido: entity.tipoContenido,
      titulo: entity.titulo,
      tipoEvento: entity.tipoEvento ?? '',
      tipo: entity.tipoEvento ?? '',
      celulaId: entity.celulaId ?? '',
      fechaRealizacion: entity.fechaRealizacion ?? '',
      fecha: entity.fechaRealizacion ?? '',
      horaRealizacion: entity.horaRealizacion ?? '',
      hora: entity.horaRealizacion ?? '',
      creadorId: entity.creadorId ?? '',
      descripcion: entity.descripcion ?? '',
      canalPublicacion: entity.canalPublicacion,
      estadoPublicacion: entity.estadoPublicacion,
      publicadoEnInterna: entity.publicadoEnInterna ?? '',
      publicadoEnPublica: entity.publicadoEnPublica ?? '',
      syncPublicaEstado: entity.syncPublicaEstado ?? '',
      syncPublicaError: entity.syncPublicaError ?? '',
      noticiaFecha: entity.noticiaFecha ?? '',
      noticiaTexto: entity.noticiaTexto ?? '',
      noticiaImagen: entity.noticiaImagen ?? '',
      noticiaBadge: entity.noticiaBadge ?? '',
      noticiaLink: entity.noticiaLink ?? '',
      creadoEn: entity.creadoEn ?? '',
      actualizadoEn: entity.actualizadoEn ?? '',
    };
  }
}
