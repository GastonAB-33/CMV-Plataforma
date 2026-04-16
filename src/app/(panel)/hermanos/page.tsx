import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { requireAuth } from '@/lib/auth/guards';
import { buildHermanosListado } from '@/lib/hermanos/listado';
import { CelulasService } from '@/lib/sheets/services/celulas.service';
import { HermanosService } from '@/lib/sheets/services/hermanos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

export default async function HermanosPage() {
  const session = await requireAuth();

  const hermanosService = new HermanosService();
  const celulasService = new CelulasService();
  const usuariosService = new UsuariosService();

  const [hermanos, celulas, usuarios, usuarioActual] = await Promise.all([
    hermanosService.list(),
    celulasService.list(),
    usuariosService.list(),
    usuariosService.findByEmail(session.email),
  ]);

  const listado = buildHermanosListado({
    session,
    usuarioActual,
    hermanos,
    celulas,
    usuarios,
  });

  return (
    <section>
      <PageTitle
        title="Hermanos"
        description="Listado interno de hermanos según permisos de rol y célula."
      />

      <Card className="overflow-hidden p-0">
        {listado.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-600">
              No hay hermanos disponibles para mostrar en este momento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Célula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Responsable
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Estado actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Fecha de ingreso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {listado.map((hermano, index) => (
                  <tr key={`${hermano.nombre}-${index}`}>
                    <td className="px-4 py-3 text-sm text-slate-900"><Link href={`/hermanos/${hermano.id}`} className="text-primary hover:underline">{hermano.nombre}</Link></td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hermano.celula}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hermano.responsable}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hermano.estadoActual}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{hermano.fechaIngreso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
