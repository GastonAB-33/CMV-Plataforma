import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  LineChart,
  Home,
  GraduationCap,
  HeartHandshake,
  Award,
  ArrowRight,
  LayoutGrid,
} from 'lucide-react';

interface ModuleConfig {
  id: string;
  label: string;
  sublabel: string;
  path: string;
  icon: React.ReactNode;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
  hoverAccent: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'hermanos',
    label: 'Hermanos',
    sublabel: 'Padrón y fichas pastorales',
    path: '/hermanos',
    icon: <Users size={20} />,
    bgLight: 'bg-emerald-50/90',
    bgDark: 'dark:bg-emerald-950/30',
    textLight: 'text-emerald-700',
    textDark: 'dark:text-emerald-300',
    borderLight: 'border-emerald-200/80',
    borderDark: 'dark:border-emerald-800/40',
    hoverAccent: 'hover:border-emerald-500 hover:shadow-emerald-500/15',
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    sublabel: 'Pipeline y etapas espirituales',
    path: '/tracking',
    icon: <LineChart size={20} />,
    bgLight: 'bg-sky-50/90',
    bgDark: 'dark:bg-sky-950/30',
    textLight: 'text-sky-700',
    textDark: 'dark:text-sky-300',
    borderLight: 'border-sky-200/80',
    borderDark: 'dark:border-sky-800/40',
    hoverAccent: 'hover:border-sky-500 hover:shadow-sky-500/15',
  },
  {
    id: 'celulas',
    label: 'Células',
    sublabel: 'Red y líderes de grupos de vida',
    path: '/configuracion/celulas',
    icon: <Home size={20} />,
    bgLight: 'bg-amber-50/90',
    bgDark: 'dark:bg-amber-950/30',
    textLight: 'text-amber-700',
    textDark: 'dark:text-amber-300',
    borderLight: 'border-amber-200/80',
    borderDark: 'dark:border-amber-800/40',
    hoverAccent: 'hover:border-amber-500 hover:shadow-amber-500/15',
  },
  {
    id: 'eddi',
    label: 'Escuela EDDI',
    sublabel: 'Discipulado y formación básica',
    path: '/escuela-eddi',
    icon: <GraduationCap size={20} />,
    bgLight: 'bg-indigo-50/90',
    bgDark: 'dark:bg-indigo-950/30',
    textLight: 'text-indigo-700',
    textDark: 'dark:text-indigo-300',
    borderLight: 'border-indigo-200/80',
    borderDark: 'dark:border-indigo-800/40',
    hoverAccent: 'hover:border-indigo-500 hover:shadow-indigo-500/15',
  },
  {
    id: 'misericordia',
    label: 'Misericordia',
    sublabel: 'Atención social y ayuda comunitaria',
    path: '/ministerio-misericordia',
    icon: <HeartHandshake size={20} />,
    bgLight: 'bg-rose-50/90',
    bgDark: 'dark:bg-rose-950/30',
    textLight: 'text-rose-700',
    textDark: 'dark:text-rose-300',
    borderLight: 'border-rose-200/80',
    borderDark: 'dark:border-rose-800/40',
    hoverAccent: 'hover:border-rose-500 hover:shadow-rose-500/15',
  },
  {
    id: 'edem',
    label: 'Escuela EDEM',
    sublabel: 'Entrenamiento ministerial avanzado',
    path: '/escuela-edem',
    icon: <Award size={20} />,
    bgLight: 'bg-teal-50/90',
    bgDark: 'dark:bg-teal-950/30',
    textLight: 'text-teal-700',
    textDark: 'dark:text-teal-300',
    borderLight: 'border-teal-200/80',
    borderDark: 'dark:border-teal-800/40',
    hoverAccent: 'hover:border-teal-500 hover:shadow-teal-500/15',
  },
];

export const BentoGeneralModules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0c1527] border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 col-span-1 md:col-span-2 lg:col-span-2">
      {/* Encabezado con la palabra GENERAL destacada */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">
            <LayoutGrid size={13} className="text-emerald-500" />
            <span>Módulos de Plataforma</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            GENERAL
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-medium">
            Acceso directo a las áreas de gestión y seguimiento pastoral.
          </p>
        </div>
      </div>

      {/* Grilla de los 6 cuadros solicitados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-auto">
        {MODULES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left group/btn shadow-sm hover:shadow-md hover:-translate-y-0.5 ${item.bgLight} ${item.bgDark} ${item.borderLight} ${item.borderDark} ${item.hoverAccent}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-900/60 shadow-xs ${item.textLight} ${item.textDark}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-black uppercase tracking-wide truncate ${item.textLight} ${item.textDark}`}>
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium truncate">
                  {item.sublabel}
                </p>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/70 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-400 group-hover/btn:text-slate-900 dark:group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all">
              <ArrowRight size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* Pie descriptivo */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
        <span>Vinculación directa con base de datos y backend</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          6 módulos activos
        </span>
      </div>
    </div>
  );
};
