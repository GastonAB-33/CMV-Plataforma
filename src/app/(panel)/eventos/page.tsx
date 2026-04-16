import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { requireAuth } from '@/lib/auth/guards';
import { EventoForm } from '@/components/eventos/evento-form';
import { buildEventosListado } from '@/lib/eventos/listado';
import { CelulasService } from '@/lib/sheets/services/celulas.service';
import { EventosService } from '@/lib/sheets/services/eventos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

export default async function EventosPage() {
  const session = await requireAuth();
  const eventosService = new EventosService();
  const celulasService = new CelulasService();
  const usuariosService = new UsuariosService();

  const [eventos, celulas, usuarios, usuarioActual] = await Promise.all([
    eventosService.list(),
    celulasService.list(),
    usuariosService.list(),
    usuariosService.findByEmail(session.email),
  ]);

  const listado = buildEventosListado({
    session,
    usuarioActual,
    eventos,
    celulas,
    usuarios,
  });

  const celulasDisponibles =
    session.rol === 'apostol'
      ? celulas
      : celulas.filter((celula) => celula.id === usuarioActual?.celulaId);

  return (
    <section className="space-y-6">
      <PageTitle
        title="Eventos"
        description="Listado y registro básico de eventos internos."
      />

      <Card>
        <h2 className="mb-4 text-base font-semibold">Registrar nuevo evento</h2>
        <EventoForm
          celulas={celulasDisponibles.map((celula) => ({ id: celula.id, nombre: celula.nombre }))}
          defaultCelulaId={usuarioActual?.celulaId}
          disableCelulaSelection={session.rol !== 'apostol'}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        {listado.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-600">No hay eventos para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Célula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Creador
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {listado.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">{evento.titulo}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.tipo}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.celula}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.fecha}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.hora}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.creador}</td>
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
