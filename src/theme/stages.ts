import { Proceso } from '../types';

export const STAGE_COLORS: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-400/30',
  [Proceso.GRUPO]: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  [Proceso.EXPERIENCIA]: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  [Proceso.EDDI]: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  [Proceso.DISCIPULO]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold shadow-sm',
  [Proceso.EDEM]: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
};

