import { ReactNode } from 'react';
import { Home, Users, LineChart, Calendar } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Role } from '../types';
import { ThemeToggle } from '../components/ui/ThemeToggle';

interface MainLayoutProps {
  children: ReactNode;
  role: Role;
}

export const MainLayout = ({ children, role }: MainLayoutProps) => {
  const roleLabel = role.replace(/_/g, ' ').toLowerCase();
  const navItems = [
    { id: 'dashboard', path: '/', icon: <Home size={24} />, label: 'Inicio' },
    { id: 'brothers', path: '/hermanos', icon: <Users size={24} />, label: 'Hermanos' },
    { id: 'tracking', path: '/tracking', icon: <LineChart size={24} />, label: 'Seguimiento' },
    { id: 'events', path: '/events', icon: <Calendar size={24} />, label: 'Eventos' },
  ];

  const activeClass = 'bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30';
  const inactiveClass = 'text-slate-600 dark:text-gray-400 hover:bg-[#c5a059]/5 hover:text-[#c5a059]';

  return (
    <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden transition-colors">
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

      <div className="flex-1 flex flex-col relative h-full">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 bg-white dark:bg-[#0a0a0a] transition-colors">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-white/95 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl flex justify-around items-center p-3 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-[#c5a059]' : 'text-slate-500 dark:text-gray-500'}`
              }
            >
              <div className="p-1 px-4 rounded-full transition-colors group">
                {item.icon}
              </div>
              <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
