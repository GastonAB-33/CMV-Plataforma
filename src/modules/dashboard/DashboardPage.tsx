import { AlertTriangle, BookOpen, CalendarClock, CheckCircle2, Clock3, Lightbulb, ShieldAlert, Users } from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { useData } from '../../hooks/useData';
import { Brother, Event, Proceso } from '../../types';

const STAGE_ORDER: Proceso[] = [
  Proceso.ALTAR,
  Proceso.GRUPO,
  Proceso.EXPERIENCIA,
  Proceso.EDDI,
  Proceso.DISCIPULO,
];

const STAGE_LABEL: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'Altar',
  [Proceso.GRUPO]: 'Grupo',
  [Proceso.EXPERIENCIA]: 'Experiencia',
  [Proceso.EDDI]: 'EDDI',
  [Proceso.DISCIPULO]: 'Discipulo',
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const buildEventTimestamp = (event: Event) => {
  const parsed = new Date(`${event.date}T${event.time || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed.getTime();
};

const hasCurrentStageStartDate = (brother: Brother) => {
  switch (brother.procesoActual) {
    case Proceso.ALTAR:
      return Boolean(brother.altar?.fechaInicio);
    case Proceso.GRUPO:
      return Boolean(brother.grupo?.fechaInicio);
    case Proceso.EXPERIENCIA:
      return Boolean(brother.experiencia?.fechaRealizacion);
    case Proceso.EDDI:
      return Boolean(brother.eddi?.fechaInicio);
    case Proceso.DISCIPULO:
      return Boolean(brother.discipulo?.fechaInicio);
    default:
      return false;
  }
};

export const DashboardPage = () => {
  const { brothers, events, notices } = useData();
  const inProgress = brothers.filter((brother) => brother.procesoActual !== Proceso.DISCIPULO).length;
  const unreadNotices = notices.filter((notice) => !notice.isRead).length;

  const stageCounts = STAGE_ORDER.map((stage) => {
    const count = brothers.filter((brother) => brother.procesoActual === stage).length;
    const percentage = brothers.length > 0 ? Math.round((count / brothers.length) * 100) : 0;
    return { stage, count, percentage };
  });

  const missingCompanionCount = brothers.filter(
    (brother) => !brother.acompanamiento.acompananteName && brother.procesoActual !== Proceso.DISCIPULO
  ).length;
  const eddiWithoutGradesCount = brothers.filter(
    (brother) => brother.procesoActual === Proceso.EDDI && (brother.eddi?.notasExamenes?.length ?? 0) === 0
  ).length;
  const missingStageDateCount = brothers.filter((brother) => !hasCurrentStageStartDate(brother)).length;

  const highPriorityTasks = [
    {
      id: 'companions',
      title: 'Asignar acompanante en etapas activas',
      description: 'Hermanos en proceso sin responsable directo asignado.',
      count: missingCompanionCount,
    },
    {
      id: 'eddi-grades',
      title: 'Completar calificaciones EDDI',
      description: 'Hermanos en EDDI sin notas cargadas.',
      count: eddiWithoutGradesCount,
    },
    {
      id: 'stage-dates',
      title: 'Registrar fecha de inicio de etapa',
      description: 'Procesos activos con inicio pendiente de registro.',
      count: missingStageDateCount,
    },
    {
      id: 'notices',
      title: 'Revisar notificaciones internas',
      description: 'Alertas internas pendientes de lectura para liderazgo.',
      count: unreadNotices,
    },
  ];

  const urgentTasks = highPriorityTasks.filter((task) => task.count > 0);

  const upcomingEvents = [...events]
    .sort((left, right) => buildEventTimestamp(left) - buildEventTimestamp(right))
    .slice(0, 5);

  const recentActivity = [...notices]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);

  const dominantStage = [...stageCounts].sort((left, right) => right.count - left.count)[0];
  const processCoverage = brothers.length > 0 ? Math.round((inProgress / brothers.length) * 100) : 0;

  const allEddiGrades = brothers.flatMap((brother) => brother.eddi?.notasExamenes ?? []);
  const approvedEddiCount = allEddiGrades.filter((grade) => {
    if (grade.estado) {
      return grade.estado === 'APROBADO';
    }
    return grade.nota >= 7;
  }).length;
  const eddiApprovalRate = allEddiGrades.length > 0 ? Math.round((approvedEddiCount / allEddiGrades.length) * 100) : 0;

  const insights = [
    {
      id: 'dominant-stage',
      icon: <Lightbulb size={16} />,
      title: 'Etapa con mayor concentracion',
      description: dominantStage
        ? `${STAGE_LABEL[dominantStage.stage]} concentra ${dominantStage.count} hermanos.`
        : 'Sin datos para analizar etapas.',
      toneClass: 'border-[#c5a059]/25 bg-[#c5a059]/10 text-[#c5a059]',
    },
    {
      id: 'process-coverage',
      icon: <ShieldAlert size={16} />,
      title: 'Cobertura de seguimiento',
      description: `${processCoverage}% de la congregacion esta en procesos activos (no discipulo).`,
      toneClass: 'border-blue-400/30 bg-blue-500/10 text-blue-300',
    },
    {
      id: 'eddi-rate',
      icon: <CheckCircle2 size={16} />,
      title: 'Rendimiento EDDI',
      description:
        allEddiGrades.length > 0
          ? `Aprobacion estimada de ${eddiApprovalRate}% sobre ${allEddiGrades.length} evaluaciones.`
          : 'Aun no hay suficientes evaluaciones EDDI para calcular tendencia.',
      toneClass: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-500 dark:text-gray-400">Panel de control para liderazgo con foco en decisiones accionables.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total Hermanos" value={brothers.length} label="miembros activos" icon={<Users size={20} />} />
        <MetricCard title="En Proceso" value={inProgress} label="etapa de crecimiento" icon={<BookOpen size={20} />} />
        <MetricCard title="Eventos Proximos" value={upcomingEvents.length} label="agenda cercana" icon={<CalendarClock size={20} />} />
        <MetricCard title="Pendientes Criticos" value={urgentTasks.length} label="tareas de alta prioridad" icon={<AlertTriangle size={20} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <section className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-2xl border border-[#c5a059]/10">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tareas Pendientes</h2>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Prioridad Alta</span>
            </div>
            {urgentTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {urgentTasks.map((task) => (
                  <article key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                      <span className="text-xs font-black text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-md px-2 py-1">
                        {task.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">{task.description}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5 text-sm text-slate-500 dark:text-gray-400">
                No hay pendientes criticos en este momento.
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">Estado de la Congregacion</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {stageCounts.map((item) => (
                <article key={item.stage} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5">
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">{STAGE_LABEL[item.stage]}</p>
                  <p className="text-2xl font-black text-[#c5a059] mt-2">{item.count}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{item.percentage}% del total</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-xl font-semibold mb-5 text-slate-900 dark:text-white">Actividad Reciente</h2>
            <div className="space-y-4">
              {recentActivity.map((notice, index) => (
                <div key={notice.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] font-black">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{notice.title}</p>
                      <span className={`text-[10px] uppercase tracking-widest font-black ${notice.isRead ? 'text-slate-500 dark:text-gray-500' : 'text-[#c5a059]'}`}>
                        {notice.isRead ? 'Leido' : 'Pendiente'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{notice.message}</p>
                    <p className="text-[11px] text-slate-600 dark:text-gray-600 mt-2">{formatDateTime(notice.createdAt)}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5 text-sm text-slate-500 dark:text-gray-400">
                  Sin actividad reciente registrada.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Eventos Proximos</h2>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <article key={event.id} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{event.type} - {event.cell}</p>
                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500 dark:text-gray-400">
                    <Clock3 size={13} className="text-[#c5a059]" />
                    <span>{formatDateTime(`${event.date}T${event.time || '00:00'}:00`)}</span>
                  </div>
                </article>
              ))}
              {upcomingEvents.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0a0a0a]/50 border border-slate-200 dark:border-white/5 text-sm text-slate-500 dark:text-gray-400">
                  No hay eventos proximos cargados.
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Alertas e Insights</h2>
            <div className="space-y-3">
              {insights.map((insight) => (
                <article key={insight.id} className={`p-4 rounded-xl border ${insight.toneClass}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {insight.icon}
                    <p className="text-sm font-semibold">{insight.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed">{insight.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};


