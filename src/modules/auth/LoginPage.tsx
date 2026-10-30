import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, LockKeyhole, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, loginWithGoogle, requestPasswordReset, updatePassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Recovery mode state
  const isRecoveryParam = searchParams.get('mode') === 'recovery' || window.location.hash.includes('type=recovery');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(isRecoveryParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fromPath =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? ((location.state as { from: string }).from || '/')
      : '/';

  useEffect(() => {
    // Revisar si hubo un rechazo de Whitelist al intentar acceder con Google
    const whitelistErr = window.sessionStorage.getItem('cmv_whitelist_error');
    if (whitelistErr) {
      setError(whitelistErr);
      window.sessionStorage.removeItem('cmv_whitelist_error');
    }
  }, []);

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo iniciar sesion.');
      return;
    }
    navigate(fromPath, { replace: true });
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error ?? 'No se pudo conectar con Google.');
    }
  };

  const handleSendRecoveryEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingresa tu correo electronico registrado.');
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const result = await requestPasswordReset(email.trim());
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo enviar el correo.');
      return;
    }
    setSuccessMessage(
      `Hemos enviado un enlace a ${email.trim()}. Revisa tu bandeja de entrada (y Spam) para crear o actualizar tu contraseña.`
    );
    setIsForgotPasswordOpen(false);
  };

  const handleSetNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const result = await updatePassword(newPassword);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo actualizar la contraseña.');
      return;
    }
    setSuccessMessage('¡Contraseña establecida con éxito! Ahora puedes ingresar con tu nueva clave.');
    setIsResettingPassword(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">CMV Plataforma</p>

        {isResettingPassword ? (
          <div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Crear tu contraseña</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Ingresa tu nueva contraseña para acceder a la plataforma.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSetNewPassword}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Nueva contraseña</label>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Confirmar contraseña</label>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-300/40 bg-rose-500/10 p-3 text-xs text-rose-400">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black py-3 text-sm uppercase tracking-[0.14em] transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Establecer contraseña'}
              </button>

              <button
                type="button"
                onClick={() => setIsResettingPassword(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 mt-2"
              >
                Volver al inicio de sesión
              </button>
            </form>
          </div>
        ) : isForgotPasswordOpen ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Crear o recuperar clave</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Escribe tu correo registrado en la iglesia y te enviaremos un enlace para que definas tu propia contraseña.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSendRecoveryEmail}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-gray-300">Correo electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hermano@gmail.com"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-300/40 bg-rose-500/10 p-3 text-xs text-rose-400">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black py-3 text-sm uppercase tracking-[0.14em] transition-colors"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar enlace de acceso'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Accede a tu panel pastoral, de liderazgo o discipulado de CMV.
            </p>

            {/* Banner de error de Whitelist u otros */}
            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-300/40 bg-rose-500/10 p-3 text-xs text-rose-400">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Banner de éxito */}
            {successMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* BOTÓN GOOGLE OAUTH */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#222222] text-slate-800 dark:text-white font-bold py-3 px-4 text-sm transition-all flex items-center justify-center gap-3 shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <span className="relative bg-white dark:bg-[#111111] px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                o con correo
              </span>
            </div>

            {/* FORMULARIO EMAIL / PASSWORD */}
            <form className="space-y-4" onSubmit={handlePasswordLogin}>
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-gray-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(true);
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-[#c5a059] hover:underline"
                  >
                    ¿Olvidaste o quieres crear tu clave?
                  </button>
                </div>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] py-3 pl-9 pr-3 text-sm text-slate-900 dark:text-white outline-none focus:border-[#c5a059]/60"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black py-3 text-sm uppercase tracking-[0.14em] transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Ingresando...' : 'Entrar'}
              </button>
            </form>
          </div>
        )}

        {/* ACCESO RÁPIDO A DEMO */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/10 text-center">
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-3 font-medium">
            ¿Revisión de demo para el cliente?
          </p>
          <button
            type="button"
            onClick={() => {
              window.localStorage.setItem('cmv_dev_auth', 'true');
              window.location.href = '/';
            }}
            className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold py-3 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <Sparkles size={16} />
            <span>Acceso Rápido a Demostración</span>
          </button>
        </div>
      </section>
    </main>
  );
};
