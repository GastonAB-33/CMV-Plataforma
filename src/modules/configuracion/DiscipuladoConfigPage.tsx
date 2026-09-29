import { FormEvent, useMemo, useState } from 'react';
import { Award, CheckCircle2, Flame, Info, Save, Settings, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { discipleshipConfigService } from '../../services/discipleshipConfigService';
import { brothersService } from '../../services/brothersService';
import { altarService } from '../../services/altarService';
import { grupoVidaApprovalService } from '../../services/grupoVidaApprovalService';

const normalize = (val: string) =>
  val
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const DiscipuladoConfigPage = () => {
  const { user } = useAuth();
  const canManage = user.role === Role.SUPERADMIN || user.role === Role.APOSTOL || user.role === Role.PASTOR;

  const [minAltares, setMinAltares] = useState<number>(() =>
    discipleshipConfigService.getMinAltaresForGrupoVida()
  );
  const [minDiscipulos, setMinDiscipulos] = useState<number>(() =>
    discipleshipConfigService.getMinDiscipulosForLiderCelula()
  );
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const brothers = useMemo(() => brothersService.list(), []);

  // Calcular estadísticas congregacionales
  const stats = useMemo(() => {
    const allApprovals = grupoVidaApprovalService.listApproved();
    const approvedMap = new Set(allApprovals.map((a) => a.brotherId));

    let qualifiedCount = 0;
    let disciplesCount = 0;

    for (const b of brothers) {
      // Disciples or brothers performing altars
      const bName = normalize(b.name);
      const myAltars = brothers.filter((other) => {
        const info = altarService.getAltarInfo(other.id);
        if (info.hermanoMayorId === b.id || (info.hermanoMayorName && normalize(info.hermanoMayorName) === bName)) {
          return true;
        }
        return (other.altar?.realizadoPor ?? []).some((r) => normalize(r) === bName);
      });

      const finalizedCount = myAltars.filter((other) => {
        const info = altarService.getAltarInfo(other.id);
        return info.fechaFin && info.fechaFin.trim() !== '' && !info.isInterrumpido;
      }).length;

      if (myAltars.length > 0 || b.role === Role.DISCIPULO || b.role === Role.HERMANO_MAYOR) {
        disciplesCount += 1;
      }

      if (finalizedCount >= minAltares && !approvedMap.has(b.id)) {
        qualifiedCount += 1;
      }
    }

    return {
      disciplesCount,
      qualifiedCount,
      approvedCount: allApprovals.length,
    };
  }, [brothers, minAltares]);

  if (!canManage) {
    return <Navigate to="/" replace />;
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (minAltares < 1) {
      setToast({ text: 'El mínimo de altares debe ser al menos 1.', type: 'error' });
      return;
    }
    if (minDiscipulos < 1) {
      setToast({ text: 'El mínimo de discípulos conectores debe ser al menos 1.', type: 'error' });
      return;
    }
    discipleshipConfigService.setMinAltaresForGrupoVida(minAltares);
    discipleshipConfigService.setMinDiscipulosForLiderCelula(minDiscipulos);
    setToast({ text: 'Configuración guardada exitosamente.', type: 'success' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Configuración</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Discipulado y Grupo de Vida</h1>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Configura los requisitos para que los Discípulos Conectores abran su Grupo de Vida y crezcan a Hermano Mayor.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/configuracion/usuarios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Usuarios
            </Link>
            <Link
              to="/configuracion/celulas"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Células
            </Link>
            <Link
              to="/configuracion/matrimonios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Matrimonios
            </Link>
            <span className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-[#c5a059]">
              Discipulado
            </span>
          </div>
        </div>
      </header>

      {/* Tarjetas de Resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#c5a059]/10 text-[#c5a059] rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Altares para Grupo Vida
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {minAltares} <span className="text-xs font-bold text-slate-400">altares</span>
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Conectores para Célula
              </p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {minDiscipulos} <span className="text-xs font-bold text-slate-400">conectores</span>
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Flame size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Listos para apertura
              </p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {stats.qualifiedCount} <span className="text-xs font-bold text-slate-400">discípulos</span>
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Grupos de Vida activos
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {stats.approvedCount} <span className="text-xs font-bold text-slate-400">abiertos</span>
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Formulario de Configuración */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <article className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
            <Settings size={18} className="text-[#c5a059]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Criterios de Crecimiento & Promoción
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Criterio 1: Altares para Grupo de Vida */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-black text-slate-700 dark:text-gray-300 block">
                1. Mínimo de altares familiares finalizados con éxito (Apertura Grupo de Vida)
              </label>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Cantidad de altares que el Discípulo Conector debe culminar exitosamente para alertar a su Líder de Célula y Apóstol para habilitar su Grupo de Vida (Etapa 5).
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMinAltares((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-black text-xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={minAltares}
                  onChange={(e) => setMinAltares(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 text-center rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/60 p-3 text-lg font-black text-slate-900 dark:text-white focus:border-[#c5a059] outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setMinAltares((prev) => prev + 1)}
                  className="w-12 h-12 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-black text-xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold ml-2">
                  altares finalizados
                </span>
              </div>
            </div>

            {/* Criterio 2: Discípulos Conectores para Líder de Célula */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
              <label className="text-xs uppercase tracking-wider font-black text-slate-700 dark:text-gray-300 block">
                2. Mínimo de Discípulos Conectores para promoción a Líder de Célula (Etapa 6)
              </label>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Cantidad de discípulos a cargo del Hermano Mayor que deben haberse convertido en Discípulos Conectores para habilitar la pre-aprobación por líderes superiores o apóstoles.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMinDiscipulos((prev) => Math.max(1, prev - 1))}
                  className="w-12 h-12 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-black text-xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={minDiscipulos}
                  onChange={(e) => setMinDiscipulos(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 text-center rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-black/60 p-3 text-lg font-black text-slate-900 dark:text-white focus:border-[#c5a059] outline-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setMinDiscipulos((prev) => prev + 1)}
                  className="w-12 h-12 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-black text-xl hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center shadow-sm"
                >
                  +
                </button>
                <span className="text-xs text-slate-500 dark:text-gray-400 font-semibold ml-2">
                  discípulos conectores
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-start gap-3">
              <Info size={18} className="text-[#c5a059] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-gray-300 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">Pre-aprobación y Supervisión</p>
                <p>
                  Tanto la apertura de Grupo de Vida como la promoción a Líder de Célula requieren la pre-aprobación formal del liderazgo superior o apóstoles antes de que el hermano asuma el nuevo rol.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-black bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-lg active:scale-95 transition-all flex items-center gap-2"
              >
                <Save size={16} />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </form>
        </article>

        <article className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
            <Users size={18} className="text-[#c5a059]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Flujo de Crecimiento
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-gray-400">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/30">
              <p className="font-bold text-slate-800 dark:text-gray-200 mb-1">Etapa 4: Discípulo Conector</p>
              <p>Evangeliza y acompaña a hermanos nuevos a través de Altar Familiar.</p>
            </div>
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20">
              <p className="font-bold text-amber-700 dark:text-amber-300 mb-1">Etapa 5: Hermano Mayor</p>
              <p>Con al menos {minAltares} altares finalizados y aprobación, lidera su Grupo de Vida.</p>
            </div>
            <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20">
              <p className="font-bold text-indigo-700 dark:text-indigo-300 mb-1">Etapa 6: Líder de Célula</p>
              <p>Con {minDiscipulos} discípulos formados como Discípulos Conectores y pre-aprobación apostólica, asume el liderazgo de célula.</p>
            </div>
            <div className="p-3 rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20">
              <p className="font-bold text-purple-700 dark:text-purple-300 mb-1">Etapa 7: Líder Ministerial</p>
              <p>Consagración en uno de los 5 ministerios (Pastor, Evangelista, Profeta, Maestro, Apóstol) con supervisión directa.</p>
            </div>
          </div>
        </article>
      </section>

      {toast && (
        <Toast
          isVisible={Boolean(toast)}
          onClose={() => setToast(null)}
          message={toast.text}
          type={toast.type}
        />
      )}
    </div>
  );
};
