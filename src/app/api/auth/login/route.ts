import { NextResponse } from 'next/server';
import { createSession } from '@/lib/auth/session';
import { isAllowedRole } from '@/lib/auth/constants';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? '').trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Debes ingresar un email.' }, { status: 400 });
  }

  const usuariosService = new UsuariosService();
  const usuario = await usuariosService.findAuthorizedByEmail(email);

  if (!usuario || !isAllowedRole(usuario.rol)) {
    return NextResponse.json(
      { error: 'Usuario no autorizado o no encontrado.' },
      { status: 401 },
    );
  }

  await createSession({
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  });

  return NextResponse.json({ ok: true });
}
