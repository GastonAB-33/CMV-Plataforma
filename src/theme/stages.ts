import { Proceso } from '../types';

export const STAGE_COLORS: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'bg-[#2a2a2a] text-gray-400 border-gray-600/50',
  [Proceso.GRUPO]: 'bg-[#3a3a3a] text-gray-300 border-gray-500/50',
  [Proceso.EXPERIENCIA]: 'bg-amber-900/30 text-amber-500 border-amber-700/40',
  [Proceso.EDDI]: 'bg-yellow-900/30 text-yellow-400 border-yellow-600/50',
  [Proceso.DISCIPULO]: 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/50 drop-shadow-[0_0_8px_rgba(197,160,89,0.8)] font-bold'
};

