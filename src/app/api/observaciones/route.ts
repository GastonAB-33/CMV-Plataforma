import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { isAllowedRole } from '@/lib/auth/constants';
import { getVisibleHermanos } from '@/lib/hermanos/visibility';
import { HermanosService } from '@/lib/sheets/services/hermanos.service';
import { ObservacionesService } from '@/lib/sheets/services/observaciones.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';
import type { Observacion } from '@/lib/sheets/types';

function nowDateIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || !isAllowedRole(session.rol)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const hermanoId = String(body?.hermanoId ?? '').trim();
  const comentario = String(body?.comentario ?? '').trim();

  if (!hermanoId || !comentario) {
    return NextResponse.json(
      { error: 'Debes enviar hermanoId y comentario.' },
      { status: 400 },
    );
  }

  const usuariosService = new UsuariosService();
  const hermanosService = new HermanosService();

  const [usuarioActual, hermanos] = await Promise.all([
    usuariosService.findByEmail(session.email),
    hermanosService.list(),
  ]);

  if (!usuarioActual) {
    return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 401 });
  }

  const visibles = getVisibleHermanos({
    session,
    usuarioActual,
    hermanos,
  });

  const autorizado = visibles.some((hermano) => hermano.id === hermanoId);

  if (!autorizado) {
    return NextResponse.json(
      { error: 'No tienes permiso para agregar observaciones a este hermano.' },
      { status: 403 },
    );
  }

  const observacionesService = new ObservacionesService();

  const nuevaObservacion: Observacion = {
    id: crypto.randomUUID(),
    hermanoId,
    autorId: usuarioActual.id,
    fecha: nowDateIso(),
    detalle: comentario,
    comentario,
  };

  await observacionesService.create(nuevaObservacion);

  return NextResponse.json({ ok: true });
}
