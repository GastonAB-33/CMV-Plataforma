import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isAllowedRole } from '@/lib/auth/constants';
import { buildPublicFeed } from '@/lib/eventos/public-feed';
import { getVisibleEventos } from '@/lib/eventos/listado';
import { EventosService } from '@/lib/sheets/services/eventos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';
import type { Evento } from '@/lib/sheets/types';

function nowIsoDate(): string {
  return new Date().toISOString();
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function canPublishPublicByRole(role: string): boolean {
  return role === 'apostol' || role === 'pastor';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope');
  const eventosService = new EventosService();
  const eventos = await eventosService.list();

  if (scope === 'publico') {
    const payload = buildPublicFeed(eventos);
    return NextResponse.json(payload);
  }

  const session = await getSession();

  if (!session || !isAllowedRole(session.rol)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const usuariosService = new UsuariosService();
  const usuarioActual = await usuariosService.findByEmail(session.email);
  const visibles = getVisibleEventos(session, usuarioActual, eventos);

  return NextResponse.json({ items: visibles });
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !isAllowedRole(session.rol)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const tipoContenido = String(body?.tipoContenido ?? '').trim().toLowerCase();
  const titulo = String(body?.titulo ?? '').trim();
  const tipoEvento = String(body?.tipoEvento ?? '').trim().toLowerCase();
  const celulaId = String(body?.celulaId ?? '').trim();
  const fechaRealizacion = String(body?.fechaRealizacion ?? '').trim();
  const horaRealizacion = String(body?.horaRealizacion ?? '').trim();
  const descripcion = String(body?.descripcion ?? '').trim();

  const canalPublicacion = String(body?.canalPublicacion ?? '').trim().toLowerCase();
  const estadoPublicacion = String(body?.estadoPublicacion ?? 'publicado')
    .trim()
    .toLowerCase();

  const noticiaFecha = String(body?.noticiaFecha ?? '').trim();
  const noticiaTexto = String(body?.noticiaTexto ?? '').trim();
  const noticiaImagen = String(body?.noticiaImagen ?? '').trim();
  const noticiaBadge = String(body?.noticiaBadge ?? '').trim();
  const noticiaLink = String(body?.noticiaLink ?? '').trim();

  if (!titulo || (tipoContenido !== 'evento' && tipoContenido !== 'noticia')) {
    return NextResponse.json(
      { error: 'Debes enviar tipoContenido valido y titulo.' },
      { status: 400 },
    );
  }

  if (canalPublicacion !== 'interna' && canalPublicacion !== 'publica') {
    return NextResponse.json(
      { error: 'canalPublicacion debe ser "interna" o "publica".' },
      { status: 400 },
    );
  }

  if (
    estadoPublicacion !== 'borrador' &&
    estadoPublicacion !== 'publicado' &&
    estadoPublicacion !== 'archivado'
  ) {
    return NextResponse.json(
      { error: 'estadoPublicacion invalido.' },
      { status: 400 },
    );
  }

  if (canalPublicacion === 'publica' && !canPublishPublicByRole(session.rol)) {
    return NextResponse.json(
      { error: 'Tu rol no tiene permiso para publicar en la web publica.' },
      { status: 403 },
    );
  }

  if (tipoContenido === 'evento') {
    if (!celulaId || !fechaRealizacion || (tipoEvento !== 'grupal' && tipoEvento !== 'individual')) {
      return NextResponse.json(
        { error: 'El evento requiere celula, fechaRealizacion y tipoEvento valido.' },
        { status: 400 },
      );
    }
  }

  if (tipoContenido === 'noticia') {
    if (!noticiaFecha || !noticiaTexto) {
      return NextResponse.json(
        { error: 'La noticia requiere noticiaFecha y noticiaTexto.' },
        { status: 400 },
      );
    }

    if (canalPublicacion === 'publica') {
      if (!noticiaImagen || !isHttpUrl(noticiaImagen)) {
        return NextResponse.json(
          { error: 'La noticia publica requiere noticiaImagen con URL valida.' },
          { status: 400 },
        );
      }

      if (!noticiaBadge) {
        return NextResponse.json(
          { error: 'La noticia publica requiere noticiaBadge.' },
          { status: 400 },
        );
      }

      if (!noticiaLink || !isHttpUrl(noticiaLink)) {
        return NextResponse.json(
          { error: 'La noticia publica requiere noticiaLink con URL valida.' },
          { status: 400 },
        );
      }
    }
  }

  const usuariosService = new UsuariosService();
  const usuarioActual = await usuariosService.findByEmail(session.email);

  if (!usuarioActual) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 401 });
  }

  if (session.rol !== 'apostol' && usuarioActual.celulaId !== celulaId) {
    return NextResponse.json(
      { error: 'Solo puedes crear publicaciones para tu celula.' },
      { status: 403 },
    );
  }

  const eventosService = new EventosService();
  const now = nowIsoDate();

  const nuevoEvento: Evento = {
    id: crypto.randomUUID(),
    tipoContenido: tipoContenido as Evento['tipoContenido'],
    titulo,
    tipoEvento:
      tipoContenido === 'evento'
        ? (tipoEvento as Evento['tipoEvento'])
        : undefined,
    celulaId: celulaId || undefined,
    fechaRealizacion: tipoContenido === 'evento' ? fechaRealizacion : undefined,
    horaRealizacion: tipoContenido === 'evento' ? horaRealizacion : undefined,
    descripcion: descripcion || undefined,
    canalPublicacion: canalPublicacion as Evento['canalPublicacion'],
    estadoPublicacion: estadoPublicacion as Evento['estadoPublicacion'],
    publicadoEnInterna: estadoPublicacion === 'publicado' ? now : '',
    publicadoEnPublica:
      estadoPublicacion === 'publicado' && canalPublicacion === 'publica' ? now : '',
    syncPublicaEstado:
      canalPublicacion === 'publica' && estadoPublicacion === 'publicado'
        ? 'sincronizado'
        : 'no_aplica',
    syncPublicaError: '',
    noticiaFecha: tipoContenido === 'noticia' ? noticiaFecha : undefined,
    noticiaTexto: tipoContenido === 'noticia' ? noticiaTexto : undefined,
    noticiaImagen: tipoContenido === 'noticia' ? noticiaImagen : undefined,
    noticiaBadge: tipoContenido === 'noticia' ? noticiaBadge : undefined,
    noticiaLink: tipoContenido === 'noticia' ? noticiaLink : undefined,
    creadorId: usuarioActual.id,
    creadoEn: now,
    actualizadoEn: now,
  };

  await eventosService.create(nuevoEvento);

  return NextResponse.json({ ok: true });
}
