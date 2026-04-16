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
}

export function EventoForm({
  celulas,
  defaultCelulaId,
  disableCelulaSelection = false,
}: EventoFormProps) {
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<'grupal' | 'individual'>('grupal');
  const [celulaId, setCelulaId] = useState(defaultCelulaId ?? celulas[0]?.id ?? '');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCelulas = useMemo(() => celulas.length > 0, [celulas.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, tipo, celulaId, fecha, hora }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'No se pudo crear el evento.');
        return;
      }

      setSuccess('Evento creado correctamente. Recarga la página para ver el listado actualizado.');
      setTitulo('');
      setFecha('');
      setHora('');
    } catch {
      setError('Error de red al crear el evento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Título</span>
          <input
            className="w-full rounded-md border border-border px-3 py-2"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            required
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Tipo</span>
          <select
            className="w-full rounded-md border border-border px-3 py-2"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as 'grupal' | 'individual')}
          >
            <option value="grupal">grupal</option>
            <option value="individual">individual</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Célula</span>
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
          <span className="font-medium">Fecha</span>
          <input
            type="date"
            className="w-full rounded-md border border-border px-3 py-2"
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            required
          />
        </label>

        <label className="space-y-1 text-sm md:col-span-2">
          <span className="font-medium">Hora</span>
          <input
            type="time"
            className="w-full rounded-md border border-border px-3 py-2"
            value={hora}
            onChange={(event) => setHora(event.target.value)}
          />
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={loading || !hasCelulas}>
        {loading ? 'Guardando...' : 'Registrar evento'}
      </Button>
    </form>
  );
}
