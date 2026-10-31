import { ReactNode, useMemo, useState, useRef, useEffect } from 'react';
import { Users, LineChart, Menu, X, MoreVertical, Settings, FileSpreadsheet, GraduationCap, Award, Home, Layers, Calendar, LogOut, Footprints } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Role, User } from '../types';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { NotificationBell } from '../components/notifications/NotificationBell';
import { AppFeatureKey, hasPermissionAtLeastForUser } from '../lib/permissionsMatrix';
import { useAuth } from '../hooks/useAuth';

interface MainLayoutProps {
  children: ReactNode;
  user: User;
}

export const MainLayout = ({ children, user }: MainLayoutProps) => {
  const mainContentRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  // Garantizar que toda navegación a cualquier módulo siempre comience en la parte superior (0,0)
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainContentRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [location.pathname, location.search]);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const role = user.role;
  const roleLabel = role.replace(/_/g, ' ').toLowerCase();
  const canManageUsers = role === Role.APOSTOL || role === Role.SUPERADMIN || role === Role.PASTOR;
  const canUseImporter = role === Role.SUPERADMIN;
  // Oculto temporalmente de los módulos laterales (se deja listo para reactivarse más adelante cambiando a true)
  const isImporterVisible = false;

  const navItems = [
    { id: 'home', feature: 'dashboard' as AppFeatureKey, path: '/', icon: <Home size={22} />, label: 'Inicio', shortLabel: 'Inicio', primaryMobile: true },
    { id: 'brothers', feature: 'hermanos' as AppFeatureKey, path: '/hermanos', icon: <Users size={22} />, label: 'Línea de Vida', shortLabel: 'Línea de Vida', primaryMobile: true },
    { id: 'primeros-pasos', feature: 'hermanos' as AppFeatureKey, path: '/primeros-pasos', icon: <Footprints size={22} />, label: 'Primeros Pasos', shortLabel: '1º Pasos', primaryMobile: true },
    { id: 'celulas', feature: 'hermanos' as AppFeatureKey, path: '/celulas', icon: <Layers size={22} />, label: 'Células', shortLabel: 'Células', primaryMobile: true },
    { id: 'tracking', feature: 'seguimiento' as AppFeatureKey, path: '/tracking', icon: <LineChart size={22} />, label: 'Estadísticas', shortLabel: 'Estadísticas', primaryMobile: true },
    { id: 'events', feature: 'eventos' as AppFeatureKey, path: '/events', icon: <Calendar size={22} />, label: 'Eventos', shortLabel: 'Eventos', primaryMobile: true },
    { id: 'escuelas', feature: 'escuela_eddi' as AppFeatureKey, path: '/escuelas', icon: <GraduationCap size={22} />, label: 'Escuelas', shortLabel: 'Escuelas', primaryMobile: true },
    ...(canUseImporter && isImporterVisible
      ? [{ id: 'importador', feature: 'hermanos' as AppFeatureKey, path: '/importador', icon: <FileSpreadsheet size={22} />, label: 'Importador', shortLabel: 'Importar', primaryMobile: false }]
      : []),
  ].filter((item) => hasPermissionAtLeastForUser(user, item.feature, 'view'));

  const activeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-[#00e599] border border-emerald-500/80 dark:border-[#00c988] shadow-sm font-bold rounded-2xl';
  const inactiveClass = 'text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-[#00e599] font-semibold rounded-2xl transition-colors';
  
  // En versión mobile: ocultamos el botón de importar y movemos Estadísticas al final
  const primaryMobileItems = useMemo(() => {
    const mobileAllowed = navItems.filter((item) => item.primaryMobile && item.id !== 'importador');
    const trackingItem = mobileAllowed.find((item) => item.id === 'tracking');
    const otherItems = mobileAllowed.filter((item) => item.id !== 'tracking');
    return trackingItem ? [...otherItems, trackingItem] : otherItems;
  }, [navItems]);

  const secondaryMobileItems = useMemo(
    () => navItems.filter((item) => !item.primaryMobile && item.id !== 'importador'),
    [navItems],
  );
  const isSecondaryRouteActive = useMemo(
    () => secondaryMobileItems.some((item) => location.pathname.startsWith(item.path)),
    [location.pathname, secondaryMobileItems],
  );

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen md:h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden transition-colors">
      <div className="hidden md:flex items-center gap-3 fixed top-4 right-4 z-[60]">
        <NotificationBell />
        {location.pathname !== '/' && <ThemeToggle />}
      </div>

      <aside className="hidden md:flex w-80 bg-white dark:bg-black backdrop-blur-2xl flex-col border-r border-slate-200/90 dark:border-white/10 shadow-2xl relative z-20 transition-colors">
        {/* Recuadro CMV Verde con logo gigante exactamente como en la imagen de referencia */}
        <div className="p-4 pb-2">
          <div
            className="w-full aspect-square rounded-2xl bg-[#059669] text-white p-4 flex flex-col items-center justify-between text-center shadow-lg shadow-emerald-950/20 cursor-pointer group hover:brightness-105 transition-all relative overflow-hidden"
            onClick={() => navigate('/')}
          >
            {/* Fila superior: OFICIAL a la izquierda y PASTORAL a la derecha */}
            <div className="w-full flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-black/40 text-white border border-white/10">
                OFICIAL
              </span>
              <span className="text-[9.5px] uppercase tracking-widest font-black text-white/90">
                PASTORAL
              </span>
            </div>

            {/* Isotipo circular CMV BIEN GRANDE en el centro */}
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center my-auto py-1 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logo-cmv.png"
                alt="CMV Logo"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Texto CMV centrado en blanco bien visible abajo */}
            <h2 className="text-xl sm:text-2xl font-black tracking-[0.2em] uppercase text-white leading-none mb-0.5">
              CMV
            </h2>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                if (mainContentRef.current) {
                  mainContentRef.current.scrollTop = 0;
                }
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={({ isActive }) =>
                `flex items-center gap-3.5 w-full p-2.5 rounded-2xl transition-all duration-200 ${isActive ? activeClass : inactiveClass}`
              }
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTÓN DE PERFIL INFERIOR IZQUIERDO */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 mt-auto transition-colors relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen((previous) => !previous)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {String(role).charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none capitalize">{roleLabel}</span>
              <span className="text-[10px] text-slate-500 dark:text-gray-500">Sesion activa</span>
            </div>
          </button>

          {/* POPUP DE PERFIL CON CONFIGURACIÓN Y CERRAR SESIÓN */}
          {isProfileMenuOpen && (
            <div className="absolute left-4 right-4 bottom-[78px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-1.5 shadow-2xl space-y-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {canManageUsers && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/configuracion/usuarios');
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs uppercase tracking-wider font-bold text-left text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[#c5a059] transition-colors cursor-pointer"
                >
                  <Settings size={16} className="text-[#c5a059]" />
                  <span>Configuración</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs uppercase tracking-wider font-black text-left text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative min-h-screen md:h-full min-w-0 max-w-full overflow-x-hidden">
        {location.pathname !== '/' && (
          <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#2C5A71] p-1 flex items-center justify-center shrink-0 shadow-sm">
                  <img src="/logo-cmv.png" alt="CMV" className="w-full h-full object-contain filter drop-shadow brightness-110" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600 dark:text-emerald-400">CMV</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">PLATAFORMA VISIÓN CMV</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-100 cursor-pointer"
                aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </header>
        )}

        <main ref={mainContentRef} id="main-content" className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-w-full pb-32 md:pb-8 bg-transparent transition-colors">
          {location.pathname === '/' || location.pathname === '/hermanos' || location.pathname === '/celulas' ? (
            children
          ) : (
            <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-8 min-w-0">
              {children}
            </div>
          )}
        </main>

        <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] bg-white/95 dark:bg-[#181818]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl flex justify-between items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-colors">
          {primaryMobileItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (mainContentRef.current) {
                  mainContentRef.current.scrollTop = 0;
                }
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all duration-300 px-1.5 py-1 ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-500 dark:text-gray-300'}`
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
            className={`flex flex-col items-center justify-center px-2 py-1 mr-0.5 transition-all duration-300 cursor-pointer ${isMobileMenuOpen || isSecondaryRouteActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-gray-300'}`}
            aria-label="Abrir menu completo"
          >
            <div className="p-1 rounded-full transition-colors hover:bg-white/10">
              <MoreVertical size={20} />
            </div>
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
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-600 dark:text-emerald-400">Sesion</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize mt-1">{roleLabel}</p>
            </div>
            <nav className="space-y-2">
              {secondaryMobileItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (mainContentRef.current) {
                      mainContentRef.current.scrollTop = 0;
                    }
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full p-3 rounded-xl transition-colors ${isActive ? activeClass : inactiveClass}`
                  }
                >
                  {item.icon}
                  <span className="font-semibold text-sm">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
              {canManageUsers && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/configuracion/usuarios');
                  }}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 py-2.5 text-xs uppercase tracking-wider font-bold text-slate-800 dark:text-gray-200 mb-2 cursor-pointer"
                >
                  <Settings size={16} className="text-[#c5a059]" />
                  <span>Configuración</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs uppercase tracking-wider font-black text-rose-600 dark:text-rose-300 mb-3 cursor-pointer"
              >
                Cerrar sesión
              </button>
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 mb-2">Notificaciones</p>
                <NotificationBell />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 mb-2">Apariencia</p>
              <ThemeToggle />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
