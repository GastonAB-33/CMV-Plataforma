import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Church, Filter, Sparkles, TrendingUp, Users, Workflow } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brothersService } from '../../services/brothersService';
import { eventsService } from '../../services/eventsService';
import { Cell, EventType, Proceso } from '../../types';
import { BrotherProfile } from '../hermanos/types';
import { seguimientoModuleService } from './services/seguimientoModuleService';

const STAGES = seguimientoModuleService.getStageOrder();
const PROCESS_SCORE_BY_STAGE: Record<Proceso, number> = {
  [Proceso.ALTAR]: 35,
  [Proceso.GRUPO]: 50,
  [Proceso.EXPERIENCIA]: 65,
  [Proceso.EDDI]: 80,
  [Proceso.DISCIPULO]: 95,
};

type CellFilter = 'Todas' | Cell;
type CellHealth = 'En crecimiento' | 'Estable' | 'En riesgo';
type MobileDashboardLevel = 'resumen' | 'celulas' | 'analitica';
type MobileAnalyticsView = 'impacto' | 'proyecciones' | 'grafica';

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

const clampPercentage = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const toTimestamp = (value?: string): number | null => {
  if (!value) {
    return null;
  }

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
      if (parsed !== null) {
        timestamps.push(parsed);
      }
    }
  }

  for (const event of events) {
    const parsed = toEventTimestamp(event.date, event.time);
    if (parsed !== null) {
      timestamps.push(parsed);
    }
  }

  if (timestamps.length === 0) {
    return Date.now();
  }

  return Math.max(...timestamps);
};

const hasDateInWindow = (value: string | undefined, months: number, referenceTimestamp: number) => {
  const parsed = toTimestamp(value);
  if (parsed === null) {
    return false;
  }

  const monthsBackTimestamp = new Date(referenceTimestamp);
  monthsBackTimestamp.setMonth(monthsBackTimestamp.getMonth() - months);

  return parsed >= monthsBackTimestamp.getTime() && parsed <= referenceTimestamp;
};

const countBrotherObservations = (brother: BrotherProfile) => {
  const stageObservations =
    (brother.altar?.observaciones?.length ?? 0) +
    (brother.grupo?.observaciones?.length ?? 0) +
    (brother.experiencia?.observaciones?.length ?? 0) +
    (brother.eddi?.observaciones?.length ?? 0) +
    (brother.discipulo?.observaciones?.length ?? 0);

  return brother.observations.length + stageObservations;
};

const hasMentorCoverage = (brother: BrotherProfile) =>
  Boolean(
    brother.acompanamiento.acompananteName ||
      brother.acompanamiento.liderCelulaName ||
      brother.acompanamiento.pastorName ||
      brother.acompanamiento.apostolName,
  );

const getCellStatus = (growthIndex: number): CellHealth => {
  if (growthIndex >= 55) {
    return 'En crecimiento';
  }
  if (growthIndex >= 30) {
    return 'Estable';
  }
  return 'En riesgo';
};

const getStatusBadgeClass = (status: CellHealth) => {
  switch (status) {
    case 'En crecimiento':
      return 'border-emerald-300/40 bg-emerald-400/15 text-emerald-300';
    case 'Estable':
      return 'border-amber-300/40 bg-amber-400/15 text-amber-300';
    default:
      return 'border-rose-300/40 bg-rose-400/15 text-rose-300';
  }
};

const formatRate = (value: number) => `${value}%`;

export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<CellFilter>('Todas');
  const [mobileLevel, setMobileLevel] = useState<MobileDashboardLevel>('resumen');
  const [mobileAnalyticsView, setMobileAnalyticsView] = useState<MobileAnalyticsView>('impacto');

  const rows = useMemo(() => seguimientoModuleService.listMatrixRows(), []);
  const brothers = useMemo(() => brothersService.list(), []);
  const events = useMemo(() => eventsService.list(), []);
  const cells = useMemo<CellFilter[]>(() => ['Todas', ...seguimientoModuleService.listCells()], []);

  const scopedRows = useMemo(
    () => rows.filter((row) => selectedCell === 'Todas' || row.cellName === selectedCell),
    [rows, selectedCell],
  );

  const scopedBrotherProfiles = useMemo(
    () =>
      brothers.filter(
        (brother) => selectedCell === 'Todas' || brother.acompanamiento.celulaName === selectedCell,
      ),
    [brothers, selectedCell],
  );

  const scopedEvents = useMemo(() => {
    if (selectedCell === 'Todas') {
      return events;
    }

    return events.filter(
      (event) =>
        event.organizerCell === selectedCell ||
        (event.invitedCells ?? []).includes(selectedCell),
    );
  }, [events, selectedCell]);

  const referenceTimestamp = useMemo(
    () => getDatasetReferenceTimestamp(scopedBrotherProfiles, scopedEvents),
    [scopedBrotherProfiles, scopedEvents],
  );

  const visibleCells = useMemo(() => {
    if (selectedCell === 'Todas') {
      return cells.filter((cell): cell is Cell => cell !== 'Todas');
    }

    return [selectedCell];
  }, [cells, selectedCell]);

  const totalMembers = scopedBrotherProfiles.length;
  const newMembers = scopedBrotherProfiles.filter((brother) => brother.procesoActual === Proceso.ALTAR).length;
  const activeDiscipleship = scopedBrotherProfiles.filter((brother) => brother.procesoActual !== Proceso.DISCIPULO).length;
  const integratedMembers = scopedBrotherProfiles.filter((brother) => brother.procesoActual !== Proceso.ALTAR).length;
  const retentionRate = totalMembers > 0 ? clampPercentage((integratedMembers / totalMembers) * 100) : 0;
  const integrationRate = totalMembers > 0 ? clampPercentage((activeDiscipleship / totalMembers) * 100) : 0;

  const newAltars = scopedBrotherProfiles.filter((brother) =>
    hasDateInWindow(brother.altar?.fechaInicio, 6, referenceTimestamp),
  ).length;

  const disciplesInGrowth = scopedBrotherProfiles.filter((brother) => (brother.disciples?.length ?? 0) >= 2).length;
  const altarsOpenedByDisciples = scopedBrotherProfiles.reduce(
    (total, brother) => total + (brother.disciples?.length ?? 0),
    0,
  );

  const spiritualIndex =
    totalMembers > 0
      ? clampPercentage(
          scopedBrotherProfiles.reduce((score, brother) => score + PROCESS_SCORE_BY_STAGE[brother.procesoActual], 0) /
            totalMembers,
        )
      : 0;

  const mentorCoverage = totalMembers > 0
    ? clampPercentage((scopedBrotherProfiles.filter(hasMentorCoverage).length / totalMembers) * 100)
    : 0;
  const followUpCoverage = totalMembers > 0
    ? clampPercentage((scopedBrotherProfiles.filter((brother) => countBrotherObservations(brother) > 0).length / totalMembers) * 100)
    : 0;
  const pastoralHealthIndex = clampPercentage(mentorCoverage * 0.55 + followUpCoverage * 0.45);

  const atRiskBrothers = scopedBrotherProfiles.filter(
    (brother) =>
      (brother.procesoActual === Proceso.ALTAR || brother.procesoActual === Proceso.GRUPO) &&
      countBrotherObservations(brother) === 0,
  );

  const congregationalActivities = scopedEvents.filter(
    (event) => event.type === EventType.RED || (event.invitedCells?.length ?? 0) > 0,
  ).length;

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

        const growthIndex = members > 0
          ? clampPercentage(
              (((cellNewMembers * 2 + cellNewAltars + cellDisciplesInGrowth + eventsHosted + congregationActivitiesCount) / members) * 22),
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

  const averageCellGrowth = cellGrowthRows.length > 0
    ? Math.round(cellGrowthRows.reduce((sum, cell) => sum + cell.growthIndex, 0) / cellGrowthRows.length)
    : 0;

  const growthSignal = newMembers + disciplesInGrowth + Math.round((congregationalActivities + scopedEvents.length) / 2);

  const projectMembers = (months: number, multiplier: number) => {
    if (totalMembers === 0) {
      return 0;
    }

    const projectedAdds = Math.round((growthSignal * (months / 6)) * multiplier);
    const projectedLosses = Math.round((atRiskBrothers.length * (months / 12)) * (1.3 - multiplier));

    return Math.max(totalMembers, totalMembers + projectedAdds - projectedLosses);
  };

  const projectionRows = [
    {
      horizon: '3 meses',
      conservador: projectMembers(3, 0.75),
      base: projectMembers(3, 1),
      optimista: projectMembers(3, 1.3),
    },
    {
      horizon: '6 meses',
      conservador: projectMembers(6, 0.75),
      base: projectMembers(6, 1),
      optimista: projectMembers(6, 1.3),
    },
    {
      horizon: '12 meses',
      conservador: projectMembers(12, 0.75),
      base: projectMembers(12, 1),
      optimista: projectMembers(12, 1.3),
    },
  ];

  const projectedMembers12Base = projectionRows[2].base;
  const projectedLeadersNeeded = Math.ceil(projectedMembers12Base / 12);
  const stageDistribution = useMemo(
    () =>
      STAGES.map((stage) => ({
        stage,
        completedCount: scopedRows.filter((row) => row.stageStatusByProcess[stage] === 'completed').length,
        incompleteCount: scopedRows.filter((row) => row.stageStatusByProcess[stage] === 'in-progress').length,
      })),
    [scopedRows],
  );
  const maxStageCount = Math.max(
    ...stageDistribution.map((item) => Math.max(item.completedCount, item.incompleteCount)),
    1,
  );
  const chartWidth = 860;
  const chartHeight = 330;
  const plotLeft = 76;
  const plotRight = chartWidth - 24;
  const plotTop = 24;
  const plotBottom = chartHeight - 110;
  const valueToY = (value: number) => {
    return plotBottom - (value / maxStageCount) * (plotBottom - plotTop);
  };
  const valueTicks = [0, 0.25, 0.5, 0.75, 1].map((step) => {
    const value = Math.round(maxStageCount * step);
    return {
      value,
      y: valueToY(value),
    };
  });
  const chartPoints = stageDistribution.map((item, index) => {
    const x =
      stageDistribution.length === 1
        ? (plotLeft + plotRight) / 2
        : plotLeft + (index * (plotRight - plotLeft)) / (stageDistribution.length - 1);

    return {
      ...item,
      x,
      completedY: valueToY(item.completedCount),
      incompleteY: valueToY(item.incompleteCount),
    };
  });
  const completedPolylinePoints = chartPoints
    .map((point) => `${point.x},${point.completedY}`)
    .join(' ');
  const incompletePolylinePoints = chartPoints
    .map((point) => `${point.x},${point.incompleteY}`)
    .join(' ');

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Seguimiento Estrategico</h1>
        <p className="text-slate-500 dark:text-gray-400 max-w-4xl">
          Tablero para liderazgo pastoral y apostolico con foco en crecimiento congregacional, avance espiritual, celulas y proyecciones de cobertura.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4">
        <div className="relative w-full min-w-0">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" size={18} />
          <select
            className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 focus:border-[#c5a059]/50 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer font-bold"
            value={selectedCell}
            onChange={(event) => setSelectedCell(event.target.value as CellFilter)}
          >
            {cells.map((cell) => (
              <option key={cell} value={cell} className="bg-white dark:bg-[#1a1a1a]">
                {cell}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="md:hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-2">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'resumen' as const, label: 'Nivel 1' },
            { id: 'celulas' as const, label: 'Nivel 2' },
            { id: 'analitica' as const, label: 'Nivel 3' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMobileLevel(item.id)}
              className={`rounded-xl px-2 py-2 text-[10px] uppercase tracking-widest font-black transition-all ${
                mobileLevel === item.id
                  ? 'bg-[#c5a059] text-black'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className={`${mobileLevel === 'resumen' ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4`}>
        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Miembros activos</p>
            <Users size={16} className="text-[#c5a059]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#c5a059] mt-3">{totalMembers}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-300 mt-1">Retencion: {formatRate(retentionRate)}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Crecimiento celular</p>
            <TrendingUp size={16} className="text-[#c5a059]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#c5a059] mt-3">{averageCellGrowth}%</p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-300 mt-1">Nuevos integrantes: {newMembers}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Multiplicacion</p>
            <Church size={16} className="text-[#c5a059]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#c5a059] mt-3">{newAltars}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-300 mt-1">Altares nuevos (ventana 6 meses)</p>
        </article>

        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Salud pastoral</p>
            <Sparkles size={16} className="text-[#c5a059]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#c5a059] mt-3">{pastoralHealthIndex}%</p>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-gray-300 mt-1">Indice combinado de acompanamiento y seguimiento</p>
        </article>
      </section>

      <section className={`${mobileLevel === 'resumen' ? 'block' : 'hidden'} md:hidden`}>
        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#c5a059]" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Alertas de seguimiento</p>
          </div>
          {atRiskBrothers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {atRiskBrothers.slice(0, 8).map((brother) => (
                <button
                  key={brother.id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-300"
                  onClick={() => navigate(`/hermanos/${brother.id}`)}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  {brother.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-gray-300">No se detectan riesgos de desconexion con las reglas actuales.</p>
          )}
        </article>
      </section>

      <section className={`${mobileLevel === 'analitica' ? 'space-y-4' : 'hidden'} md:hidden`}>
        <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'impacto' as const, label: 'Impacto' },
              { id: 'proyecciones' as const, label: 'Proyecciones' },
              { id: 'grafica' as const, label: 'Grafica' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMobileAnalyticsView(item.id)}
                className={`rounded-xl px-2 py-2 text-[10px] uppercase tracking-widest font-black transition-all ${
                  mobileAnalyticsView === item.id
                    ? 'bg-[#c5a059] text-black'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>

        {mobileAnalyticsView === 'impacto' && (
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Impacto espiritual</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Integracion</p>
                <p className="text-xl font-black text-[#c5a059] mt-1">{formatRate(integrationRate)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Indice espiritual</p>
                <p className="text-xl font-black text-[#c5a059] mt-1">{formatRate(spiritualIndex)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Seguimiento activo</p>
                <p className="text-xl font-black text-[#c5a059] mt-1">{formatRate(followUpCoverage)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">En riesgo</p>
                <p className="text-xl font-black text-[#c5a059] mt-1">{atRiskBrothers.length}</p>
              </div>
            </div>
          </article>
        )}

        {mobileAnalyticsView === 'proyecciones' && (
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Proyecciones</h2>
            {projectionRows.map((row) => (
              <div key={row.horizon} className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{row.horizon}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-300">Cons.</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{row.conservador}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-black text-[#c5a059]">Base</p>
                    <p className="text-sm font-bold text-[#c5a059]">{row.base}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-300">Opt.</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{row.optimista}</p>
                  </div>
                </div>
              </div>
            ))}
          </article>
        )}

        {mobileAnalyticsView === 'grafica' && (
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Distribucion por etapas</h2>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3 overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[640px] w-full h-[250px]">
                <polyline fill="none" stroke="currentColor" className="text-emerald-400" strokeWidth="3" points={completedPolylinePoints} />
                <polyline fill="none" stroke="currentColor" className="text-[#c5a059]" strokeWidth="3" points={incompletePolylinePoints} />
                {chartPoints.map((point) => (
                  <g key={point.stage}>
                    <circle cx={point.x} cy={point.completedY} r="4" fill="#34d399" />
                    <circle cx={point.x} cy={point.incompleteY} r="4" fill="#c5a059" />
                    <text
                      x={point.x}
                      y={plotBottom + 24}
                      textAnchor="middle"
                      className="fill-slate-600 dark:fill-gray-400 text-[10px] font-semibold"
                    >
                      {point.stage}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </article>
        )}
      </section>

      <section className="hidden md:grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Crecimiento Congregacional</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Resumen</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Integracion</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{formatRate(integrationRate)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Miembros avanzando en ruta de discipulado</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Actividad congregacional</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{congregationalActivities}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Eventos de red e intercelulas</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 col-span-2 md:col-span-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Discipulos en crecimiento</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{disciplesInGrowth}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Lideres potenciales abriendo nuevos altares</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {STAGES.map((stage) => {
                const stageCount = scopedRows.filter((row) => row.currentProcess === stage).length;
                const stageRate = totalMembers > 0 ? clampPercentage((stageCount / totalMembers) * 100) : 0;

                return (
                  <div key={stage} className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">{stage}</p>
                    <p className="text-xl font-black text-[#c5a059] mt-2">{stageCount}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">{stageRate}% del alcance</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">Avance Espiritual y Cuidado Pastoral</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Indice espiritual</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{formatRate(spiritualIndex)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Ponderado por etapa actual de proceso</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Cobertura de acompanamiento</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{formatRate(mentorCoverage)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Hermanos con acompanante, lider o pastor asignado</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/10 col-span-2 md:col-span-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Seguimiento activo</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{formatRate(followUpCoverage)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Registros de observaciones y acompanamiento</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-[#c5a059]" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Miembros en riesgo de desconexion</p>
              </div>
              {atRiskBrothers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {atRiskBrothers.map((brother) => (
                    <button
                      key={brother.id}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-400/10 px-3 py-1 text-xs text-rose-300"
                      onClick={() => navigate(`/hermanos/${brother.id}`)}
                    >
                      <span className="h-2 w-2 rounded-full bg-rose-300" />
                      {brother.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-gray-300">No se detectan riesgos de desconexion con las reglas actuales.</p>
              )}
            </div>
          </article>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <article className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Proyecciones</h2>
              <Workflow size={16} className="text-[#c5a059]" />
            </div>

            <div className="md:hidden space-y-2">
              {projectionRows.map((row) => (
                <article
                  key={row.horizon}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-3"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{row.horizon}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Conservador: {row.conservador}</p>
                  <p className="text-xs text-[#c5a059] font-bold mt-1">Base: {row.base}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-300 mt-1">Optimista: {row.optimista}</p>
                </article>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-500">
                    <th className="py-2 pr-3">Horizonte</th>
                    <th className="py-2 pr-3">Conservador</th>
                    <th className="py-2 pr-3">Base</th>
                    <th className="py-2">Optimista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {projectionRows.map((row) => (
                    <tr key={row.horizon} className="text-sm">
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">{row.horizon}</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-gray-400">{row.conservador}</td>
                      <td className="py-3 pr-3 text-[#c5a059] font-bold">{row.base}</td>
                      <td className="py-3 text-slate-600 dark:text-gray-400">{row.optimista}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 sm:p-4 bg-slate-50 dark:bg-[#0a0a0a]/50">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Lideres requeridos (12m base)</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{projectedLeadersNeeded}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3 sm:p-4 bg-slate-50 dark:bg-[#0a0a0a]/50">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-300">Altares proyectados</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">
                  {Math.max(newAltars, newAltars + Math.round((altarsOpenedByDisciples / 4) + (growthSignal / 5)))}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={`${mobileLevel === 'celulas' ? 'block' : 'hidden'} md:block rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 sm:p-6`}>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">Seguimiento de Celulas</h2>
        <div className="md:hidden space-y-3">
          {cellGrowthRows.map((cellRow) => (
            <article
              key={cellRow.cellName}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a]/50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{cellRow.cellName}</p>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(cellRow.status)}`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {cellRow.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-gray-300">
                <p>Miembros: <span className="font-semibold">{cellRow.members}</span></p>
                <p>Nuevos: <span className="font-semibold">{cellRow.newMembers}</span></p>
                <p>Altares nuevos: <span className="font-semibold">{cellRow.newAltars}</span></p>
                <p>Discipulos en crecimiento: <span className="font-semibold">{cellRow.disciplesInGrowth}</span></p>
                <p>Altares abiertos: <span className="font-semibold">{cellRow.altarsOpenedByDisciples}</span></p>
                <p>Eventos realizados: <span className="font-semibold">{cellRow.eventsHosted}</span></p>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-[980px] w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-500">
                <th className="py-3 pr-3">Celula</th>
                <th className="py-3 pr-3">Miembros</th>
                <th className="py-3 pr-3">Nuevos</th>
                <th className="py-3 pr-3">Altares nuevos</th>
                <th className="py-3 pr-3">Discipulos en crecimiento</th>
                <th className="py-3 pr-3">Altares abiertos (discipulos)</th>
                <th className="py-3 pr-3">Actividad congregacional</th>
                <th className="py-3 pr-3">Eventos realizados</th>
                <th className="py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {cellGrowthRows.map((cellRow) => (
                <tr key={cellRow.cellName} className="text-sm">
                  <td className="py-4 pr-3 font-semibold text-slate-900 dark:text-white">{cellRow.cellName}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.members}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.newMembers}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.newAltars}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.disciplesInGrowth}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.altarsOpenedByDisciples}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.congregationActivities}</td>
                  <td className="py-4 pr-3 text-slate-600 dark:text-gray-400">{cellRow.eventsHosted}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(cellRow.status)}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {cellRow.status} ({cellRow.growthIndex}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hidden md:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Distribucion General por Etapas</h2>
          <p className="text-sm text-slate-500 dark:text-gray-300 mt-1">Grafica de lineas con hermanos completados y sin completar por etapa.</p>
        </div>

        <div className="px-3 sm:px-6 pb-6 sm:pb-8">
          <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0a]/50 p-4 overflow-x-auto">
            <div className="flex flex-wrap items-center gap-6 mb-3 px-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300">
                <span className="inline-block h-0.5 w-7 bg-emerald-400" />
                Completados
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-gray-300">
                <span className="inline-block h-0.5 w-7 bg-[#c5a059]" />
                Sin completar
              </div>
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="min-w-[680px] md:min-w-[860px] w-full h-[300px] md:h-[360px]">
              {valueTicks.map((tick) => (
                <g key={`tick-${tick.value}`}>
                  <line
                    x1={plotLeft}
                    y1={tick.y}
                    x2={plotRight}
                    y2={tick.y}
                    stroke="currentColor"
                    className="text-slate-300/70 dark:text-gray-700/70"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={plotLeft - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    className="fill-slate-600 dark:fill-gray-400 text-[10px] font-semibold"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              <line
                x1={plotLeft}
                y1={plotBottom}
                x2={plotRight}
                y2={plotBottom}
                stroke="currentColor"
                className="text-slate-300 dark:text-gray-700"
                strokeWidth="1"
              />
              <line
                x1={plotLeft}
                y1={plotTop}
                x2={plotLeft}
                y2={plotBottom}
                stroke="currentColor"
                className="text-slate-300 dark:text-gray-700"
                strokeWidth="1"
              />

              <polyline
                fill="none"
                stroke="currentColor"
                className="text-emerald-400"
                strokeWidth="3"
                points={completedPolylinePoints}
              />

              <polyline
                fill="none"
                stroke="currentColor"
                className="text-[#c5a059]"
                strokeWidth="3"
                points={incompletePolylinePoints}
              />

              {chartPoints.map((point) => (
                <g key={point.stage}>
                  <circle cx={point.x} cy={point.completedY} r="5" fill="#34d399" />
                  <circle cx={point.x} cy={point.incompleteY} r="5" fill="#c5a059" />
                  <text
                    x={point.x}
                    y={point.completedY - 12}
                    textAnchor="middle"
                    className="fill-emerald-600 dark:fill-emerald-300 text-[11px] font-semibold"
                  >
                    {point.completedCount}
                  </text>
                  <text
                    x={point.x}
                    y={point.incompleteY + 16}
                    textAnchor="middle"
                    className="fill-amber-700 dark:fill-amber-300 text-[11px] font-semibold"
                  >
                    {point.incompleteCount}
                  </text>
                  <text
                    x={point.x}
                    y={plotBottom + 26}
                    textAnchor="middle"
                    className="fill-slate-600 dark:fill-gray-400 text-[10px] font-semibold"
                  >
                    {point.stage}
                  </text>
                  <text
                    x={point.x}
                    y={plotBottom + 44}
                    textAnchor="middle"
                    className="fill-emerald-600 dark:fill-emerald-300 text-[10px] font-semibold"
                  >
                    Completados: {point.completedCount}
                  </text>
                  <text
                    x={point.x}
                    y={plotBottom + 60}
                    textAnchor="middle"
                    className="fill-amber-700 dark:fill-amber-300 text-[10px] font-semibold"
                  >
                    Sin completar: {point.incompleteCount}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      <footer className="hidden md:flex flex-wrap gap-8 justify-center py-4 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#c5a059]" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-[#c5a059] animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">En Proceso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-white/20" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Pendiente</span>
        </div>
      </footer>
    </div>
  );
};
