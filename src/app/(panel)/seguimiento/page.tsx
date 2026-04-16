import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { requireAuth } from '@/lib/auth/guards';
import { buildSeguimientoRows, seguimientoProcessOrder } from '@/lib/seguimiento/resumen';
import { CelulasService } from '@/lib/sheets/services/celulas.service';
import { HermanosService } from '@/lib/sheets/services/hermanos.service';
import { ProcesosService } from '@/lib/sheets/services/procesos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

const estadoColorClass: Record<'pendiente' | 'en_proceso' | 'completado', string> = {
  pendiente: 'bg-slate-100 text-slate-700',
  en_proceso: 'bg-amber-100 text-amber-800',
  completado: 'bg-emerald-100 text-emerald-800',
};

export default async function SeguimientoPage() {
  const session = await requireAuth();

  const hermanosService = new HermanosService();
  const celulasService = new CelulasService();
  const usuariosService = new UsuariosService();
  const procesosService = new ProcesosService();

  const [hermanos, celulas, usuarios, procesos, usuarioActual] = await Promise.all([
    hermanosService.list(),
    celulasService.list(),
    usuariosService.list(),
    procesosService.list(),
    usuariosService.findByEmail(session.email),
  ]);

  const rows = buildSeguimientoRows({
    session,
    usuarioActual,
    hermanos,
    celulas,
    usuarios,
    procesos,
  });

  return (
    <section>
      <PageTitle
        title="Seguimiento"
        description="Resumen visual del avance de procesos por hermano."
      />

      <Card className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-600">
              No hay registros de seguimiento disponibles para mostrar.
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
                    Etapa actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Estado general
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Procesos
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-sm text-slate-900"><Link href={`/hermanos/${row.id}`} className="text-primary hover:underline">{row.nombre}</Link></td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.celula}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.responsable}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{row.etapaActual}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${estadoColorClass[row.estadoGeneral]}`}
                      >
                        {row.estadoGeneral}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {seguimientoProcessOrder.map((proceso) => (
                          <span
                            key={`${row.id}-${proceso}`}
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${estadoColorClass[row.procesos[proceso]]}`}
                          >
                            {proceso}: {row.procesos[proceso]}
                          </span>
                        ))}
                      </div>
                    </td>
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
