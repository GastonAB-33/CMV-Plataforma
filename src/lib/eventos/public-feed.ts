import type { Evento } from '@/lib/sheets/types';

export interface PublicNewsItem {
  id: string;
  titulo: string;
  fecha: string;
  texto: string;
  imagen: string;
  badge: string;
  link: string;
  actualizadoEn: string;
}

export interface PublicEventItem {
  id: string;
  titulo: string;
  fechaRealizacion: string;
  horaRealizacion: string;
  descripcion: string;
  tipoEvento: string;
  celulaId: string;
  actualizadoEn: string;
}

export interface PublicFeedResponse {
  noticias: PublicNewsItem[];
  eventos: PublicEventItem[];
}

function toTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function isPublicadoEnWeb(item: Evento): boolean {
  return item.canalPublicacion === 'publica' && item.estadoPublicacion === 'publicado';
}

export function buildPublicFeed(eventos: Evento[]): PublicFeedResponse {
  const publicados = eventos.filter(isPublicadoEnWeb);

  const noticias = publicados
    .filter((item) => item.tipoContenido === 'noticia')
    .map((item) => ({
      id: item.id,
      titulo: item.titulo,
      fecha: item.noticiaFecha ?? '',
      texto: item.noticiaTexto ?? item.descripcion ?? '',
      imagen: item.noticiaImagen ?? '',
      badge: item.noticiaBadge ?? '',
      link: item.noticiaLink ?? '',
      actualizadoEn: item.actualizadoEn ?? item.creadoEn ?? '',
    }))
    .filter(
      (item) =>
        item.titulo.trim() &&
        item.fecha.trim() &&
        item.texto.trim() &&
        item.imagen.trim() &&
        item.badge.trim() &&
        item.link.trim(),
    )
    .sort((left, right) => toTimestamp(right.actualizadoEn) - toTimestamp(left.actualizadoEn));

  const eventosPublicos = publicados
    .filter((item) => item.tipoContenido === 'evento')
    .map((item) => ({
      id: item.id,
      titulo: item.titulo,
      fechaRealizacion: item.fechaRealizacion ?? '',
      horaRealizacion: item.horaRealizacion ?? '',
      descripcion: item.descripcion ?? '',
      tipoEvento: item.tipoEvento ?? 'grupal',
      celulaId: item.celulaId ?? '',
      actualizadoEn: item.actualizadoEn ?? item.creadoEn ?? '',
    }))
    .filter((item) => item.titulo.trim() && item.fechaRealizacion.trim())
    .sort((left, right) => toTimestamp(right.actualizadoEn) - toTimestamp(left.actualizadoEn));

  return {
    noticias,
    eventos: eventosPublicos,
  };
}
