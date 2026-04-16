import type { AuthSession } from '@/lib/auth/types';
import type { Hermano, Usuario } from '@/lib/sheets/types';

interface BuildVisibleHermanosParams {
  session: AuthSession;
  usuarioActual: Usuario | null;
  hermanos: Hermano[];
}

export function getVisibleHermanos({
  session,
  usuarioActual,
  hermanos,
}: BuildVisibleHermanosParams): Hermano[] {
  if (session.rol === 'apostol') {
    return hermanos;
  }

  if (!usuarioActual?.celulaId) {
    return [];
  }

  return hermanos.filter((hermano) => hermano.celulaId === usuarioActual.celulaId);
}
