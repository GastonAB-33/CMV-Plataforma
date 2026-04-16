'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? 'No se pudo iniciar sesión.');
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Error de red. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="nombre@ejemplo.com"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
