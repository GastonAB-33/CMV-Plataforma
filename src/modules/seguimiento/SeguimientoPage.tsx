import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  ChevronRight,
  ExternalLink,
  Filter,
  Flame,
  Phone,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { eventsService } from '../../services/eventsService';
import { useData } from '../../hooks/useData';
import { Cell, EventType, Proceso, Role } from '../../types';
import { BrotherProfile } from '../hermanos/types';
import { altarService } from '../../services/altarService';
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
  const { brothers, isLoadingBrothers } = useData();
  const [selectedCell, setSelectedCell] = useState<CellFilter>('Todas');
  const [selectedGrupoVidaForModal, setSelectedGrupoVidaForModal] = useState<GrupoVidaItem | null>(null);

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
  // 1. ALTARES EN TODA LA CONGREGACIÓN
  // ==========================================
  const altarStats = useMemo(() => {
    let total = 0;
    let enProceso = 0;
    let finalizados = 0;
    let interrumpidos = 0;
    const interruptedList: Array<{
      brother: BrotherProfile;
      hermanoMayorName: string;
      motivo: string;
      fecha?: string;
    }> = [];

    for (const b of scopedBrotherProfiles) {
      const info = altarService.getAltarInfo(b.id);
      const hasAltar = Boolean(
        info.fechaInicio ||
          b.altar?.fechaInicio ||
          (b.altar?.realizadoPor && b.altar.realizadoPor.length > 0) ||
          info.hermanoMayorName ||
          info.isInterrumpido,
      );

      if (hasAltar) {
        total++;
        if (info.isInterrumpido || b.altar?.interrumpido) {
          interrumpidos++;
          interruptedList.push({
            brother: b,
            hermanoMayorName:
              info.hermanoMayorName ||
              (b.altar?.realizadoPor ?? []).join(', ') ||
              b.acompanamiento.acompananteName ||
              'No asignado',
            motivo: info.motivoInterrupcion || b.altar?.motivoInterrupcion || 'Sin motivo especificado',
            fecha: info.fechaInterrupcion || b.altar?.fechaInterrupcion,
          });
        } else if (info.fechaFin || b.altar?.fechaFin) {
          finalizados++;
        } else {
          enProceso++;
        }
      }
    }

    const efectividad = total > 0 ? Math.round((finalizados / total) * 100) : 0;
    return { total, enProceso, finalizados, interrumpidos, efectividad, interruptedList };
  }, [scopedBrotherProfiles]);

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
  // 6. SUGERENCIA 1: EMBUDO DE LA LÍNEA DE VIDA (8 ETAPAS)
  // ==========================================
  const stageFunnel = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    for (const b of scopedBrotherProfiles) {
      const prog = stageProgressionService.resolveProgression(b);
      counts[prog.currentStageNumber] = (counts[prog.currentStageNumber] || 0) + 1;
    }

    const total = scopedBrotherProfiles.length || 1;

    return [
      { number: 1, name: 'Altar', count: counts[1], pct: Math.round((counts[1] / total) * 100), color: 'bg-amber-500' },
      { number: 2, name: 'Hermano Menor', count: counts[2], pct: Math.round((counts[2] / total) * 100), color: 'bg-blue-500' },
      { number: 3, name: 'EDDI', count: counts[3], pct: Math.round((counts[3] / total) * 100), color: 'bg-indigo-500' },
      { number: 4, name: 'Discípulo Conector', count: counts[4], pct: Math.round((counts[4] / total) * 100), color: 'bg-teal-500' },
      { number: 5, name: 'Hermano Mayor', count: counts[5], pct: Math.round((counts[5] / total) * 100), color: 'bg-emerald-500' },
      { number: 6, name: 'Líder de Célula', count: counts[6], pct: Math.round((counts[6] / total) * 100), color: 'bg-cyan-500' },
      { number: 7, name: 'EDEM', count: counts[7], pct: Math.round((counts[7] / total) * 100), color: 'bg-purple-500' },
      { number: 8, name: 'Líder Ministerial', count: counts[8], pct: Math.round((counts[8] / total) * 100), color: 'bg-[#c5a059]' },
    ];
  }, [scopedBrotherProfiles]);

  if (isLoadingBrothers) {
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
          Seguimiento Estratégico
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
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Seguimiento Estratégico
          </h1>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Tablero congregacional para liderazgo pastoral y apostólico: altares, grupos de vida y discipulado.
          </p>
        </div>

        {/* Filtro superior enfocado por células */}
        <div className="relative min-w-[240px] md:w-72">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c5a059]" size={16} />
          <select
            className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/15 focus:border-[#c5a059] rounded-2xl py-3 pl-10 pr-4 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-gray-100 focus:outline-none appearance-none cursor-pointer shadow-sm transition-all"
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
      {/* SECCIÓN 1: ESTADÍSTICAS PRINCIPALES PRIORITARIAS         */}
      {/* ======================================================== */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059]" />
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#c5a059]">
              Estadísticas Principales Prioritarias
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">
            {selectedCell === 'Todas' ? 'Red Apostólica (Todas las células)' : `Filtrado por: Célula ${selectedCell}`}
          </span>
        </div>

        {/* Fila de 5 Tarjetas KPI Prioritarias */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* KPI 1: Altares Congregacionales */}
          <article className="rounded-2xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-4 flex flex-col justify-between shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Altares Totales
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Flame size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{altarStats.total}</p>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-[10px] font-bold">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                  <span>En Proceso:</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15">{altarStats.enProceso}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Finalizados:</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/15">
                    {altarStats.finalizados} ({altarStats.efectividad}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                  <span>Interrumpidos:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/15">{altarStats.interrumpidos}</span>
                </div>
              </div>
            </div>
          </article>

          {/* KPI 2: Grupos de Vida */}
          <article className="rounded-2xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-4 flex flex-col justify-between shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Grupos de Vida
              </span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Users size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{totalGruposVida}</p>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1 text-[10px] font-bold text-slate-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span>Hnos Menores:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-black">{totalHermanosMenoresEnGrupos}</span>
                </p>
                <p className="flex justify-between text-slate-400 dark:text-gray-500">
                  <span>Promedio / Grupo:</span>
                  <span>{promedioHermanosPorGrupo}</span>
                </p>
              </div>
            </div>
          </article>

          {/* KPI 3: Escuela y Discipulado */}
          <article className="rounded-2xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-4 flex flex-col justify-between shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                EDDI y Conectores
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <BookOpen size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{eddiAndConectores.conectoresCount}</p>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1.5 text-[10px] font-bold">
                <div className="flex items-center justify-between text-teal-600 dark:text-teal-400">
                  <span>Discípulos Conectores:</span>
                  <span className="px-1.5 py-0.5 rounded bg-teal-500/15">{eddiAndConectores.conectoresCount}</span>
                </div>
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                  <span>En Proceso de EDDI:</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/15">{eddiAndConectores.enEddiCount}</span>
                </div>
              </div>
            </div>
          </article>

          {/* KPI 4: Células Congregacionales */}
          <article className="rounded-2xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-4 flex flex-col justify-between shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Células Activas
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Building2 size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCelulasCount}</p>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1 text-[10px] font-bold text-slate-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span>Miembros totales:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-black">{totalMiembrosCount}</span>
                </p>
                <p className="flex justify-between text-slate-400 dark:text-gray-500">
                  <span>Promedio / célula:</span>
                  <span>{promedioMiembrosPorCelula} hnos</span>
                </p>
              </div>
            </div>
          </article>

          {/* KPI 5: Discípulos Activos */}
          <article className="rounded-2xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-white/90 via-sky-50/50 to-emerald-50/30 dark:from-[#0d1829]/90 dark:via-[#091220]/90 dark:to-[#060c17]/90 p-4 flex flex-col justify-between shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                Discípulos Activos
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <UserCheck size={18} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{discipulosActivosCount}</p>
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-white/5 space-y-1 text-[10px] font-bold text-slate-600 dark:text-gray-300">
                <p className="flex justify-between">
                  <span>Cobertura discipular:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {totalMiembrosCount > 0
                      ? `${Math.round((discipulosActivosCount / totalMiembrosCount) * 100)}%`
                      : '0%'}
                  </span>
                </p>
                <p className="text-slate-400 dark:text-gray-500 truncate">Hnos ejerciendo discipulado</p>
              </div>
            </div>
          </article>
        </div>

        {/* DETALLE: GRUPOS DE VIDA ABIERTOS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Users size={20} className="text-[#c5a059]" />
                Grupos de Vida Abiertos
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Monitoreo de grupos abiertos, quién lo lidera y cantidad de hermanos menores contenidos.
              </p>
            </div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 w-fit">
              {totalGruposVida} Grupo{totalGruposVida === 1 ? '' : 's'} Abierto{totalGruposVida === 1 ? '' : 's'}
            </span>
          </div>

          {gruposVidaList.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-black/30 border border-dashed border-slate-200 dark:border-white/10 space-y-2">
              <Users size={32} className="mx-auto text-slate-400 dark:text-gray-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-gray-300">
                No hay Grupos de Vida abiertos {selectedCell !== 'Todas' ? `en la célula ${selectedCell}` : 'registrados aún'}.
              </p>
              <p className="text-xs text-slate-400 dark:text-gray-500">
                Los grupos se abren cuando un discípulo completa sus altares y es promovido a Hermano Mayor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {gruposVidaList.map((grupo) => (
                <div
                  key={grupo.approval.brotherId}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-black/40 p-4 flex flex-col justify-between space-y-3 hover:border-[#c5a059]/50 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-snug line-clamp-2">
                        {grupo.groupName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                        Abierto
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-xs font-black text-[#c5a059] shrink-0">
                        {grupo.leader?.fotoUrl ? (
                          <img src={grupo.leader.fotoUrl} alt={grupo.leaderName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          grupo.leaderName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                          Líder: {grupo.leaderName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                          Célula: {grupo.leaderCell || 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-300">
                      <Users size={14} />
                      <span>{grupo.totalHermanosMenores} Hermano{grupo.totalHermanosMenores === 1 ? '' : 's'} Menor{grupo.totalHermanosMenores === 1 ? '' : 'es'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedGrupoVidaForModal(grupo)}
                      className="px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-wider border border-[#c5a059]/40 bg-white dark:bg-white/5 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                    >
                      <span>Ver Grupo</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TABLA CONSERVADA: SEGUIMIENTO DE CÉLULAS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Building2 size={20} className="text-[#c5a059]" />
                Seguimiento de Células
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                Resumen comparativo de miembros, altares y estado de crecimiento celular.
              </p>
            </div>
          </div>

          {/* Versión Mobile: Tarjetas */}
          <div className="md:hidden space-y-3">
            {cellGrowthRows.map((cellRow) => (
              <article
                key={cellRow.cellName}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-slate-900 dark:text-white text-base">{cellRow.cellName}</p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${getStatusBadgeClass(
                      cellRow.status,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {cellRow.status} ({cellRow.growthIndex}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-gray-300 pt-1">
                  <p>Miembros: <span className="font-bold text-slate-900 dark:text-white">{cellRow.members}</span></p>
                  <p>Nuevos: <span className="font-bold text-slate-900 dark:text-white">{cellRow.newMembers}</span></p>
                  <p>Altares nuevos: <span className="font-bold text-slate-900 dark:text-white">{cellRow.newAltars}</span></p>
                  <p>Discípulos crec.: <span className="font-bold text-slate-900 dark:text-white">{cellRow.disciplesInGrowth}</span></p>
                  <p>Altares abiertos: <span className="font-bold text-slate-900 dark:text-white">{cellRow.altarsOpenedByDisciples}</span></p>
                  <p>Eventos: <span className="font-bold text-slate-900 dark:text-white">{cellRow.eventsHosted}</span></p>
                </div>
              </article>
            ))}
          </div>

          {/* Versión Desktop: Tabla Completa */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[980px] w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-500 border-b border-slate-200 dark:border-white/5">
                  <th className="py-3 pr-3 font-black">Célula</th>
                  <th className="py-3 pr-3 font-black">Miembros</th>
                  <th className="py-3 pr-3 font-black">Nuevos</th>
                  <th className="py-3 pr-3 font-black">Altares nuevos</th>
                  <th className="py-3 pr-3 font-black">Discípulos en crecimiento</th>
                  <th className="py-3 pr-3 font-black">Altares abiertos (discípulos)</th>
                  <th className="py-3 pr-3 font-black">Actividad congregacional</th>
                  <th className="py-3 pr-3 font-black">Eventos realizados</th>
                  <th className="py-3 font-black">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {cellGrowthRows.map((cellRow) => (
                  <tr key={cellRow.cellName} className="text-sm hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pr-3 font-black text-slate-900 dark:text-white">{cellRow.cellName}</td>
                    <td className="py-3.5 pr-3 text-slate-700 dark:text-gray-300 font-bold">{cellRow.members}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.newMembers}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.newAltars}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.disciplesInGrowth}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.altarsOpenedByDisciples}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.congregationActivities}</td>
                    <td className="py-3.5 pr-3 text-slate-600 dark:text-gray-400">{cellRow.eventsHosted}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                          cellRow.status,
                        )}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
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
      {/* SECCIÓN 2: ESTADÍSTICAS ESTRATÉGICAS Y SUGERENCIAS       */}
      {/* ======================================================== */}
      <section className="space-y-6 pt-6 border-t-2 border-dashed border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Sparkles size={16} />
            </span>
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-purple-600 dark:text-purple-400">
              Estadísticas Estratégicas y Sugerencias Pastorales
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400 dark:text-gray-500">
            Métricas analíticas complementarias sugeridas
          </span>
        </div>

        {/* SUGERENCIA 1: EMBUDO DE LA LÍNEA DE VIDA (8 ETAPAS) */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span>📊 Sugerencia 1:</span> Embudo de la Línea de Vida (Distribución de las 8 Etapas)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Permite detectar inmediatamente dónde está la concentración y los posibles cuellos de botella de la congregación.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total evaluados: {scopedBrotherProfiles.length} hermanos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {stageFunnel.map((stage) => (
              <div
                key={stage.number}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-800 dark:text-gray-200">
                    {stage.number}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {stage.count} hnos ({stage.pct}%)
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">{stage.name}</p>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${stage.color} rounded-full transition-all`} style={{ width: `${stage.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUGERENCIA 2: ALERTA Y RESCATE DE ALTARES INTERRUMPIDOS */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight flex items-center gap-2">
                <AlertTriangle size={18} />
                <span>🚨 Sugerencia 2:</span> Tablero de Alerta y Rescate de Altares Interrumpidos
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Listado prioritario para intervención pastoral antes de la desconexión definitiva del hermano.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 w-fit">
              {altarStats.interrumpidos} en alerta
            </span>
          </div>

          {altarStats.interruptedList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-gray-400 italic p-3 rounded-xl bg-slate-50 dark:bg-black/30">
              No hay altares interrumpidos registrados en este momento. ¡Excelente retención!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {altarStats.interruptedList.map(({ brother, hermanoMayorName, motivo, fecha }) => (
                <div key={brother.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{brother.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 font-bold text-slate-600 dark:text-gray-300">
                        Célula: {brother.acompanamiento.celulaName || 'Sin asignar'}
                      </span>
                    </div>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      Motivo: <span className="font-bold">{motivo}</span>
                      {fecha && <span className="text-slate-400 dark:text-gray-500 ml-2">({displayDate(fecha)})</span>}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">
                      Realizado por: <span className="font-semibold text-slate-700 dark:text-gray-300">{hermanoMayorName}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => window.open(`/hermanos/${brother.id}`, '_blank')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider border border-rose-300/40 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-all self-start sm:self-center shrink-0"
                  >
                    <span>Ficha de Rescate</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-lg font-black text-[#c5a059] shrink-0">
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
                  <span className="text-[9px] uppercase tracking-wider font-black text-[#c5a059]">Líder del Grupo</span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    {selectedGrupoVidaForModal.leaderName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Célula: {selectedGrupoVidaForModal.leaderCell || 'Sin asignar'}
                  </p>
                </div>
              </div>

              {selectedGrupoVidaForModal.leader && (
                <button
                  type="button"
                  onClick={() => window.open(`/hermanos/${selectedGrupoVidaForModal.leader?.id}`, '_blank')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider border border-[#c5a059]/40 bg-white dark:bg-white/5 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all self-start sm:self-center"
                >
                  <span>Ficha Líder</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
                  Hermanos Menores Contenidos ({selectedGrupoVidaForModal.totalHermanosMenores})
                </p>
              </div>

              {selectedGrupoVidaForModal.hermanosMenores.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-1">
                  <p className="text-xs font-bold text-slate-600 dark:text-gray-400">
                    Aún no hay hermanos menores vinculados a este grupo de vida.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500">
                    Se asignan automáticamente cuando el hermano menor finaliza su altar con este mentor.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[380px] overflow-y-auto pr-1">
                  {selectedGrupoVidaForModal.hermanosMenores.map((hno) => (
                    <div key={hno.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-xs font-black text-slate-700 dark:text-gray-200 shrink-0">
                          {hno.fotoUrl ? (
                            <img src={hno.fotoUrl} alt={hno.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            hno.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">
                            {hno.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                            {hno.telefono ? `Tel: ${hno.telefono}` : 'Sin teléfono'} · Etapa: {hno.procesoActual}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hno.telefono && (
                          <a
                            href={`https://wa.me/${hno.telefono.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Enviar WhatsApp"
                          >
                            <Phone size={13} />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => window.open(`/hermanos/${hno.id}`, '_blank')}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] transition-all"
                          title="Abrir ficha en nueva ventana"
                        >
                          <ExternalLink size={13} />
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
