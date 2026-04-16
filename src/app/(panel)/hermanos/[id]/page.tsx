import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { ObservacionForm } from '@/components/hermanos/observacion-form';
import { requireAuth } from '@/lib/auth/guards';
import { buildHermanoFicha } from '@/lib/hermanos/ficha';
import { CelulasService } from '@/lib/sheets/services/celulas.service';
import { HermanosService } from '@/lib/sheets/services/hermanos.service';
import { ObservacionesService } from '@/lib/sheets/services/observaciones.service';
import { ProcesosService } from '@/lib/sheets/services/procesos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

const estadoColorClass: Record<'pendiente' | 'en_proceso' | 'completado', string> = {
  pendiente: 'bg-slate-100 text-slate-700',
  en_proceso: 'bg-amber-100 text-amber-800',
  completado: 'bg-emerald-100 text-emerald-800',
};

export default async function HermanoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const hermanosService = new HermanosService();
  const celulasService = new CelulasService();
  const usuariosService = new UsuariosService();
  const procesosService = new ProcesosService();
  const observacionesService = new ObservacionesService();

  const [hermanos, celulas, usuarios, procesos, observaciones, usuarioActual] = await Promise.all([
    hermanosService.list(),
    celulasService.list(),
    usuariosService.list(),
    procesosService.list(),
    observacionesService.list(),
    usuariosService.findByEmail(session.email),
  ]);

  const ficha = buildHermanoFicha({
    hermanoId: id,
    session,
    usuarioActual,
    hermanos,
    celulas,
    usuarios,
    procesos,
    observaciones,
  });

  if (!ficha) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title={ficha.nombreCompleto}
          description="Ficha individual de seguimiento del hermano."
        />
        <Link href="/hermanos" className="text-sm font-medium text-primary hover:underline">
          Volver a Hermanos
        </Link>
      </div>

      <Card>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Célula</dt>
            <dd className="text-sm text-slate-800">{ficha.celula}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Responsable</dt>
            <dd className="text-sm text-slate-800">{ficha.responsable}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Estado actual</dt>
            <dd className="text-sm text-slate-800">{ficha.estadoActual}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Fecha de ingreso</dt>
            <dd className="text-sm text-slate-800">{ficha.fechaIngreso}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Procesos del seguimiento</h2>
        <div className="flex flex-wrap gap-2">
          {ficha.procesos.map((proceso) => (
            <span
              key={proceso.tipo}
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${estadoColorClass[proceso.estado]}`}
            >
              {proceso.tipo}: {proceso.estado}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Agregar observación</h2>
        <ObservacionForm hermanoId={ficha.id} />
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold">Observaciones</h2>
        {ficha.observaciones.length === 0 ? (
          <p className="text-sm text-slate-600">No hay observaciones registradas.</p>
        ) : (
          <ul className="space-y-3">
            {ficha.observaciones.map((observacion) => (
              <li key={observacion.id} className="rounded-md border border-border p-3">
                <p className="text-xs text-slate-500">
                  {observacion.fecha} · {observacion.tipo} · {observacion.autor}
                </p>
                <p className="mt-1 text-sm text-slate-800">{observacion.comentario}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
