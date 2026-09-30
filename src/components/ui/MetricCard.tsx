import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon?: ReactNode;
}

export const MetricCard = ({ title, value, label, icon }: MetricCardProps) => (
  <div className="bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-6 rounded-2xl border border-white/70 dark:border-white/15 hover:border-emerald-500/50 transition-all group shadow-lg backdrop-blur-xl">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wider">{title}</h3>
      {icon && <div className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">{icon}</div>}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black text-slate-900 dark:text-white">{value}</span>
      <span className="text-slate-500 dark:text-gray-400 text-xs font-semibold">{label}</span>
    </div>
    <div className="mt-4 h-1.5 w-full bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 w-2/3 group-hover:w-3/4 transition-all duration-500" />
    </div>
  </div>
);
