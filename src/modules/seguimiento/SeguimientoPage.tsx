import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Flame,
  Phone,
  Search,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { eventsService } from '../../services/eventsService';
import { useData } from '../../hooks/useData';
import { Cell, EventType, Proceso, Role } from '../../types';
import { BrotherProfile } from '../hermanos/types';
import { altarService, BrotherAltarData } from '../../services/altarService';
import { grupoVidaApprovalService, BrotherGrupoVidaApproval } from '../../services/grupoVidaApprovalService';
import { stageProgressionService } from '../../services/stageProgressionService';

type CellFilter = 'Todas' | Cell;
type CellHealth = 'En crecimiento' | 'Estable' | 'En riesgo';

interface CellGrowthRow {
  cellName: Cell;
  members: number;
  newMembers: number;
  newAltars: number;
  disciplesInGrowth: number;
  altarsOpenedByDisciples: number;
  congregationActivities: number;
  eventsHosted: number;
  growthIndex: number;
  status: CellHealth;
}

interface GrupoVidaItem {
  approval: BrotherGrupoVidaApproval;
  leader?: BrotherProfile;
  leaderName: string;
  leaderCell?: Cell;
  groupName: string;
  approvedDate?: string;
  hermanosMenores: BrotherProfile[];
  totalHermanosMenores: number;
}

interface ApostolicAltarItem {
  id: string;
  brother: BrotherProfile;
  brotherName: string;
  cellName: string;
  status: 'EN_PROCESO' | 'FINALIZADO' | 'INTERRUMPIDO';
  startDate?: string;
  endDate?: string;
  mentorName: string;
  mentorId?: string;
  mentorPhotoUrl?: string;
  interruptionReason?: string;
  interruptionDate?: string;
  phone?: string;
}

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toTimestamp = (value?: string): number | null => {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

const toEventTimestamp = (date: string, time?: string) => {
  const parsed = new Date(`${date}T${time || '00:00'}:00`).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

const getBrotherDateCandidates = (brother: BrotherProfile): Array<string | undefined> => [
  brother.altar?.fechaInicio,
  brother.altar?.fechaFin,
  brother.grupo?.fechaInicio,
  brother.grupo?.fechaFin,
  brother.experiencia?.fechaRealizacion,
  brother.eddi?.fechaInicio,
  brother.eddi?.fechaFin,
  brother.discipulo?.fechaInicio,
  ...brother.observations.map((entry) => entry.date),
];

const getDatasetReferenceTimestamp = (
  brothers: BrotherProfile[],
  events: ReturnType<typeof eventsService.list>,
) => {
  const timestamps: number[] = [];

  for (const brother of brothers) {
    for (const candidate of getBrotherDateCandidates(brother)) {
      const parsed = toTimestamp(candidate);
      if (parsed !== null) timestamps.push(parsed);
    }
  }

  for (const event of events) {
    const parsed = toEventTimestamp(event.date, event.time);
    if (parsed !== null) timestamps.push(parsed);
  }

  if (timestamps.length === 0) return Date.now();
  return Math.max(...timestamps);
};

const hasDateInWindow = (value: string | undefined, months: number, referenceTimestamp: number) => {
  const parsed = toTimestamp(value);
  if (parsed === null) return false;

  const monthsBackTimestamp = new Date(referenceTimestamp);
  monthsBackTimestamp.setMonth(monthsBackTimestamp.getMonth() - months);

  return parsed >= monthsBackTimestamp.getTime() && parsed <= referenceTimestamp;
};

const getCellStatus = (growthIndex: number): CellHealth => {
  if (growthIndex >= 55) return 'En crecimiento';
  if (growthIndex >= 30) return 'Estable';
  return 'En riesgo';
};

const getStatusBadgeClass = (status: CellHealth) => {
  switch (status) {
    case 'En crecimiento':
      return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-600 dark:text-emerald-300';
    case 'Estable':
      return 'border-amber-300/40 bg-amber-400/15 text-amber-600 dark:text-amber-300';
    default:
      return 'border-rose-300/40 bg-rose-400/15 text-rose-600 dark:text-rose-300';
  }
};

const displayDate = (value?: string) => {
  if (!value) return 'Pendiente';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { brothers, isLoadingBrothers } = useData();

  // Garantizar que la página siempre inicie desde el top y no se desplace al medio
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const mainElement = document.querySelector('main') || document.getElementById('main-content');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      mainElement.scrollTop = 0;
    }

    const params = new URLSearchParams(location.search);
    const isAltar =
      location.hash === '#altares' ||
      location.hash === '#seguimiento-altares' ||
      params.get('seccion') === 'altares' ||
      params.get('tab') === 'altares';

    const isGrupoVida =
      location.hash === '#grupos-vida' ||
      location.hash === '#seguimiento-grupos-vida' ||
      params.get('seccion') === 'grupos-vida' ||
      params.get('tab') === 'grupos-vida';

    if (isAltar || isGrupoVida) {
      const targetId = isAltar ? 'seguimiento-altares' : 'seguimiento-grupos-vida';
      const ringColor = isAltar ? 'ring-amber-500' : 'ring-[#00dfa2]';

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.add('ring-2', ringColor, 'ring-offset-2');
        const timer = setTimeout(() => {
          targetElement.classList.remove('ring-2', ringColor, 'ring-offset-2');
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [location.hash, location.search]);
  const [selectedCell, setSelectedCell] = useState<CellFilter>('Todas');
  const [selectedGrupoVidaForModal, setSelectedGrupoVidaForModal] = useState<GrupoVidaItem | null>(null);

  // Estados interactivos para Seguimiento de Altares (con paginación y búsqueda para no saturar)
  const [altarFilter, setAltarFilter] = useState<'TODOS' | 'EN_PROCESO' | 'FINALIZADOS' | 'INTERRUMPIDOS'>('TODOS');
  const [altarSearch, setAltarSearch] = useState('');
  const [altarPage, setAltarPage] = useState(1);
  const [altarsPerPage, setAltarsPerPage] = useState(8);

  const events = useMemo(() => eventsService.list(), []);

  // Lista de todas las células individuales (la Red Apostólica es la totalidad de las células)
  const individualCells = useMemo<Cell[]>(() => {
    const unique = Array.from(new Set(brothers.map((brother) => brother.acompanamiento.celulaName))).filter(
      (c): c is Cell => Boolean(c) && c !== 'Red Apostólica',
    );
    return unique;
  }, [brothers]);

  const cells = useMemo<CellFilter[]>(() => {
    return ['Todas', ...individualCells];
  }, [individualCells]);

  // Hermanos filtrados por la célula seleccionada (o todos si es Red Apostólica / Todas)
  const scopedBrotherProfiles = useMemo(() => {
    return brothers.filter(
      (brother) => selectedCell === 'Todas' || brother.acompanamiento.celulaName === selectedCell,
    );
  }, [brothers, selectedCell]);

  const scopedEvents = useMemo(() => {
    if (selectedCell === 'Todas') return events;
    return events.filter(
      (event) =>
        event.organizerCell === selectedCell || (event.invitedCells ?? []).includes(selectedCell),
    );
  }, [events, selectedCell]);

  const referenceTimestamp = useMemo(
    () => getDatasetReferenceTimestamp(scopedBrotherProfiles, scopedEvents),
    [scopedBrotherProfiles, scopedEvents],
  );

  const visibleCells = useMemo(() => {
    if (selectedCell === 'Todas') {
      return individualCells;
    }
    return [selectedCell];
  }, [individualCells, selectedCell]);

  // ==========================================
  // 1. ALTARES EN TODA LA RED APOSTÓLICA
  // ==========================================
  const apostolicAltars = useMemo<ApostolicAltarItem[]>(() => {
    const list: ApostolicAltarItem[] = [];

    for (const b of scopedBrotherProfiles) {
      const info = altarService.getAltarInfo(b.id);
      const isAltarStage = b.procesoActual === Proceso.ALTAR;
      const hasStart = Boolean(info.fechaInicio || b.altar?.fechaInicio);
      const hasEnd = Boolean(info.fechaFin || b.altar?.fechaFin);
      const hasRealizadoPor = Boolean(b.altar?.realizadoPor && b.altar.realizadoPor.length > 0);
      const hasMentor = Boolean(info.hermanoMayorName || info.hermanoMayorId);
      const isInterrupted = Boolean(info.isInterrumpido || b.altar?.interrumpido);
      const hasAnyAltar = hasStart || hasEnd || hasRealizadoPor || hasMentor || isInterrupted || isAltarStage;

      if (!hasAnyAltar) continue;

      let status: 'EN_PROCESO' | 'FINALIZADO' | 'INTERRUMPIDO' = 'EN_PROCESO';
      if (isInterrupted) {
        status = 'INTERRUMPIDO';
      } else if (hasEnd) {
        status = 'FINALIZADO';
      } else {
        status = 'EN_PROCESO';
      }

      let mentorName =
        info.hermanoMayorName ||
        (b.altar?.realizadoPor ?? []).join(', ') ||
        b.acompanamiento?.acompananteName ||
        'Sin asignar';
      let mentorId = info.hermanoMayorId;
      let mentorPhotoUrl: string | undefined = undefined;

      if (!mentorId && mentorName && mentorName !== 'Sin asignar') {
        const found = brothers.find((other) => normalizeName(other.name) === normalizeName(mentorName));
        if (found) {
          mentorId = found.id;
          mentorPhotoUrl = found.fotoUrl;
        }
      } else if (mentorId) {
        const found = brothers.find((other) => other.id === mentorId);
        if (found) {
          mentorPhotoUrl = found.fotoUrl;
          if (!mentorName || mentorName === 'Sin asignar') {
            mentorName = found.name;
          }
        }
      }

      list.push({
        id: b.id,
        brother: b,
        brotherName: b.name,
        cellName: b.acompanamiento?.celulaName || 'Sin asignar',
        status,
        startDate: info.fechaInicio || b.altar?.fechaInicio,
        endDate: info.fechaFin || b.altar?.fechaFin,
        mentorName,
        mentorId,
        mentorPhotoUrl,
        interruptionReason: info.motivoInterrupcion || b.altar?.motivoInterrupcion,
        interruptionDate: info.fechaInterrupcion || b.altar?.fechaInterrupcion,
        phone: b.telefono,
      });
    }

    return list;
  }, [scopedBrotherProfiles, brothers]);

  const altarStats = useMemo(() => {
    const total = apostolicAltars.length;
    const enProceso = apostolicAltars.filter((a) => a.status === 'EN_PROCESO').length;
    const finalizados = apostolicAltars.filter((a) => a.status === 'FINALIZADO').length;
    const interrumpidos = apostolicAltars.filter((a) => a.status === 'INTERRUMPIDO').length;
    const efectividad = total > 0 ? Math.round((finalizados / total) * 100) : 0;
    const interruptedList = apostolicAltars
      .filter((a) => a.status === 'INTERRUMPIDO')
      .map((a) => ({
        brother: a.brother,
        hermanoMayorName: a.mentorName,
        motivo: a.interruptionReason || 'Sin motivo especificado',
        fecha: a.interruptionDate,
      }));

    return { total, enProceso, finalizados, interrumpidos, efectividad, interruptedList };
  }, [apostolicAltars]);

  // Filtro y Paginación de Altares para no saturar la pantalla
  const filteredApostolicAltars = useMemo(() => {
    return apostolicAltars.filter((altar) => {
      if (altarFilter !== 'TODOS' && altar.status !== altarFilter) {
        return false;
      }
      if (altarSearch.trim() !== '') {
        const query = normalizeName(altarSearch);
        const matchName = normalizeName(altar.brotherName).includes(query);
        const matchCell = normalizeName(altar.cellName).includes(query);
        const matchMentor = normalizeName(altar.mentorName).includes(query);
        if (!matchName && !matchCell && !matchMentor) {
          return false;
        }
      }
      return true;
    });
  }, [apostolicAltars, altarFilter, altarSearch]);

  const totalAltarPages = Math.max(1, Math.ceil(filteredApostolicAltars.length / altarsPerPage));
  const currentAltarPage = Math.min(altarPage, totalAltarPages);

  const paginatedApostolicAltars = useMemo(() => {
    const startIndex = (currentAltarPage - 1) * altarsPerPage;
    return filteredApostolicAltars.slice(startIndex, startIndex + altarsPerPage);
  }, [filteredApostolicAltars, currentAltarPage, altarsPerPage]);

  // ==========================================
  // 2. GRUPOS DE VIDA ABIERTOS Y HERMANOS MENORES
  // ==========================================
  const gruposVidaList = useMemo<GrupoVidaItem[]>(() => {
    const approved = grupoVidaApprovalService.listApproved();

    const items: GrupoVidaItem[] = [];

    for (const approval of approved) {
      const leader = brothers.find((b) => b.id === approval.brotherId);
      const leaderName = leader?.name || 'Hermano Mayor';
      const leaderCell = leader?.acompanamiento.celulaName;

      // Filtrar por célula si no es "Todas"
      if (selectedCell !== 'Todas' && leaderCell !== selectedCell) {
        continue;
      }

      const leaderNorm = normalizeName(leaderName);

      // Hermanos a cargo de este líder
      const hermanosMenores = scopedBrotherProfiles.filter((b) => {
        if (b.id === approval.brotherId) return false;
        const info = altarService.getAltarInfo(b.id);
        const accName = normalizeName(b.acompanamiento.acompananteName || '');
        const isMentoredByLeader =
          info.hermanoMayorId === approval.brotherId ||
          (info.hermanoMayorName && normalizeName(info.hermanoMayorName) === leaderNorm) ||
          (accName && (accName === leaderNorm || accName.includes(leaderNorm))) ||
          (b.altar?.realizadoPor ?? []).some((r) => normalizeName(r) === leaderNorm);

        if (!isMentoredByLeader) return false;

        return (
          b.procesoActual === Proceso.GRUPO ||
          b.procesoActual === Proceso.ALTAR ||
          b.procesoActual === Proceso.EXPERIENCIA ||
          Boolean(b.grupo?.fechaInicio)
        );
      });

      items.push({
        approval,
        leader,
        leaderName,
        leaderCell,
        groupName: approval.grupoVidaNombre || approval.nombreGrupoVida || `Grupo de Vida de ${leaderName}`,
        approvedDate: approval.approvedAt || approval.fechaAprobacion,
        hermanosMenores,
        totalHermanosMenores: hermanosMenores.length,
      });
    }

    return items;
  }, [brothers, scopedBrotherProfiles, selectedCell]);

  const totalGruposVida = gruposVidaList.length;
  const totalHermanosMenoresEnGrupos = gruposVidaList.reduce((acc, g) => acc + g.totalHermanosMenores, 0);
  const promedioHermanosPorGrupo =
    totalGruposVida > 0 ? (totalHermanosMenoresEnGrupos / totalGruposVida).toFixed(1) : '0';

  // ==========================================
  // 3. DISCÍPULOS CONECTORES Y EDDI
  // ==========================================
  const eddiAndConectores = useMemo(() => {
    const enEddi = scopedBrotherProfiles.filter((b) => b.procesoActual === Proceso.EDDI);

    const discipulosConectores = scopedBrotherProfiles.filter((b) => {
      const prog = stageProgressionService.resolveProgression(b);
      return (
        b.procesoActual === Proceso.DISCIPULO ||
        prog.isStageCompleted(4) ||
        prog.currentStageNumber >= 4
      );
    });

    return {
      enEddiCount: enEddi.length,
      conectoresCount: discipulosConectores.length,
    };
  }, [scopedBrotherProfiles]);

  // ==========================================
  // 4. CÉLULAS Y DISCÍPULOS ACTIVOS
  // ==========================================
  const totalCelulasCount = visibleCells.length;
  const totalMiembrosCount = scopedBrotherProfiles.length;
  const promedioMiembrosPorCelula =
    totalCelulasCount > 0 ? Math.round(totalMiembrosCount / totalCelulasCount) : 0;

  const discipulosActivosCount = useMemo(() => {
    return scopedBrotherProfiles.filter((b) => {
      const hasDisciples = (b.disciples?.length ?? 0) > 0;
      const isDiscipuloRole =
        b.role === Role.DISCIPULO || b.role === Role.HERMANO_MAYOR || b.role === Role.LIDER_CELULA;
      const isDiscipuloProcess =
        b.procesoActual === Proceso.DISCIPULO || b.procesoActual === Proceso.EDEM;
      const openedAltars = brothers.some((other) => {
        const info = altarService.getAltarInfo(other.id);
        return info.hermanoMayorId === b.id || (other.altar?.realizadoPor ?? []).includes(b.name);
      });

      return hasDisciples || isDiscipuloRole || isDiscipuloProcess || openedAltars;
    }).length;
  }, [scopedBrotherProfiles, brothers]);

  // ==========================================
  // 5. TABLA DE SEGUIMIENTO DE CÉLULAS (CONSERVADA)
  // ==========================================
  const cellGrowthRows = useMemo<CellGrowthRow[]>(() => {
    return visibleCells
      .map((cellName) => {
        const cellBrothers = brothers.filter(
          (brother) => brother.acompanamiento.celulaName === cellName,
        );

        const members = cellBrothers.length;
        const cellNewMembers = cellBrothers.filter((brother) => brother.procesoActual === Proceso.ALTAR).length;
        const cellNewAltars = cellBrothers.filter((brother) =>
          hasDateInWindow(brother.altar?.fechaInicio, 6, referenceTimestamp),
        ).length;
        const cellDisciplesInGrowth = cellBrothers.filter((brother) => (brother.disciples?.length ?? 0) >= 2).length;
        const cellAltarsOpenedByDisciples = cellBrothers.reduce(
          (total, brother) => total + (brother.disciples?.length ?? 0),
          0,
        );

        const eventsHosted = events.filter((event) => event.organizerCell === cellName).length;
        const congregationActivitiesCount = events.filter((event) => {
          if (event.organizerCell === cellName && event.type === EventType.RED) {
            return true;
          }
          return (event.invitedCells ?? []).includes(cellName);
        }).length;

        const growthIndex =
          members > 0
            ? clampPercentage(
                ((cellNewMembers * 2 +
                  cellNewAltars +
                  cellDisciplesInGrowth +
                  eventsHosted +
                  congregationActivitiesCount) /
                  members) *
                  22,
              )
            : 0;

        return {
          cellName,
          members,
          newMembers: cellNewMembers,
          newAltars: cellNewAltars,
          disciplesInGrowth: cellDisciplesInGrowth,
          altarsOpenedByDisciples: cellAltarsOpenedByDisciples,
          congregationActivities: congregationActivitiesCount,
          eventsHosted,
          growthIndex,
          status: getCellStatus(growthIndex),
        };
      })
      .sort((left, right) => right.growthIndex - left.growthIndex);
  }, [visibleCells, brothers, events, referenceTimestamp]);

  // ==========================================
  // 6. EMBUDO DE LA LÍNEA DE VIDA (DISTRIBUCIÓN POR ETAPAS)
  // ==========================================
  const stageFunnel = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    for (const b of scopedBrotherProfiles) {
      const prog = stageProgressionService.resolveProgression(b);
      counts[prog.currentStageNumber] = (counts[prog.currentStageNumber] || 0) + 1;
    }

    const total = scopedBrotherProfiles.length || 1;

    return [
      { number: 1, name: 'Altar', count: counts[1], pct: Math.round((counts[1] / total) * 100), color: 'bg-amber-500' },
      { number: 2, name: 'Hermano Menor', count: counts[2], pct: Math.round((counts[2] / total) * 100), color: 'bg-blue-500' },
      { number: 3, name: 'EDDI 1', count: counts[3], pct: Math.round((counts[3] / total) * 100), color: 'bg-indigo-500' },
      { number: 4, name: 'Discípulo Conector', count: counts[4], pct: Math.round((counts[4] / total) * 100), color: 'bg-teal-500' },
      { number: 5, name: 'EDDI 2', count: counts[5], pct: Math.round((counts[5] / total) * 100), color: 'bg-cyan-500' },
      { number: 6, name: 'Hermano Mayor', count: counts[6], pct: Math.round((counts[6] / total) * 100), color: 'bg-emerald-500' },
      { number: 7, name: 'EDDI 3', count: counts[7], pct: Math.round((counts[7] / total) * 100), color: 'bg-blue-600' },
      { number: 8, name: 'Líder de Célula', count: counts[8], pct: Math.round((counts[8] / total) * 100), color: 'bg-emerald-600' },
      { number: 9, name: 'EDEM', count: counts[9], pct: Math.round((counts[9] / total) * 100), color: 'bg-purple-500' },
      { number: 10, name: 'Líder Ministerial', count: counts[10], pct: Math.round((counts[10] / total) * 100), color: 'bg-[#c5a059]' },
    ];
  }, [scopedBrotherProfiles]);

  if (isLoadingBrothers) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>Estadísticas Estratégicas</span>
        </h1>
        <p className="text-slate-500 dark:text-gray-400">Cargando datos congregacionales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-700 pb-16">
      {/* Encabezado y Filtro Superior */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Estadísticas Estratégicas
            </h1>
            {/* Logotipo Notorio de Estadísticas y Medición */}
            <div className="relative shrink-0 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#00dfa2] via-cyan-400 to-[#0284c7] p-[1.5px] shadow-md shadow-cyan-500/25">
              <div className="w-full h-full rounded-[14px] bg-[#051824] flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 filter drop-shadow-[0_2px_6px_rgba(0,223,162,0.6)]">
                  <rect x="3" y="14" width="3" height="7" rx="1" fill="#00dfa2" fillOpacity="0.45" />
                  <rect x="8.5" y="10" width="3" height="11" rx="1" fill="#06b6d4" fillOpacity="0.65" />
                  <rect x="14" y="6" width="3" height="15" rx="1" fill="#38bdf8" fillOpacity="0.85" />
                  <path d="M3 15L8.5 9.5L13.5 13L20.5 4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 4H20.5V8.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="20.5" cy="4" r="1.5" fill="#00dfa2" />
                </svg>
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400">
            Tablero congregacional para liderazgo pastoral y apostólico: altares, grupos de vida y discipulado.
          </p>
        </div>

        {/* Filtro superior enfocado por células */}
        <div className="relative min-w-[260px] md:w-80">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5a059]" size={18} />
          <select
            className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/15 focus:border-[#c5a059] rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-gray-100 focus:outline-none appearance-none cursor-pointer shadow-sm transition-all"
            value={selectedCell}
            onChange={(event) => setSelectedCell(event.target.value as CellFilter)}
          >
            {cells.map((cell) => (
              <option key={cell} value={cell} className="bg-white dark:bg-[#1a1a1a] normal-case font-bold">
                {cell === 'Todas' ? '⛪ Red Apostólica (Todas las células)' : `Célula: ${cell}`}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* SECCIÓN 1: ESTADÍSTICAS PRINCIPALES                     */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#c5a059]" />
            <h2 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-black text-[#c5a059]">
              Estadísticas Principales
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 font-bold">
            {selectedCell === 'Todas' ? 'Red Apostólica (Todas las células)' : `Filtrado por: Célula ${selectedCell}`}
          </span>
        </div>

        {/* Fila de 5 Tarjetas KPI con números y tipografías ampliadas */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {/* KPI 1: Altares Congregacionales */}
          <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/20 to-emerald-50/20 dark:from-[#0d1829] dark:via-[#091220] dark:to-[#060c17] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 pb-1 sm:pb-1.5 min-h-[36px]">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-slate-600 dark:text-gray-300 leading-snug">
                  Altares Totales
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Flame size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 sm:my-2">
                {altarStats.total}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs sm:text-[13px] font-bold">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span>En Proceso:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 font-black">{altarStats.enProceso}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>Finalizados:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 font-black">
                  {altarStats.finalizados} ({altarStats.efectividad}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                <span>Interrumpidos:</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 font-black">{altarStats.interrumpidos}</span>
              </div>
            </div>
          </article>

          {/* KPI 2: Grupos de Vida */}
          <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/20 to-emerald-50/20 dark:from-[#0d1829] dark:via-[#091220] dark:to-[#060c17] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 pb-1 sm:pb-1.5 min-h-[36px]">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-slate-600 dark:text-gray-300 leading-snug">
                  Grupos de Vida
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Users size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 sm:my-2">
                {totalGruposVida}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs sm:text-[13px] font-bold text-slate-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Hnos Menores:</span>
                <span className="text-blue-600 dark:text-blue-400 font-black">{totalHermanosMenoresEnGrupos}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 dark:text-gray-500">
                <span>Promedio / Grupo:</span>
                <span className="font-bold text-slate-700 dark:text-gray-300">{promedioHermanosPorGrupo}</span>
              </div>
            </div>
          </article>

          {/* KPI 3: Escuela y Discipulado */}
          <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/20 to-emerald-50/20 dark:from-[#0d1829] dark:via-[#091220] dark:to-[#060c17] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 pb-1 sm:pb-1.5 min-h-[36px]">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-slate-600 dark:text-gray-300 leading-snug">
                  EDDI y Conectores
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
                  <BookOpen size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 sm:my-2">
                {eddiAndConectores.conectoresCount}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs sm:text-[13px] font-bold">
              <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
                <span>Conectores:</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/15 font-black">{eddiAndConectores.conectoresCount}</span>
              </div>
              <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                <span>En Proceso EDDI:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 font-black">{eddiAndConectores.enEddiCount}</span>
              </div>
            </div>
          </article>

          {/* KPI 4: Células Congregacionales */}
          <article className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/20 to-emerald-50/20 dark:from-[#0d1829] dark:via-[#091220] dark:to-[#060c17] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 pb-1 sm:pb-1.5 min-h-[36px]">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-slate-600 dark:text-gray-300 leading-snug">
                  Células Activas
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Building2 size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 sm:my-2">
                {totalCelulasCount}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs sm:text-[13px] font-bold text-slate-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Miembros totales:</span>
                <span className="text-purple-600 dark:text-purple-400 font-black">{totalMiembrosCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 dark:text-gray-500">
                <span>Promedio / célula:</span>
                <span className="font-bold text-slate-700 dark:text-gray-300">{promedioMiembrosPorCelula} hnos</span>
              </div>
            </div>
          </article>

          {/* KPI 5: Discípulos Activos */}
          <article className="col-span-2 sm:col-span-1 xl:col-span-1 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/20 to-emerald-50/20 dark:from-[#0d1829] dark:via-[#091220] dark:to-[#060c17] p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-start justify-between gap-2 pb-1 sm:pb-1.5 min-h-[36px]">
                <span className="text-xs sm:text-sm uppercase tracking-wider font-black text-slate-600 dark:text-gray-300 leading-snug">
                  Discípulos Activos
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <UserCheck size={18} />
                </div>
              </div>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-1 sm:my-2">
                {discipulosActivosCount}
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-xs sm:text-[13px] font-bold text-slate-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <span>Cobertura discipular:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  {totalMiembrosCount > 0
                    ? `${Math.round((discipulosActivosCount / totalMiembrosCount) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 dark:text-gray-500">
                <span>En discipulado:</span>
                <span className="font-bold text-slate-700 dark:text-gray-300">{discipulosActivosCount} hnos</span>
              </div>
            </div>
          </article>
        </div>

        {/* EMBUDO DE LA LÍNEA DE VIDA (DISTRIBUCIÓN POR ETAPAS) */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <BarChart3 size={20} className="text-[#c5a059]" />
                <span>Embudo de la Línea de Vida (Distribución por Etapas)</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
                Distribución congregacional en tiempo real para identificar concentración y flujo de discipulado.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-gray-400 self-start sm:self-center">
              Total evaluados: <strong className="text-slate-800 dark:text-white">{scopedBrotherProfiles.length}</strong> hermanos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5 pt-1">
            {stageFunnel.map((stage) => (
              <div
                key={stage.number}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 p-3.5 space-y-2.5 hover:border-[#c5a059]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs sm:text-sm font-black text-slate-800 dark:text-gray-200">
                    {stage.number}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                    {stage.count} hnos ({stage.pct}%)
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-gray-200 truncate">{stage.name}</p>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${stage.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PANEL: SEGUIMIENTO DE ALTARES EN LA RED APOSTÓLICA       */}
        {/* ======================================================== */}
        <div id="seguimiento-altares" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm scroll-mt-24 transition-all duration-500">
          {/* Encabezado del Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Flame size={22} className="text-amber-500 shrink-0" />
                <span>Seguimiento de Altares · {selectedCell === 'Todas' ? 'Red Apostólica' : `Célula ${selectedCell}`}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 font-medium">
                Monitoreo general de altares en la congregación, mentores asignados y fichas personales vinculadas.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 w-fit">
                {altarStats.total} {altarStats.total === 1 ? 'Altar Registrado' : 'Altares Registrados'}
              </span>
            </div>
          </div>

          {/* 4 Tarjetas de Métricas Interactivas (Filtros según Imagen 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* TOTAL ALTARES */}
            <button
              type="button"
              onClick={() => {
                setAltarFilter('TODOS');
                setAltarPage(1);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                altarFilter === 'TODOS'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                  : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-gray-300">
                TOTAL ALTARES
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black mt-1.5 text-emerald-600 dark:text-emerald-400">
                {altarStats.total}
              </p>
            </button>

            {/* EN PROCESO */}
            <button
              type="button"
              onClick={() => {
                setAltarFilter('EN_PROCESO');
                setAltarPage(1);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                altarFilter === 'EN_PROCESO'
                  ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                  : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-gray-300">
                EN PROCESO
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black mt-1.5 text-amber-500">
                {altarStats.enProceso}
              </p>
            </button>

            {/* FINALIZADOS */}
            <button
              type="button"
              onClick={() => {
                setAltarFilter('FINALIZADOS');
                setAltarPage(1);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                altarFilter === 'FINALIZADOS'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                  : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-gray-300">
                FINALIZADOS
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black mt-1.5 text-emerald-600 dark:text-emerald-400">
                {altarStats.finalizados}
              </p>
            </button>

            {/* INTERRUMPIDOS */}
            <button
              type="button"
              onClick={() => {
                setAltarFilter('INTERRUMPIDOS');
                setAltarPage(1);
              }}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                altarFilter === 'INTERRUMPIDOS'
                  ? 'bg-rose-500/10 border-rose-500 shadow-sm ring-1 ring-rose-500/40'
                  : 'bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-600 dark:text-gray-300">
                INTERRUMPIDOS
              </p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black mt-1.5 text-rose-600">
                {altarStats.interrumpidos}
              </p>
            </button>
          </div>

          {/* Barra de Búsqueda y Control de Paginación */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={altarSearch}
                onChange={(e) => {
                  setAltarSearch(e.target.value);
                  setAltarPage(1);
                }}
                placeholder="Buscar por hermano, mentor o célula..."
                className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {altarSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setAltarSearch('');
                    setAltarPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white px-1.5 py-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-600 dark:text-gray-300 self-end sm:self-center font-bold">
              <span>
                Mostrando <strong className="text-slate-900 dark:text-white">{paginatedApostolicAltars.length}</strong> de <strong className="text-slate-900 dark:text-white">{filteredApostolicAltars.length}</strong> altares
              </span>
              <select
                value={altarsPerPage}
                onChange={(e) => {
                  setAltarsPerPage(Number(e.target.value));
                  setAltarPage(1);
                }}
                className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value={6}>6 por pág.</option>
                <option value={8}>8 por pág.</option>
                <option value={12}>12 por pág.</option>
                <option value={24}>24 por pág.</option>
              </select>
            </div>
          </div>

          {/* Lista de Altares con altura máxima fija para no extender demasiado la pantalla */}
          {filteredApostolicAltars.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-slate-50/70 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10 space-y-2">
              <Flame size={36} className="mx-auto text-slate-400 dark:text-gray-600" />
              <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-gray-300">
                {altarSearch
                  ? 'No se encontraron altares con ese criterio de búsqueda.'
                  : altarFilter === 'TODOS'
                  ? 'No hay hermanos registrados en altares para este criterio.'
                  : `No hay altares ${
                      altarFilter === 'EN_PROCESO'
                        ? 'en proceso'
                        : altarFilter === 'FINALIZADOS'
                        ? 'finalizados'
                        : 'interrumpidos'
                    }.`}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Los altares se administran y vinculan directamente en las fichas personales de cada hermano.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {paginatedApostolicAltars.map((item) => (
                <article
                  key={`apostolic-altar-${item.brother.id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Foto / Avatar del Hermano vinculado a su ficha */}
                    <div
                      onClick={() => navigate(`/hermanos/${item.brother.id}`)}
                      className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg sm:text-xl font-black text-emerald-600 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      title={`Ver ficha personal de ${item.brotherName}`}
                    >
                      {item.brother.fotoUrl ? (
                        <img src={item.brother.fotoUrl} alt={item.brotherName} className="w-full h-full object-cover" />
                      ) : (
                        item.brotherName.charAt(0)
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        {/* Nombre del Hermano vinculado a su ficha */}
                        <button
                          type="button"
                          onClick={() => navigate(`/hermanos/${item.brother.id}`)}
                          className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase truncate hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors"
                          title={`Ver ficha personal de ${item.brotherName}`}
                        >
                          {item.brotherName}
                        </button>

                        {/* Badge Célula */}
                        <span className="text-xs sm:text-sm font-bold px-3 py-1 rounded-md bg-slate-200/70 dark:bg-white/10 text-slate-700 dark:text-gray-300">
                          {item.cellName}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-xs sm:text-sm uppercase font-black px-3 py-1 rounded-full border shrink-0 ${
                            item.status === 'FINALIZADO'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                              : item.status === 'INTERRUMPIDO'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.status === 'FINALIZADO' ? 'Finalizado' : item.status === 'INTERRUMPIDO' ? 'Interrumpido' : 'En Proceso'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-gray-300 mt-2">
                        {/* Mentor / Hermano Mayor vinculado a su ficha */}
                        <span className="truncate">
                          Mentor:{' '}
                          {item.mentorId ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/hermanos/${item.mentorId}`)}
                              className="font-black text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 underline decoration-dotted"
                              title={`Ver ficha del mentor ${item.mentorName}`}
                            >
                              {item.mentorName}
                            </button>
                          ) : (
                            <span className="font-black text-slate-900 dark:text-white">{item.mentorName}</span>
                          )}
                        </span>

                        {/* Fechas de inicio y fin */}
                        <span>
                          Inicio: <strong className="text-slate-800 dark:text-gray-200">{item.startDate ? displayDate(item.startDate) : 'Sin fecha'}</strong>
                          {item.endDate && <> · Fin: <strong className="text-slate-800 dark:text-gray-200">{displayDate(item.endDate)}</strong></>}
                        </span>

                        {/* Motivo si fue interrumpido */}
                        {item.status === 'INTERRUMPIDO' && item.interruptionReason && (
                          <span className="text-rose-600 dark:text-rose-400 font-bold truncate">
                            Motivo: {item.interruptionReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/hermanos/${item.brother.id}`)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm uppercase font-black text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all shadow-xs cursor-pointer"
                      title="Abrir ficha personal del hermano"
                    >
                      <span>Ver Ficha</span>
                      <ExternalLink size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Paginación Inferior */}
          {totalAltarPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-xs sm:text-sm text-slate-600 dark:text-gray-300 font-bold">
              <span>
                Página <strong className="text-slate-900 dark:text-white">{currentAltarPage}</strong> de <strong className="text-slate-900 dark:text-white">{totalAltarPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentAltarPage <= 1}
                  onClick={() => setAltarPage((prev) => Math.max(1, prev - 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs sm:text-sm font-bold"
                >
                  Anterior
                </button>

                {Array.from({ length: totalAltarPages }, (_, i) => i + 1)
                  .filter((page) => page === 1 || page === totalAltarPages || Math.abs(page - currentAltarPage) <= 1)
                  .map((page, index, array) => {
                    const prev = array[index - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && <span className="px-1 text-slate-400 font-bold">...</span>}
                        <button
                          type="button"
                          onClick={() => setAltarPage(page)}
                          className={`w-9 h-9 rounded-xl text-xs sm:text-sm font-black transition-colors ${
                            currentAltarPage === page
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  disabled={currentAltarPage >= totalAltarPages}
                  onClick={() => setAltarPage((prev) => Math.min(totalAltarPages, prev + 1))}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs sm:text-sm font-bold"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* TABLERO DE ALERTA Y RESCATE DE ALTARES INTERRUMPIDOS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2.5">
                <AlertTriangle size={22} className="shrink-0" />
                <span>Tablero de Alerta y Rescate de Altares Interrumpidos</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mt-1">
                Listado prioritario para intervención pastoral y reconexión inmediata del hermano.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 w-fit self-start sm:self-center">
              {altarStats.interrumpidos} {altarStats.interrumpidos === 1 ? 'en alerta' : 'en alerta'}
            </span>
          </div>

          {altarStats.interruptedList.length === 0 ? (
            <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 italic p-5 text-center rounded-xl bg-slate-50 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10">
              No hay altares interrumpidos registrados en este momento. ¡Excelente retención!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[400px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {altarStats.interruptedList.map(({ brother, hermanoMayorName, motivo, fecha }) => (
                <div key={brother.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase">{brother.name}</p>
                      <span className="text-xs sm:text-sm px-3 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 font-bold text-slate-600 dark:text-gray-300">
                        Célula: {brother.acompanamiento.celulaName || 'Sin asignar'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium">
                      Motivo: <span className="font-black">{motivo}</span>
                      {fecha && <span className="text-slate-400 dark:text-gray-500 ml-2">({displayDate(fecha)})</span>}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                      Realizado por: <span className="font-black text-slate-800 dark:text-gray-100">{hermanoMayorName}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.open(`/hermanos/${brother.id}`, '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm uppercase font-black tracking-wider border border-rose-300/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all self-start sm:self-center shrink-0 cursor-pointer"
                  >
                    <span>Ficha de Rescate</span>
                    <ExternalLink size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETALLE: GRUPOS DE VIDA ABIERTOS */}
        <div id="seguimiento-grupos-vida" className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm scroll-mt-24 transition-all duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <Users size={22} className="text-[#c5a059]" />
                <span>Grupos de Vida Abiertos</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 mt-1">
                Monitoreo de grupos abiertos, quién lo lidera y cantidad de hermanos menores contenidos.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 w-fit">
              {totalGruposVida} Grupo{totalGruposVida === 1 ? '' : 's'} Abierto{totalGruposVida === 1 ? '' : 's'}
            </span>
          </div>

          {gruposVidaList.length === 0 ? (
            <div className="p-10 text-center rounded-xl bg-slate-50 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10 space-y-2">
              <Users size={36} className="mx-auto text-slate-400 dark:text-gray-600" />
              <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-gray-300">
                No hay Grupos de Vida abiertos {selectedCell !== 'Todas' ? `en la célula ${selectedCell}` : 'registrados aún'}.
              </p>
              <p className="text-xs sm:text-sm text-slate-400 dark:text-gray-500">
                Los grupos se abren cuando un discípulo completa sus altares y es promovido a Hermano Mayor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {gruposVidaList.map((grupo) => (
                <div
                  key={grupo.approval.brotherId}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-black/40 p-4 sm:p-5 flex flex-col justify-between space-y-3.5 hover:border-[#c5a059]/50 transition-all shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase leading-snug line-clamp-2">
                        {grupo.groupName}
                      </h4>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                        Abierto
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      {/* Avatar del Líder vinculado a su ficha */}
                      <div
                        onClick={() => grupo.leader && navigate(`/hermanos/${grupo.leader.id}`)}
                        className="w-10 h-10 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-sm font-black text-[#c5a059] shrink-0 cursor-pointer hover:scale-105 transition-transform"
                        title={grupo.leader ? `Ver ficha de ${grupo.leaderName}` : undefined}
                      >
                        {grupo.leader?.fotoUrl ? (
                          <img src={grupo.leader.fotoUrl} alt={grupo.leaderName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          grupo.leaderName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {/* Nombre del Líder vinculado a su ficha */}
                        <button
                          type="button"
                          onClick={() => grupo.leader && navigate(`/hermanos/${grupo.leader.id}`)}
                          className="text-sm sm:text-base font-bold text-slate-800 dark:text-gray-100 truncate hover:text-[#c5a059] text-left block w-full transition-colors"
                          title={grupo.leader ? `Ver ficha de ${grupo.leaderName}` : undefined}
                        >
                          Líder: <strong className="font-black">{grupo.leaderName}</strong>
                        </button>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 truncate">
                          Célula: {grupo.leaderCell || 'Sin asignar'}
                        </p>
                      </div>
                      {grupo.leader && (
                        <button
                          type="button"
                          onClick={() => navigate(`/hermanos/${grupo.leader?.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#c5a059] transition-colors cursor-pointer"
                          title={`Ver ficha de ${grupo.leaderName}`}
                        >
                          <ExternalLink size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-black text-blue-700 dark:text-blue-300">
                      <Users size={16} />
                      <span>{grupo.totalHermanosMenores} Hermano{grupo.totalHermanosMenores === 1 ? '' : 's'} Menor{grupo.totalHermanosMenores === 1 ? '' : 'es'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedGrupoVidaForModal(grupo)}
                      className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm uppercase font-black tracking-wider border border-[#c5a059]/40 bg-white dark:bg-white/5 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all active:scale-95 flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span>Ver Grupo</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TABLA CONSERVADA: SEGUIMIENTO DE CÉLULAS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                <Building2 size={22} className="text-[#c5a059]" />
                <span>Seguimiento de Células</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-gray-400 mt-1">
                Resumen comparativo de miembros, altares y estado de crecimiento celular.
              </p>
            </div>
          </div>

          {/* Versión Mobile: Tarjetas */}
          <div className="md:hidden space-y-3.5">
            {cellGrowthRows.map((cellRow) => (
              <article
                key={cellRow.cellName}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-slate-900 dark:text-white text-lg sm:text-xl">{cellRow.cellName}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getStatusBadgeClass(
                      cellRow.status,
                    )}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {cellRow.status} ({cellRow.growthIndex}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-gray-300 pt-1">
                  <p>Miembros: <span className="font-black text-slate-900 dark:text-white">{cellRow.members}</span></p>
                  <p>Nuevos: <span className="font-black text-slate-900 dark:text-white">{cellRow.newMembers}</span></p>
                  <p>Altares nuevos: <span className="font-black text-slate-900 dark:text-white">{cellRow.newAltars}</span></p>
                  <p>Discípulos crec.: <span className="font-black text-slate-900 dark:text-white">{cellRow.disciplesInGrowth}</span></p>
                  <p>Altares abiertos: <span className="font-black text-slate-900 dark:text-white">{cellRow.altarsOpenedByDisciples}</span></p>
                  <p>Eventos: <span className="font-black text-slate-900 dark:text-white">{cellRow.eventsHosted}</span></p>
                </div>
              </article>
            ))}
          </div>

          {/* Versión Desktop: Tabla Completa con Tipografía y Números Grandes */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[1020px] w-full text-left">
              <thead>
                <tr className="text-xs sm:text-sm uppercase tracking-wider text-slate-500 dark:text-gray-400 border-b border-slate-200 dark:border-white/10">
                  <th className="py-3.5 pr-4 font-black">Célula</th>
                  <th className="py-3.5 pr-4 font-black">Miembros</th>
                  <th className="py-3.5 pr-4 font-black">Nuevos</th>
                  <th className="py-3.5 pr-4 font-black">Altares nuevos</th>
                  <th className="py-3.5 pr-4 font-black">Discípulos en crecimiento</th>
                  <th className="py-3.5 pr-4 font-black">Altares abiertos</th>
                  <th className="py-3.5 pr-4 font-black">Actividad congregacional</th>
                  <th className="py-3.5 pr-4 font-black">Eventos realizados</th>
                  <th className="py-3.5 font-black">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {cellGrowthRows.map((cellRow) => (
                  <tr key={cellRow.cellName} className="text-sm sm:text-base hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4 font-black text-slate-900 dark:text-white text-base sm:text-lg">{cellRow.cellName}</td>
                    <td className="py-4 pr-4 text-slate-900 dark:text-white font-black text-base">{cellRow.members}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.newMembers}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.newAltars}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.disciplesInGrowth}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.altarsOpenedByDisciples}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.congregationActivities}</td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-gray-300 font-bold">{cellRow.eventsHosted}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm font-black ${getStatusBadgeClass(
                          cellRow.status,
                        )}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {cellRow.status} ({cellRow.growthIndex}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* MODAL: VER HERMANOS MENORES DEL GRUPO DE VIDA            */}
      {/* ======================================================== */}
      <Modal
        isOpen={selectedGrupoVidaForModal !== null}
        onClose={() => setSelectedGrupoVidaForModal(null)}
        title={selectedGrupoVidaForModal ? selectedGrupoVidaForModal.groupName : 'Grupo de Vida'}
      >
        {selectedGrupoVidaForModal && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-xl font-black text-[#c5a059] shrink-0">
                  {selectedGrupoVidaForModal.leader?.fotoUrl ? (
                    <img
                      src={selectedGrupoVidaForModal.leader.fotoUrl}
                      alt={selectedGrupoVidaForModal.leaderName}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    selectedGrupoVidaForModal.leaderName.charAt(0)
                  )}
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-black text-[#c5a059]">Líder del Grupo</span>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase">
                    {selectedGrupoVidaForModal.leaderName}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                    Célula: {selectedGrupoVidaForModal.leaderCell || 'Sin asignar'}
                  </p>
                </div>
              </div>

              {selectedGrupoVidaForModal.leader && (
                <button
                  type="button"
                  onClick={() => window.open(`/hermanos/${selectedGrupoVidaForModal.leader?.id}`, '_blank')}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm uppercase font-black tracking-wider border border-[#c5a059]/40 bg-white dark:bg-white/5 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all self-start sm:self-center cursor-pointer"
                >
                  <span>Ficha Líder</span>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <p className="text-sm sm:text-base uppercase tracking-wider font-black text-slate-600 dark:text-gray-300">
                  Hermanos Menores Contenidos ({selectedGrupoVidaForModal.totalHermanosMenores})
                </p>
              </div>

              {selectedGrupoVidaForModal.hermanosMenores.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="text-sm font-bold text-slate-600 dark:text-gray-400">
                    Aún no hay hermanos menores vinculados a este grupo de vida.
                  </p>
                  <p className="text-xs text-slate-400 dark:text-gray-500">
                    Se asignan automáticamente cuando el hermano menor finaliza su altar con este mentor.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[380px] overflow-y-auto pr-1">
                  {selectedGrupoVidaForModal.hermanosMenores.map((hno) => (
                    <div key={hno.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          onClick={() => window.open(`/hermanos/${hno.id}`, '_blank')}
                          className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-black text-slate-700 dark:text-gray-200 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                          title={`Ver ficha personal de ${hno.name}`}
                        >
                          {hno.fotoUrl ? (
                            <img src={hno.fotoUrl} alt={hno.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            hno.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => window.open(`/hermanos/${hno.id}`, '_blank')}
                            className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase truncate hover:text-[#c5a059] text-left block transition-colors"
                            title={`Ver ficha personal de ${hno.name}`}
                          >
                            {hno.name}
                          </button>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 truncate">
                            {hno.telefono ? `Tel: ${hno.telefono}` : 'Sin teléfono'} · Etapa: {hno.procesoActual}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hno.telefono && (
                          <a
                            href={`https://wa.me/${hno.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                            title="Enviar WhatsApp"
                          >
                            <Phone size={15} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => window.open(`/hermanos/${hno.id}`, '_blank')}
                          className="p-2 rounded-xl border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] transition-all cursor-pointer"
                          title="Abrir ficha en nueva ventana"
                        >
                          <ExternalLink size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
