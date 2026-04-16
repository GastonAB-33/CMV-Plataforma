import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white/80 dark:bg-[#1a1a1a]/90 text-slate-800 dark:text-white px-3 py-2 text-xs font-bold uppercase tracking-widest shadow-sm hover:border-[#c5a059]/50 hover:text-[#c5a059] transition-colors"
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      <span>{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
};
