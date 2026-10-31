import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
} from 'lucide-react';
import { brothersService } from '../../services/brothersService';
import { supabaseCellsService, CellConfigRow } from '../../services/supabaseCellsService';
import { BrotherListItem, BrotherProfile } from '../hermanos/types';
import { isRedApostolicaName, getCellBranding } from './cellBranding';
import { CellDirectoryCard, CellGroupView } from './components/CellDirectoryCard';
import { RedApostolicaSection } from './components/RedApostolicaSection';
import {
  LeaderDetailModal,
  LeaderDetailData,
  resolveLeaderDetailData,
} from './components/LeaderDetailModal';
import { GrupoVidaMembersModal } from './components/GrupoVidaMembersModal';
import { CellDetailModal } from './components/CellDetailModal';
import { CellGrupoVida } from './services/cellGruposVidaService';
import { Role } from '../../types';

// Células canónicas estándar de CMV (incluyendo la Célula Red Apostólica)
const CANONICAL_CELL_NAMES = ['Red Apostólica', 'Vida', 'Saetas', 'Maranatha', 'Sion', 'Nissi', 'Alfa y Omega'];

export const CelulasDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [cells, setCells] = useState<CellConfigRow[]>([]);
  const [brothers, setBrothers] = useState<BrotherListItem[]>([]);
  const [fullBrothers, setFullBrothers] = useState<BrotherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para el modal emergente de líder
  const [selectedLeader, setSelectedLeader] = useState<LeaderDetailData | null>(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);

  // Estado para el modal emergente de miembros del Grupo de Vida
  const [selectedGrupoVida, setSelectedGrupoVida] = useState<CellGrupoVida | null>(null);
  const [isGrupoVidaModalOpen, setIsGrupoVidaModalOpen] = useState(false);

  // Estado para el modal emergente de información completa de la Célula (Grupos de Vida y Discípulos)
  const [selectedCellForModal, setSelectedCellForModal] = useState<CellGroupView | null>(null);
  const [isCellModalOpen, setIsCellModalOpen] = useState(false);

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
        setFullBrothers(brothersService.list());
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

  // Mapear todas las células unificadas por identidad de marca (evita duplicados de alias)
  const allCellGroups = useMemo<CellGroupView[]>(() => {
    const groupsByBrandKey = new Map<string, CellGroupView>();

    // 1. Células canónicas base para asegurar presencia completa
    for (const canonicalName of CANONICAL_CELL_NAMES) {
      const brand = getCellBranding(canonicalName);
      groupsByBrandKey.set(brand.key, {
        id: `canonical-${brand.key}`,
        nombre: brand.displayName,
        activa: true,
        leaders: [],
        members: [],
        totalMembers: 0,
      });
    }

    // 2. Incorporar / actualizar con células configuradas en Supabase
    for (const cell of cells) {
      const brand = getCellBranding(cell.nombre);
      const existing = groupsByBrandKey.get(brand.key);

      const leaders = (cell.leaderIds || []).map((lid) => {
        const found = brothers.find((b) => b.id === lid);
        return {
          id: lid,
          name: found?.name || cell.leaders.find((l) => l.id === lid)?.name || 'Líder',
          fotoUrl: found?.fotoUrl,
        };
      });

      if (existing) {
        existing.id = cell.id || existing.id;
        existing.activa = cell.activa;
        if (leaders.length > 0) {
          existing.leaders = leaders;
        }
      } else {
        groupsByBrandKey.set(brand.key, {
          id: cell.id,
          nombre: brand.displayName,
          activa: cell.activa,
          leaders,
          members: [],
          totalMembers: 0,
        });
      }
    }

    // 3. Asignar hermanos a sus respectivos grupos según brandKey
    for (const brother of brothers) {
      if (!brother.cellName || !brother.cellName.trim()) continue;
      const brand = getCellBranding(brother.cellName);
      let group = groupsByBrandKey.get(brand.key);
      if (!group) {
        group = {
          id: `virtual-${brand.key}`,
          nombre: brand.displayName,
          activa: true,
          leaders: [],
          members: [],
          totalMembers: 0,
        };
        groupsByBrandKey.set(brand.key, group);
      }
      group.members.push(brother);
      group.totalMembers = group.members.length;
    }

    // 4. Si alguna célula no tiene líderes configurados, resolver líderes desde fullBrothers
    for (const [brandKey, group] of groupsByBrandKey.entries()) {
      if (group.leaders.length === 0) {
        const potentialLeaders = fullBrothers.filter((fb) => {
          const bBrand = getCellBranding(fb.acompanamiento.celulaName);
          const isSameCell = bBrand.key === brandKey;
          const isLeaderRole =
            fb.role === Role.PASTOR ||
            fb.role === Role.LIDER_RED_CELULAS ||
            fb.role === Role.LIDER_CELULA ||
            fb.role === Role.APOSTOL;
          return isSameCell && isLeaderRole;
        });

        group.leaders = potentialLeaders.map((pl) => ({
          id: pl.id,
          name: pl.name,
          fotoUrl: pl.fotoUrl,
          role: pl.role,
        }));
      }
    }

    return Array.from(groupsByBrandKey.values());
  }, [cells, brothers, fullBrothers]);

  // Red Apostólica es una Célula que congrega a los 15 líderes bajo formación
  // de los líderes apostólicos: Apóstol José Hernández y Gabriela Castro.
  const redApostolicaGroup = useMemo<CellGroupView | undefined>(() => {
    const apostolicLeaders = [
      { id: 'apostol-jose-hernandez', name: 'Apóstol José Hernández', role: 'Apóstol Principal' },
      { id: 'apostol-gabriela-castro', name: 'Apóstol Gabriela Castro', role: 'Apóstol' },
    ];

    const found = allCellGroups.find((g) => isRedApostolicaName(g.nombre));
    if (found) {
      return {
        ...found,
        leaders: apostolicLeaders,
        totalMembers: 15,
      };
    }

    return {
      id: 'celula-red-apostolica',
      nombre: 'Red Apostólica',
      activa: true,
      leaders: apostolicLeaders,
      members: [],
      totalMembers: 15,
    };
  }, [allCellGroups]);

  // Células de la Red CMV donde estos líderes tienen a cargo discípulos (Vida, Saetas, etc.)
  const communityCells = useMemo<CellGroupView[]>(() => {
    return allCellGroups
      .filter((g) => !isRedApostolicaName(g.nombre))
      .sort((a, b) => b.totalMembers - a.totalMembers);
  }, [allCellGroups]);

  // Manejo de apertura de modal emergente de líder
  const handleSelectLeader = (
    leader: { id: string; name: string; fotoUrl?: string; role?: string },
    cellName?: string
  ) => {
    const detail = resolveLeaderDetailData(leader, allCellGroups, fullBrothers);
    if (cellName && (!detail.celulaName || detail.celulaName === 'Vida')) {
      detail.celulaName = cellName;
    }
    setSelectedLeader(detail);
    setIsLeaderModalOpen(true);
  };

  // Manejo de apertura de modal emergente de hermanos del Grupo de Vida
  const handleSelectGrupoVida = (grupo: CellGrupoVida) => {
    setSelectedGrupoVida(grupo);
    setIsGrupoVidaModalOpen(true);
  };

  // Manejo de apertura de modal emergente de la célula completa (con grupos de vida y discípulos)
  const handleOpenCellModal = (cell: CellGroupView) => {
    setSelectedCellForModal(cell);
    setIsCellModalOpen(true);
  };

  // Control de tarjetas desplegadas automáticamente al desplazarse desde la Red Apostólica
  const [expandedCellKeys, setExpandedCellKeys] = useState<Record<string, boolean>>({});

  // Desplazamiento suave hacia la célula indicada al hacer clic en su botón
  const handleScrollToCell = (brandKey: string) => {
    setExpandedCellKeys((prev) => ({ ...prev, [brandKey]: true }));
    const element = document.getElementById(`cell-card-${brandKey}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Destello de realce visual momentáneo
      element.classList.add('ring-4', 'ring-[#00dfa2]', 'shadow-2xl', 'shadow-cyan-500/40');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-[#00dfa2]', 'shadow-2xl', 'shadow-cyan-500/40');
      }, 2200);
    }
  };

  return (
    <div className="w-full space-y-7 md:space-y-9 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Botón Volver y Encabezado de la página: TÍTULO CÉLULAS Y GRUPOS VIDA */}
      <div className="flex items-center gap-4 pb-5 border-b border-cyan-500/20 dark:border-white/10">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-[#091522] border border-cyan-500/30 dark:border-cyan-400/30 flex items-center justify-center text-slate-700 dark:text-cyan-200 hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-950/40 transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
          aria-label="Volver al Portal"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 text-xs font-black uppercase tracking-wider">
            <Home size={13} className="text-emerald-500" />
            <span>Red de Células CMV</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1.5">
            Células y Grupos de Vida
          </h1>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 👑 SECCIÓN EXCLUSIVA: CÉLULA RED APOSTÓLICA (15 LÍDERES EN FORMACIÓN)     */}
      {/* ========================================================================= */}
      <RedApostolicaSection
        daughterCells={communityCells}
        onSelectLeader={handleSelectLeader}
        onSelectCell={handleOpenCellModal}
      />

      {/* ========================================================================= */}
      {/* 🌿 LISTADO DE CÉLULAS DE VIDA (PANELES DESPLEGABLES CON GRUPOS DE VIDA)   */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#00dfa2] shadow-sm shadow-emerald-400" />
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Células bajo cobertura
            </h3>
            <span className="text-sm font-black text-cyan-600 dark:text-cyan-300">
              ({communityCells.length})
            </span>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-cyan-200/70 font-semibold hidden sm:inline">
            Despliega cada célula para ver sus Grupos de Vida activos
          </span>
        </div>

        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-base font-bold text-slate-500 dark:text-cyan-300">
              Cargando células y grupos de vida...
            </p>
          </div>
        ) : communityCells.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#091522] border border-cyan-500/20 dark:border-white/10 p-8 space-y-3 shadow-lg">
            <Home size={48} className="mx-auto text-cyan-500/60" />
            <p className="text-xl font-black text-slate-800 dark:text-white">
              No se encontraron células registradas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
            {communityCells.map((cell) => {
              const brand = getCellBranding(cell.nombre);
              return (
                <CellDirectoryCard
                  key={cell.id}
                  cell={cell}
                  onNavigateBrother={(id) => navigate(`/hermanos/${id}`)}
                  onNavigateGeneral={() => navigate('/hermanos')}
                  onSelectLeader={handleSelectLeader}
                  onSelectGrupoVida={handleSelectGrupoVida}
                  isInitiallyExpanded={Boolean(expandedCellKeys[brand.key])}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal emergente 1: Información completa del líder */}
      <LeaderDetailModal
        isOpen={isLeaderModalOpen}
        onClose={() => setIsLeaderModalOpen(false)}
        leader={selectedLeader}
        onNavigateBrother={(id) => navigate(`/hermanos/${id}`)}
      />

      {/* Modal emergente 2: Lista de hermanos pertenecientes al Grupo de Vida seleccionado */}
      <GrupoVidaMembersModal
        isOpen={isGrupoVidaModalOpen}
        onClose={() => setIsGrupoVidaModalOpen(false)}
        grupo={selectedGrupoVida}
        onNavigateBrother={(id) => navigate(`/hermanos/${id}`)}
      />

      {/* Modal emergente 3: Información completa de la Célula, Grupos de Vida y Discípulos */}
      <CellDetailModal
        isOpen={isCellModalOpen}
        onClose={() => setIsCellModalOpen(false)}
        cell={selectedCellForModal}
        onNavigateBrother={(id) => navigate(`/hermanos/${id}`)}
        onSelectLeader={handleSelectLeader}
        onSelectGrupoVida={handleSelectGrupoVida}
        onScrollToCellCard={handleScrollToCell}
      />
    </div>
  );
};
