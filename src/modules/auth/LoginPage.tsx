import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');

  const fromPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? ((location.state as { from: string }).from || '/')
      : '/';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login();
    navigate(fromPath, { replace: true });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 sm:p-8 shadow-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">CMV Plataforma</p>
        <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Iniciar sesion</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
          Accede para entrar al panel de seguimiento.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="pastor@cmv.org"
              className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black py-3 text-sm uppercase tracking-[0.14em] transition-colors"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
};
