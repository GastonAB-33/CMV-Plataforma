'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ObservacionFormProps {
  hermanoId: string;
}

export function ObservacionForm({ hermanoId }: ObservacionFormProps) {
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/observaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hermanoId, comentario }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'No se pudo guardar la observación.');
        return;
      }

      setComentario('');
      setSuccess('Observación registrada correctamente.');
      router.refresh();
    } catch {
      setError('Error de red al guardar la observación.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="space-y-1 text-sm">
        <span className="font-medium">Nueva observación</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-border px-3 py-2"
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          required
          placeholder="Escribe un comentario breve sobre el seguimiento..."
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Agregar observación'}
      </Button>
    </form>
  );
}
