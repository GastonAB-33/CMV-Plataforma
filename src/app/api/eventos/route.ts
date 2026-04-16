import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isAllowedRole } from '@/lib/auth/constants';
import { EventosService } from '@/lib/sheets/services/eventos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';
import type { Evento } from '@/lib/sheets/types';

function nowIsoDate(): string {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !isAllowedRole(session.rol)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const titulo = String(body?.titulo ?? '').trim();
  const tipo = String(body?.tipo ?? '').trim().toLowerCase();
  const celulaId = String(body?.celulaId ?? '').trim();
  const fecha = String(body?.fecha ?? '').trim();
  const hora = String(body?.hora ?? '').trim();

  if (!titulo || !fecha || !celulaId || (tipo !== 'grupal' && tipo !== 'individual')) {
    return NextResponse.json({ error: 'Datos inválidos para crear evento.' }, { status: 400 });
  }

  const usuariosService = new UsuariosService();
  const usuarioActual = await usuariosService.findByEmail(session.email);

  if (!usuarioActual) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 401 });
  }

  if (session.rol !== 'apostol' && usuarioActual.celulaId !== celulaId) {
    return NextResponse.json(
      { error: 'Solo puedes crear eventos para tu célula.' },
      { status: 403 },
    );
  }

  const eventosService = new EventosService();
  const now = nowIsoDate();

  const nuevoEvento: Evento = {
    id: crypto.randomUUID(),
    titulo,
    tipo,
    celulaId,
    fecha,
    hora,
    creadorId: usuarioActual.id,
    creadoEn: now,
    actualizadoEn: now,
  };

  await eventosService.create(nuevoEvento);

  return NextResponse.json({ ok: true });
}
