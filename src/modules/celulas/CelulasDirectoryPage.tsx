import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Home,
  Search,
  Crown,
  ChevronRight,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { brothersService } from '../../services/brothersService';
import { supabaseCellsService, CellConfigRow } from '../../services/supabaseCellsService';
import { BrotherListItem } from '../hermanos/types';
import { getAvatarForBrother } from '../../services/avatarService';
import { STAGE_COLORS } from '../../theme/stages';
import { Cell } from '../../types';

interface CellGroupView {
  id: string;
  nombre: string;
  activa: boolean;
  leaders: { id: string; name: string; fotoUrl?: string }[];
  members: BrotherListItem[];
  totalMembers: number;
}

export const CelulasDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [cells, setCells] = useState<CellConfigRow[]>([]);
  const [brothers, setBrothers] = useState<BrotherListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const [loadedCells, loadedBrothers] = await Promise.all([
          supabaseCellsService.list(),
          brothersService.listForListingAsync(),
        ]);
        if (!isMounted) return;
        setCells(loadedCells);
        setBrothers(loadedBrothers);
      } catch (err) {
        console.error('Error cargando células:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Mapear células con sus líderes y hermanos correspondientes
  const cellsWithMembers = useMemo<CellGroupView[]>(() => {
    const existingNames = new Set(cells.map((c) => c.nombre.trim().toLowerCase()));
    const allCells: CellGroupView[] = cells.map((cell) => {
      const members = brothers.filter(
        (b) => (b.cellName || '').trim().toLowerCase() === cell.nombre.trim().toLowerCase()
      );
      const leaders = (cell.leaderIds || []).map((lid) => {
        const found = brothers.find((b) => b.id === lid);
        return {
          id: lid,
          name: found?.name || cell.leaders.find((l) => l.id === lid)?.name || 'Líder',
          fotoUrl: found?.fotoUrl,
        };
      });

      return {
        id: cell.id,
        nombre: cell.nombre,
        activa: cell.activa,
        leaders,
        members,
        totalMembers: members.length,
      };
    });

    // Detectar células adicionales que tengan hermanos asignados pero aún no estén en cell config
    brothers.forEach((b) => {
      const bCellName = (b.cellName || 'Sin Célula').trim();
      if (bCellName && !existingNames.has(bCellName.toLowerCase())) {
        existingNames.add(bCellName.toLowerCase());
        const members = brothers.filter(
          (m) => (m.cellName || '').trim().toLowerCase() === bCellName.toLowerCase()
        );
        allCells.push({
          id: `virtual-${bCellName}`,
          nombre: bCellName,
          activa: true,
          leaders: [],
          members,
          totalMembers: members.length,
        });
      }
    });

    return allCells;
  }, [cells, brothers]);

  // Filtrado por buscador
  const filteredCells = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return cellsWithMembers.sort((a, b) => b.totalMembers - a.totalMembers);

    return cellsWithMembers
      .filter((cell) => {
        const matchCellName = cell.nombre.toLowerCase().includes(cleanSearch);
        const matchLeader = cell.leaders.some((l) => l.name.toLowerCase().includes(cleanSearch));
        const matchMember = cell.members.some((m) => m.name.toLowerCase().includes(cleanSearch));
        return matchCellName || matchLeader || matchMember;
      })
      .sort((a, b) => b.totalMembers - a.totalMembers);
  }, [cellsWithMembers, searchTerm]);

  const totalAssignedBrothers = useMemo(() => {
    return brothers.filter((b) => Boolean(b.cellName && String(b.cellName).trim() !== '')).length;
  }, [brothers]);

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Botón Volver y Encabezado de la página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-white/20 transition-all shadow-xs"
            aria-label="Volver al Portal"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Home size={13} />
              <span>Red de Células CMV</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">
              Hermanos & Células
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/hermanos')}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Users size={16} />
            <span>Ver Lista General</span>
          </button>
        </div>
      </div>

      {/* Tarjetas resumen de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Home size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {cellsWithMembers.length}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mt-1">
              Células Activas
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {brothers.length}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mt-1">
              Hermanos Totales
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center gap-3.5 col-span-2 sm:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {totalAssignedBrothers}
            </p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mt-1">
              En Grupos de Vida
            </p>
          </div>
        </div>
      </div>

      {/* Buscador de Célula o Hermano */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar por nombre de célula, líder o hermano..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors shadow-xs"
        />
      </div>

      {/* Listado de Células con Líderes y Hermanos Organizados */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-500 dark:text-gray-400">
            Cargando células y hermanos asignados...
          </p>
        </div>
      ) : filteredCells.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-white/10 p-8 space-y-2">
          <Home size={40} className="mx-auto text-slate-400" />
          <p className="text-lg font-bold text-slate-800 dark:text-white">
            No se encontraron células ni hermanos
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Intenta con otro término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCells.map((cell) => (
            <div
              key={cell.id}
              className="rounded-3xl bg-white dark:bg-[#0c1527] border border-slate-200/90 dark:border-white/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Encabezado de la Célula */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-slate-100 dark:border-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                      Célula de Vida
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
                      {cell.nombre}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black shrink-0">
                    {cell.totalMembers} {cell.totalMembers === 1 ? 'hermano' : 'hermanos'}
                  </span>
                </div>

                {/* Líderes de la Célula */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                    <Crown size={14} />
                    <span>Líderes Responsables</span>
                  </div>
                  {cell.leaders.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {cell.leaders.map((leader) => (
                        <div
                          key={leader.id}
                          onClick={() => navigate(`/hermanos/${leader.id}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-slate-900 dark:text-amber-100 text-xs font-bold cursor-pointer hover:border-amber-400 transition-colors shadow-2xs"
                        >
                          <img
                            src={getAvatarForBrother(leader.name, leader.fotoUrl)}
                            alt={leader.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{leader.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-600 dark:text-gray-300">
                      Sin líder asignado formalmente
                    </p>
                  )}
                </div>
              </div>

              {/* Lista ordenada de los hermanos pertenecientes a esta célula */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                    <span>Hermanos de la Célula</span>
                    <span>Etapa Actual</span>
                  </div>

                  {cell.members.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-600 dark:text-gray-300 italic">
                      No hay hermanos asignados a esta célula actualmente.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {cell.members.map((member) => {
                        const stageClass = STAGE_COLORS[member.procesoActual] || 'bg-slate-100 text-slate-700 border-slate-200';

                        return (
                          <div
                            key={member.id}
                            onClick={() => navigate(`/hermanos/${member.id}`)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={getAvatarForBrother(member.name, member.fotoUrl)}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-white/10 shadow-2xs"
                              />
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {member.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${stageClass}`}
                              >
                                {member.procesoActual}
                              </span>
                              <ChevronRight
                                size={14}
                                className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pie de célula */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  <span>Ordenados por célula</span>
                  <button
                    type="button"
                    onClick={() => navigate('/hermanos')}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Ver en padrón general →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
