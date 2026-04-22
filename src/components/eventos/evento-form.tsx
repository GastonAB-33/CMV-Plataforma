'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CelulaOption {
  id: string;
  nombre: string;
}

interface EventoFormProps {
  celulas: CelulaOption[];
  defaultCelulaId?: string;
  disableCelulaSelection?: boolean;
  canPublishPublic?: boolean;
}

type TipoContenido = 'evento' | 'noticia';
type TipoEvento = 'grupal' | 'individual';
type CanalPublicacion = 'interna' | 'publica';

export function EventoForm({
  celulas,
  defaultCelulaId,
  disableCelulaSelection = false,
  canPublishPublic = false,
}: EventoFormProps) {
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>('evento');
  const [titulo, setTitulo] = useState('');
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>('grupal');
  const [celulaId, setCelulaId] = useState(defaultCelulaId ?? celulas[0]?.id ?? '');
  const [fechaRealizacion, setFechaRealizacion] = useState('');
  const [horaRealizacion, setHoraRealizacion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [canalPublicacion, setCanalPublicacion] = useState<CanalPublicacion>('interna');

  const [noticiaFecha, setNoticiaFecha] = useState('');
  const [noticiaTexto, setNoticiaTexto] = useState('');
  const [noticiaImagen, setNoticiaImagen] = useState('');
  const [noticiaBadge, setNoticiaBadge] = useState('');
  const [noticiaLink, setNoticiaLink] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCelulas = useMemo(() => celulas.length > 0, [celulas.length]);

  const isNoticia = tipoContenido === 'noticia';
  const isPublica = canalPublicacion === 'publica';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoContenido,
          titulo,
          tipoEvento,
          celulaId,
          fechaRealizacion,
          horaRealizacion,
          descripcion,
          canalPublicacion,
          estadoPublicacion: 'publicado',
          noticiaFecha,
          noticiaTexto,
          noticiaImagen,
          noticiaBadge,
          noticiaLink,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'No se pudo crear la publicacion.');
        return;
      }

      setSuccess(
        isNoticia
          ? 'Noticia creada correctamente. Recarga la pagina para ver el listado actualizado.'
          : 'Evento creado correctamente. Recarga la pagina para ver el listado actualizado.',
      );

      setTitulo('');
      setFechaRealizacion('');
      setHoraRealizacion('');
      setDescripcion('');
      setNoticiaFecha('');
      setNoticiaTexto('');
      setNoticiaImagen('');
      setNoticiaBadge('');
      setNoticiaLink('');
    } catch {
      setError('Error de red al guardar la publicacion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Contenido</span>
          <select
            className="w-full rounded-md border border-border px-3 py-2"
            value={tipoContenido}
            onChange={(event) => setTipoContenido(event.target.value as TipoContenido)}
          >
            <option value="evento">evento</option>
            <option value="noticia">noticia</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Publicacion</span>
          <select
            className="w-full rounded-md border border-border px-3 py-2"
            value={canalPublicacion}
            onChange={(event) => setCanalPublicacion(event.target.value as CanalPublicacion)}
          >
            <option value="interna">interna</option>
            {canPublishPublic ? <option value="publica">publica</option> : null}
          </select>
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium">Titulo</span>
          <input
            className="w-full rounded-md border border-border px-3 py-2"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            required
          />
        </label>

        {!isNoticia ? (
          <>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Tipo de evento</span>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={tipoEvento}
                onChange={(event) => setTipoEvento(event.target.value as TipoEvento)}
              >
                <option value="grupal">grupal</option>
                <option value="individual">individual</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Celula</span>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={celulaId}
                onChange={(event) => setCelulaId(event.target.value)}
                disabled={!hasCelulas || disableCelulaSelection}
                required
              >
                {celulas.map((celula) => (
                  <option key={celula.id} value={celula.id}>
                    {celula.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Fecha de realizacion</span>
              <input
                type="date"
                className="w-full rounded-md border border-border px-3 py-2"
                value={fechaRealizacion}
                onChange={(event) => setFechaRealizacion(event.target.value)}
                required
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Hora de realizacion</span>
              <input
                type="time"
                className="w-full rounded-md border border-border px-3 py-2"
                value={horaRealizacion}
                onChange={(event) => setHoraRealizacion(event.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Celula</span>
              <select
                className="w-full rounded-md border border-border px-3 py-2"
                value={celulaId}
                onChange={(event) => setCelulaId(event.target.value)}
                disabled={!hasCelulas || disableCelulaSelection}
                required
              >
                {celulas.map((celula) => (
                  <option key={celula.id} value={celula.id}>
                    {celula.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Fecha (texto para web)</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2"
                value={noticiaFecha}
                onChange={(event) => setNoticiaFecha(event.target.value)}
                placeholder="Ej: Abril 2026 / Hoy"
                required
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Texto (bajada corta)</span>
              <textarea
                className="min-h-28 w-full rounded-md border border-border px-3 py-2"
                value={noticiaTexto}
                onChange={(event) => setNoticiaTexto(event.target.value)}
                required
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Imagen (URL)</span>
              <input
                type="url"
                className="w-full rounded-md border border-border px-3 py-2"
                value={noticiaImagen}
                onChange={(event) => setNoticiaImagen(event.target.value)}
                required={isPublica}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Badge</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2"
                value={noticiaBadge}
                onChange={(event) => setNoticiaBadge(event.target.value)}
                required={isPublica}
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Link de mas informacion</span>
              <input
                type="url"
                className="w-full rounded-md border border-border px-3 py-2"
                value={noticiaLink}
                onChange={(event) => setNoticiaLink(event.target.value)}
                required={isPublica}
              />
            </label>
          </>
        )}

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium">Descripcion interna</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-border px-3 py-2"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder={
              isNoticia
                ? 'Notas internas o contexto adicional.'
                : 'Detalle opcional del evento.'
            }
          />
        </label>
      </div>

      {isNoticia && isPublica ? (
        <p className="text-xs text-amber-700">
          Para noticia publica se validan los campos de web: titulo, fecha, texto, imagen, badge y
          link.
        </p>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={loading || !hasCelulas}>
        {loading
          ? 'Guardando...'
          : isNoticia
            ? 'Publicar noticia'
            : 'Registrar evento'}
      </Button>
    </form>
  );
}
