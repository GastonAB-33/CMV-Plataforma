import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Sparkles,
  LogOut,
  Users,
  Home,
  LineChart,
  GraduationCap,
  HeartHandshake,
  Award,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { brothersService } from '../../services/brothersService';
import { BentoNovedades } from './components/BentoNovedades';
import { BentoLetterC } from './components/BentoLetterC';
import { BentoCardGeneral } from './components/BentoCardGeneral';
import { BentoCardHermanos } from './components/BentoCardHermanos';
import { BentoCardSeguimiento } from './components/BentoCardSeguimiento';
import { BentoCardEddi } from './components/BentoCardEddi';
import { BentoCardMisericordia } from './components/BentoCardMisericordia';
import { BentoCardEdem } from './components/BentoCardEdem';
import { BentoCardCulture } from './components/BentoCardCulture';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estado para el modal de Nuevo Hermano
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newBrotherName, setNewBrotherName] = useState('');
  const [newBrotherCell, setNewBrotherCell] = useState('Vida');
  const [newBrotherStage, setNewBrotherStage] = useState<'Altar' | 'Grupo' | 'Experiencia'>('Altar');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSaveBrother = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const clean = newBrotherName.trim();
    if (!clean) {
      setToast({ text: 'Por favor ingresá el nombre del hermano.', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      const actor = { id: user.id, name: user.name };
      const cellResult = await brothersService.upsertCellAsync(
        { nombre: newBrotherCell, activa: true },
        actor
      );

      if (!cellResult.ok || !cellResult.id) {
        setToast({ text: 'Error preparando la célula.', type: 'error' });
        return;
      }

      const parts = clean.split(/\s+/);
      const nombres = parts.slice(0, -1).join(' ') || parts[0];
      const apellidos = parts.length > 1 ? parts[parts.length - 1] : '-';

      const brotherResult = await brothersService.upsertBrotherAsync(
        {
          nombres,
          apellidos,
          celulaId: cellResult.id,
          estado: newBrotherStage,
        },
        actor
      );

      if (!brotherResult.ok) {
        setToast({ text: 'No se pudo guardar el hermano.', type: 'error' });
        return;
      }

      setToast({ text: 'Hermano registrado exitosamente en el sistema.', type: 'success' });
      setIsModalOpen(false);
      setNewBrotherName('');
    } catch {
      setToast({ text: 'Ocurrió un error al guardar.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors">
            {/* Barra de navegación superior compacta, pegada y luminosa */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 md:px-8 py-2 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y título de marca */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <img
                src="/logo-cmv.png"
                alt="CMV Logo"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9.5px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                  CMV
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-gray-600" />
                <span className="text-[9.5px] font-bold text-slate-500 dark:text-gray-400">
                  Portal Pastoral
                </span>
              </div>
              <p className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                Cristo Manantial de Vida
              </p>
            </div>
          </div>

          {/* Acciones principales compactas con botones cuadrados */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={14} />
              <span>NUEVO HERMANO</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Alternador de tema */}
            <ThemeToggle />

            {/* Menú de sesión */}
            <div className="hidden md:flex items-center gap-2 pl-1">
              <div className="text-right">
                <p className="text-xs font-bold leading-none capitalize">{user.name}</p>
                <p className="text-[9.5px] text-slate-400 dark:text-gray-400 font-semibold lowercase">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void logout().then(() => navigate('/login'))}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal expandido más cerca hacia los cuadros generales */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 space-y-3 sm:space-y-3.5">
        {/* Banner Superior Ancho con Foto de Iglesia Evangélica y Luz, Difuminado y Tipografía Amplia */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl bg-slate-950">
          {/* Foto de reunión de iglesia evangélica con luz visible en su totalidad */}
          <div className="absolute inset-0 -z-0 overflow-hidden">
            <img
              src="/church-gathering.jpg"
              alt="Reunión de Iglesia CMV"
              className="w-full h-full object-cover object-[center_35%] filter brightness-95 contrast-105"
            />
            {/* Difuminado suave: la foto se ve completa sin partes blancas tapándola */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 dark:from-black/90 dark:via-black/65 dark:to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(2,132,199,0.3)_0%,transparent_65%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Contenido con Letra Más Ancha, Más Grande y Botones Cuadrados */}
          <div className="relative z-10 w-full px-5 sm:px-8 md:px-10 pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-10 md:pb-12 flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-black/40 dark:bg-white/15 backdrop-blur-md border border-white/25 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-sm">
                <Sparkles className="text-cyan-300" size={13} />
                <span>Plataforma Congregacional</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-[0.14em] uppercase drop-shadow-xl leading-none">
                CMV
              </h1>
              <p className="text-base sm:text-xl font-black uppercase tracking-wider text-sky-100 drop-shadow-md">
                Cristo Manantial de Vida
              </p>
              <p className="text-xs sm:text-sm text-cyan-100 font-medium max-w-xl drop-shadow-sm leading-relaxed">
                Acceso a la vida comunitaria, redes de células, discipulado y seguimiento pastoral.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto justify-center btn-3d-emerald text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black flex items-center gap-2 uppercase tracking-wider text-xs shadow-xl active:scale-95 transition-all"
              >
                <UserPlus size={15} />
                <span>Nuevo Hermano</span>
              </button>
            </div>
          </div>
        </div>

        {/* BENTO GRID MULTIDIMENSIONAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {/* 1. Tarjeta Grande Destacada: NOVEDADES (col-span-1 md:col-span-2) */}
          <BentoNovedades onOpenEvents={() => navigate('/events')} />

          {/* 2. Tarjeta Letra C: Recorte fotográfico de comunión */}
          <BentoLetterC />

          {/* 3. Tarjeta GENERAL: Padrón con 3 liñitas en amarillo */}
          <BentoCardGeneral />

          {/* 4. Tarjeta HERMANOS: Células y miembros */}
          <BentoCardHermanos />

          {/* 5. Tarjeta SEGUIMIENTO: Pipeline pastoral */}
          <BentoCardSeguimiento />

          {/* 6. Tarjeta ESCUELA EDDI: Discipulado */}
          <BentoCardEddi />

          {/* 7. Tarjeta ESCUELA EDEM: Entrenamiento ministerial */}
          <BentoCardEdem />

          {/* 8. Tarjeta MISERICORDIA: Ayuda social */}
          <BentoCardMisericordia />
        </div>

        {/* Botón Cuadrado por Debajo: Identidad y Misión CMV */}
        <BentoCardCulture />
      </main>

      {/* Modal para Nuevo Hermano Rápido */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Alta Rápida de Nuevo Hermano"
        >
          <form onSubmit={handleSaveBrother} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                Nombre y Apellidos *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez"
                value={newBrotherName}
                onChange={(e) => setNewBrotherName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Célula
                </label>
                <select
                  value={newBrotherCell}
                  onChange={(e) => setNewBrotherCell(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Vida">Vida</option>
                  <option value="Nissi">Nissi</option>
                  <option value="Zaeta">Zaeta</option>
                  <option value="Sion">Sion</option>
                  <option value="Maranata">Maranata</option>
                  <option value="Alpha y Omega">Alpha y Omega</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-1.5">
                  Etapa Inicial
                </label>
                <select
                  value={newBrotherStage}
                  onChange={(e) => setNewBrotherStage(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Altar">Altar</option>
                  <option value="Grupo">Grupo</option>
                  <option value="Experiencia">Experiencia</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar Hermano'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          isVisible={Boolean(toast)}
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
