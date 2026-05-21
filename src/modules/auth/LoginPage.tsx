import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? ((location.state as { from: string }).from || '/')
      : '/';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesion.');
      return;
    }
    navigate(fromPath, { replace: true });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 sm:p-8 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">CMV Plataforma</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Accede con tu usuario de Supabase. Tu perfil y permisos se cargan segun tu rol.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="pastor@cmv.org"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-gray-300">
              Contrasena
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contrasena"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black py-3 text-sm uppercase tracking-[0.14em] transition-colors"
          >
            {isSubmitting ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
};
