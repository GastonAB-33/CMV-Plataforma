import { Card } from '@/components/ui/card';
import { PageTitle } from '@/components/ui/page-title';
import { requireAuth } from '@/lib/auth/guards';
import { EventoForm } from '@/components/eventos/evento-form';
import { buildEventosListado } from '@/lib/eventos/listado';
import { CelulasService } from '@/lib/sheets/services/celulas.service';
import { EventosService } from '@/lib/sheets/services/eventos.service';
import { UsuariosService } from '@/lib/sheets/services/usuarios.service';

function formatTipoPublicacion(tipoContenido: 'evento' | 'noticia', tipo: string): string {
  if (tipoContenido === 'noticia') {
    return 'noticia';
  }
  return `evento (${tipo})`;
}

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

  const canPublishPublic = session.rol === 'apostol' || session.rol === 'pastor';

  return (
    <section className="space-y-6">
      <PageTitle
        title="Eventos y Noticias"
        description="Gestion unificada para contenido interno y publicacion en web publica."
      />

      <Card>
        <h2 className="mb-4 text-base font-semibold">Crear publicacion</h2>
        <EventoForm
          celulas={celulasDisponibles.map((celula) => ({
            id: celula.id,
            nombre: celula.nombre,
          }))}
          defaultCelulaId={usuarioActual?.celulaId}
          disableCelulaSelection={session.rol !== 'apostol'}
          canPublishPublic={canPublishPublic}
        />
      </Card>

      <Card className="overflow-hidden p-0">
        {listado.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-600">No hay publicaciones para mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Titulo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Celula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Publicacion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Web publica
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Creador
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {listado.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <p className="font-medium">{evento.titulo}</p>
                      <p className="text-xs text-slate-500">{evento.resumen}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatTipoPublicacion(evento.tipoContenido, evento.tipo)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.celula}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.fecha}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.hora}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {evento.canalPublicacion} / {evento.estadoPublicacion}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{evento.syncPublicaEstado}</td>
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
