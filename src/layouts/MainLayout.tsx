import { ReactNode, useMemo, useState } from 'react';
import { Home, Users, LineChart, Calendar, GraduationCap, Music, MonitorPlay, HandHelping, Menu, X, MoreHorizontal } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface MainLayoutProps {
  children: ReactNode;
  role: Role;
}

export const MainLayout = ({ children, role }: MainLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const roleLabel = role.replace(/_/g, ' ').toLowerCase();
  const navItems = [
    { id: 'dashboard', path: '/', icon: <Home size={22} />, label: 'Inicio', shortLabel: 'Inicio', primaryMobile: true },
    { id: 'brothers', path: '/hermanos', icon: <Users size={22} />, label: 'Hermanos', shortLabel: 'Hermanos', primaryMobile: true },
    { id: 'tracking', path: '/tracking', icon: <LineChart size={22} />, label: 'Seguimiento', shortLabel: 'Seguimiento', primaryMobile: true },
    { id: 'events', path: '/events', icon: <Calendar size={22} />, label: 'Eventos/Noticias', shortLabel: 'Eventos', primaryMobile: true },
    { id: 'eddi-school', path: '/escuela-eddi', icon: <GraduationCap size={22} />, label: 'Escuela EDDI', shortLabel: 'EDDI' },
    { id: 'worship', path: '/ministerio-adoracion', icon: <Music size={22} />, label: 'Adoracion', shortLabel: 'Adoracion' },
    { id: 'multimedia', path: '/ministerio-multimedia', icon: <MonitorPlay size={22} />, label: 'Multimedia', shortLabel: 'Multimedia' },
    { id: 'misericordia', path: '/ministerio-misericordia', icon: <HandHelping size={22} />, label: 'Misericordia', shortLabel: 'Misericordia' },
  ];

  const activeClass = 'bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30';
  const inactiveClass = 'text-slate-600 dark:text-gray-400 hover:bg-[#c5a059]/5 hover:text-[#c5a059]';
  const primaryMobileItems = navItems.filter((item) => item.primaryMobile);
  const secondaryMobileItems = navItems.filter((item) => !item.primaryMobile);
  const isSecondaryRouteActive = useMemo(
    () => secondaryMobileItems.some((item) => location.pathname.startsWith(item.path)),
    [location.pathname, secondaryMobileItems],
  );

  return (
    <div className="flex min-h-screen md:h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden transition-colors">
      <div className="fixed top-4 right-4 z-[60]">
        <ThemeToggle />
      </div>

      <aside className="hidden md:flex w-72 bg-slate-100 dark:bg-[#1a1a1a] flex-col border-r border-slate-200 dark:border-white/5 shadow-2xl relative z-20 transition-colors">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#8a6d3b] flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.3)]">
              <span className="text-black font-black text-xl italic">C</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl font-black tracking-tighter uppercase leading-none group-hover:text-[#c5a059] transition-colors">
              CMV<br/><span className="text-[#c5a059] text-[10px] tracking-[0.4em]">Seguimiento</span>
            </h2>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 w-full p-3 rounded-lg transition-all duration-300 ${isActive ? activeClass : inactiveClass}`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-[#c5a059]/10 mt-auto transition-colors">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center text-black font-bold text-xs">
              {String(role).charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none capitalize">{roleLabel}</span>
              <span className="text-[10px] text-slate-500 dark:text-gray-500">Sesion activa</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative min-h-screen md:h-full">
        <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">CMV</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Seguimiento congregacional</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-200"
              aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 pb-32 md:pb-8 bg-white dark:bg-[#0a0a0a] transition-colors">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] bg-white/95 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl flex justify-between items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors">
          {primaryMobileItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 px-1.5 py-1 ${isActive ? 'text-[#c5a059]' : 'text-slate-500 dark:text-gray-500'}`
              }
            >
              <div className="p-1 rounded-full transition-colors group">
                {item.icon}
              </div>
              <span className="text-[9px] uppercase tracking-wider font-bold text-center">{item.shortLabel}</span>
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`flex flex-col items-center gap-1 px-1.5 py-1 transition-all duration-300 ${isMobileMenuOpen || isSecondaryRouteActive ? 'text-[#c5a059]' : 'text-slate-500 dark:text-gray-500'}`}
            aria-label="Abrir menu completo"
          >
            <div className="p-1 rounded-full">
              <MoreHorizontal size={22} />
            </div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-center">Mas</span>
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <aside
            className="absolute right-3 top-20 w-[88%] max-w-sm rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101010] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Sesion</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize mt-1">{roleLabel}</p>
            </div>
            <nav className="space-y-2">
              {secondaryMobileItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isActive ? activeClass : inactiveClass}`
                  }
                >
                  {item.icon}
                  <span className="font-semibold text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};
