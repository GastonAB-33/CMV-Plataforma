import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  label: string;
  icon?: ReactNode;
}

export const MetricCard = ({ title, value, label, icon }: MetricCardProps) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-slate-200 dark:border-[#c5a059]/10 hover:border-[#c5a059]/30 transition-all group shadow-sm dark:shadow-none">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      {icon && <div className="text-[#c5a059] bg-[#c5a059]/10 p-2 rounded-lg">{icon}</div>}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-bold text-[#c5a059]">{value}</span>
      <span className="text-slate-500 dark:text-gray-500 text-xs">{label}</span>
    </div>
    <div className="mt-4 h-1 w-full bg-slate-200 dark:bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-[#c5a059] w-2/3 group-hover:w-3/4 transition-all duration-500" />
    </div>
  </div>
);
