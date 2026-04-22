import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  History,
  Lightbulb,
  MonitorPlay,
  Music,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { InstallAppButton } from '../../components/ui/InstallAppButton';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { hasPermissionAtLeast } from '../../lib/permissionsMatrix';
import { canEditManagedModule } from '../../lib/moduleAccess';
import { brothersService } from '../../services/brothersService';
import { eventsChangeLogService } from '../../services/eventsChangeLogService';
import { ministryChangeLogService } from '../../services/ministryChangeLogService';
import { multimediaEquipmentService } from '../../services/multimediaEquipmentService';
import { multimediaScheduleService } from '../../services/multimediaScheduleService';
import { multimediaTalentService } from '../../services/multimediaTalentService';
import { worshipScheduleService } from '../../services/worshipScheduleService';
import { worshipTalentService } from '../../services/worshipTalentService';
import { Cell, Event, Proceso, Role, User } from '../../types';
import { BrotherProfile } from '../hermanos/types';
import { eddiSchoolService } from '../escuela-eddi/services/eddiSchoolService';
import { multimediaMinistryService } from '../ministerio-multimedia/services/multimediaMinistryService';
import { worshipMinistryService } from '../ministerio-adoracion/services/worshipMinistryService';

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

interface DashboardActivityItem {
  id: string;
  source: string;
  title: string;
  description: string;
  createdAt: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const parseDate = (value?: string): number => {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
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

const formatDate = (value?: string) => {
  if (!value) {
    return 'Sin fecha';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
  }).format(parsed);
};

const eventTimestamp = (event: Event) => {
  const parsed = new Date(`${event.date}T${event.time || '00:00'}:00`).getTime();
  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return parsed;
};

const hasCurrentStageStartDate = (brother: BrotherProfile) => {
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

const getUserCells = (user: User): Set<Cell> => {
  const cells = new Set<Cell>();
  if (user.primaryCell) {
    cells.add(user.primaryCell);
  }
  for (const cell of user.coveredCells ?? []) {
    cells.add(cell);
  }
  return cells;
};

const isBrotherVisibleForUser = (brother: BrotherProfile, user: User): boolean => {
  if (user.role === Role.APOSTOL) {
    return true;
  }

  const userCells = getUserCells(user);
  if (userCells.size === 0) {
    return false;
  }

  return userCells.has(brother.acompanamiento.celulaName);
};

const getLatestFollowUpTimestamp = (brother: BrotherProfile): number => {
  const dates = [
    ...brother.observations.map((observation) => parseDate(observation.date)),
    ...(brother.altar?.observaciones?.map((observation) => parseDate(observation.createdAt)) ?? []),
    ...(brother.grupo?.observaciones?.map((observation) => parseDate(observation.createdAt)) ?? []),
    ...(brother.experiencia?.observaciones?.map((observation) => parseDate(observation.createdAt)) ?? []),
    ...(brother.eddi?.observaciones?.map((observation) => parseDate(observation.createdAt)) ?? []),
    ...(brother.discipulo?.observaciones?.map((observation) => parseDate(observation.createdAt)) ?? []),
  ].filter((value) => value > 0);

  if (dates.length === 0) {
    return 0;
  }

  return Math.max(...dates);
};

const roleLabel = (role: Role) =>
  role
    .split('_')
    .join(' ')
    .toLowerCase();

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brothers, events, news, notices } = useData();

  const visibleBrothers = useMemo(
    () => brothers.filter((brother) => isBrotherVisibleForUser(brother, user)),
    [brothers, user],
  );

  const visibleBrotherIds = useMemo(
    () => new Set(visibleBrothers.map((brother) => brother.id)),
    [visibleBrothers],
  );

  const now = Date.now();
  const next7Days = now + 7 * DAY_MS;
  const staleThreshold = now - 45 * DAY_MS;

  const inProcessCount = visibleBrothers.filter(
    (brother) => brother.procesoActual !== Proceso.DISCIPULO,
  ).length;

  const unreadNotices = notices.filter((notice) => !notice.isRead).length;

  const missingCompanionCount = visibleBrothers.filter(
    (brother) =>
      !brother.acompanamiento.acompananteName &&
      brother.procesoActual !== Proceso.DISCIPULO,
  ).length;

  const eddiWithoutGradesCount = visibleBrothers.filter(
    (brother) =>
      brother.procesoActual === Proceso.EDDI &&
      (brother.eddi?.notasExamenes?.length ?? 0) === 0,
  ).length;

  const missingStageDateCount = visibleBrothers.filter(
    (brother) => !hasCurrentStageStartDate(brother),
  ).length;

  const staleFollowUpCount = visibleBrothers.filter((brother) => {
    if (brother.procesoActual === Proceso.DISCIPULO) {
      return false;
    }
    const latestFollowUp = getLatestFollowUpTimestamp(brother);
    return latestFollowUp === 0 || latestFollowUp < staleThreshold;
  }).length;

  const criticalAlerts = [
    {
      id: 'companions',
      title: 'Asignar acompanante',
      description: 'Hermanos activos sin acompanante directo.',
      count: missingCompanionCount,
      action: () => navigate('/hermanos'),
      actionLabel: 'Ir a Hermanos',
    },
    {
      id: 'stage-date',
      title: 'Completar fecha de etapa',
      description: 'Procesos activos sin fecha de inicio registrada.',
      count: missingStageDateCount,
      action: () => navigate('/tracking'),
      actionLabel: 'Ir a Seguimiento',
    },
    {
      id: 'eddi-grade',
      title: 'Cargar notas EDDI',
      description: 'Hermanos en EDDI sin calificaciones.',
      count: eddiWithoutGradesCount,
      action: () => navigate('/escuela-eddi'),
      actionLabel: 'Ir a Escuela EDDI',
    },
    {
      id: 'follow-up',
      title: 'Actualizar seguimiento',
      description: 'Hermanos activos sin observaciones recientes.',
      count: staleFollowUpCount,
      action: () => navigate('/tracking'),
      actionLabel: 'Revisar casos',
    },
    {
      id: 'notices',
      title: 'Notificaciones pendientes',
      description: 'Avisos internos sin lectura.',
      count: unreadNotices,
      action: () => navigate('/events'),
      actionLabel: 'Ver Eventos/Noticias',
    },
  ].filter((item) => item.count > 0);

  const stageCounts = STAGE_ORDER.map((stage) => {
    const count = visibleBrothers.filter((brother) => brother.procesoActual === stage).length;
    const percentage = visibleBrothers.length > 0
      ? Math.round((count / visibleBrothers.length) * 100)
      : 0;
    return {
      stage,
      count,
      percentage,
    };
  });

  const dominantStage = [...stageCounts].sort((left, right) => right.count - left.count)[0];

  const upcomingEvents7Days = [...events]
    .filter((event) => {
      const ts = eventTimestamp(event);
      return ts >= now && ts <= next7Days;
    })
    .sort((left, right) => eventTimestamp(left) - eventTimestamp(right));

  const fallbackEvents = [...events]
    .sort((left, right) => eventTimestamp(right) - eventTimestamp(left))
    .slice(0, 3);

  const agendaEvents = upcomingEvents7Days.length > 0
    ? upcomingEvents7Days.slice(0, 4)
    : fallbackEvents;

  const eddiCohorts = eddiSchoolService.listCohorts();
  const eddiStudents = eddiSchoolService.listStudentProgress();
  const eddiUpcomingClasses = eddiSchoolService
    .listUpcomingClasses()
    .sort((left, right) => parseDate(left.date) - parseDate(right.date));

  const eddiClasses7Days = eddiUpcomingClasses.filter((item) => {
    const ts = parseDate(`${item.date}T${item.hour || '00:00'}:00`);
    return ts >= now && ts <= next7Days;
  });

  const worshipRehearsals = worshipMinistryService.listRehearsals();
  const worshipMembers = worshipMinistryService.listMembers();
  const worshipUpcoming = worshipScheduleService.listUpcoming(worshipRehearsals);
  const worshipAgenda = worshipUpcoming
    .filter((entry) => parseDate(`${entry.date}T${entry.hour || '00:00'}:00`) <= next7Days)
    .slice(0, 4);

  const multimediaShifts = multimediaMinistryService.listShifts();
  const multimediaMembers = multimediaMinistryService.listMembers();
  const multimediaUpcoming = multimediaScheduleService.listUpcoming(multimediaShifts);
  const multimediaAgenda = multimediaUpcoming
    .filter((entry) => parseDate(`${entry.date}T${entry.hour || '00:00'}:00`) <= next7Days)
    .slice(0, 4);

  const activeWorshipTalent = worshipTalentService
    .listProfiles()
    .filter((profile) => profile.isActiveInWorship)
    .map((profile) => profile.brotherId);

  const activeMultimediaTalent = multimediaTalentService
    .listProfiles()
    .filter((profile) => profile.isActiveInMultimedia)
    .map((profile) => profile.brotherId);

  const worshipTalentNames = new Set(
    visibleBrothers
      .filter((brother) => activeWorshipTalent.includes(brother.id))
      .map((brother) => brother.name),
  );

  const multimediaTalentNames = new Set(
    visibleBrothers
      .filter((brother) => activeMultimediaTalent.includes(brother.id))
      .map((brother) => brother.name),
  );

  const totalWorshipActive = new Set([
    ...worshipMembers.map((member) => member.name),
    ...worshipTalentNames,
  ]).size;

  const totalMultimediaActive = new Set([
    ...multimediaMembers.map((member) => member.name),
    ...multimediaTalentNames,
  ]).size;

  const eventsLogs = eventsChangeLogService.list();
  const ministryLogs = ministryChangeLogService.list();

  const activityItems: DashboardActivityItem[] = [
    ...notices.map((item) => ({
      id: `notice-${item.id}`,
      source: 'Notificacion interna',
      title: item.title,
      description: item.message,
      createdAt: item.createdAt,
    })),
    ...eventsLogs.map((item) => ({
      id: `event-log-${item.id}`,
      source: 'Eventos/Noticias',
      title: item.change,
      description: item.details || 'Sin detalle',
      createdAt: item.createdAt,
    })),
    ...ministryLogs.map((item) => ({
      id: `ministry-log-${item.id}`,
      source: item.module === 'adoracion' ? 'Ministerio Adoracion' : 'Ministerio Multimedia',
      title: item.change,
      description: item.details || 'Sin detalle',
      createdAt: item.createdAt,
    })),
    ...news.map((item) => ({
      id: `news-${item.id}`,
      source: 'Noticias',
      title: item.title,
      description: item.body,
      createdAt: item.publishedAt,
    })),
  ]
    .sort((left, right) => parseDate(right.createdAt) - parseDate(left.createdAt))
    .slice(0, 8);

  const visibleAudits = brothersService
    .auditDataCompleteness()
    .filter((audit) => visibleBrotherIds.has(audit.brotherId));

  const incompleteProfilesCount = visibleAudits.filter(
    (audit) => audit.missingFields.length > 0,
  ).length;

  const profilesWithoutResponsibleCount = visibleBrothers.filter(
    (brother) =>
      !brother.acompanamiento.acompananteName &&
      !brother.acompanamiento.liderCelulaName &&
      !brother.acompanamiento.pastorName &&
      !brother.acompanamiento.apostolName,
  ).length;

  const eventsWithoutTimeCount = events.filter((event) => !event.time).length;

  const topQualityIssues = visibleAudits
    .filter((audit) => audit.missingFields.length > 0)
    .map((audit) => ({
      ...audit,
      brotherName:
        visibleBrothers.find((brother) => brother.id === audit.brotherId)?.name ||
        'Hermano no encontrado',
    }))
    .sort((left, right) => right.missingFields.length - left.missingFields.length)
    .slice(0, 5);

  const canEditHermanos = hasPermissionAtLeast(user.role, 'hermanos', 'edit');
  const canEditTracking = hasPermissionAtLeast(user.role, 'seguimiento', 'edit');
  const canEditEvents = hasPermissionAtLeast(user.role, 'eventos', 'edit');
  const canEditEddi = canEditManagedModule(user, 'escuela_eddi');
  const canEditWorship = canEditManagedModule(user, 'ministerio_adoracion');
  const canEditMultimedia = canEditManagedModule(user, 'ministerio_multimedia');

  const userCells = [...getUserCells(user)];
  const scopeLabel = user.role === Role.APOSTOL
    ? 'Vista global de toda la plataforma'
    : userCells.length > 0
      ? `Vista por celulas: ${userCells.join(', ')}`
      : 'Vista restringida sin celulas asignadas';

  const execAgendaCount =
    upcomingEvents7Days.length +
    eddiClasses7Days.length +
    worshipAgenda.length +
    multimediaAgenda.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">
          Inicio estrategico
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Centro de control
        </h1>
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Rol actual: <span className="font-bold capitalize">{roleLabel(user.role)}</span>.
          {' '}
          {scopeLabel}.
        </p>
        <InstallAppButton />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Resumen Ejecutivo"
          value={visibleBrothers.length}
          label="hermanos visibles"
          icon={<Users size={20} />}
        />
        <MetricCard
          title="En Proceso"
          value={inProcessCount}
          label="en ruta de crecimiento"
          icon={<BookOpen size={20} />}
        />
        <MetricCard
          title="Agenda 7 Dias"
          value={execAgendaCount}
          label="items operativos"
          icon={<CalendarClock size={20} />}
        />
        <MetricCard
          title="Pendientes Criticos"
          value={criticalAlerts.length}
          label="alertas activas"
          icon={<AlertTriangle size={20} />}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          <article className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Alertas Prioritarias
              </h2>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">
                Accion inmediata
              </span>
            </div>

            {criticalAlerts.length === 0 ? (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                No hay alertas criticas para este alcance de usuario.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {criticalAlerts.map((alert) => (
                  <article
                    key={alert.id}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <span className="rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 px-2 py-1 text-[10px] font-black text-[#c5a059]">
                        {alert.count}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mb-3">
                      {alert.description}
                    </p>
                    <button
                      type="button"
                      onClick={alert.action}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-[#c5a059] hover:text-[#d4b375]"
                    >
                      {alert.actionLabel}
                      <ArrowRight size={12} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Seguimiento de Procesos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {stageCounts.map((item) => (
                <div
                  key={item.stage}
                  className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4"
                >
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
                    {STAGE_LABEL[item.stage]}
                  </p>
                  <p className="text-2xl font-black text-[#c5a059] mt-2">{item.count}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                    {item.percentage}% del total
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 text-blue-200 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb size={14} />
                <span className="font-semibold">Insight principal</span>
              </div>
              {dominantStage
                ? `${STAGE_LABEL[dominantStage.stage]} es la etapa con mayor concentracion (${dominantStage.count} hermanos).`
                : 'Sin datos de procesos para analizar.'}
            </div>
          </article>

          <article className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Actividad Reciente
            </h2>
            <div className="space-y-3">
              {activityItems.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4 text-sm text-slate-500 dark:text-gray-400">
                  No hay actividad reciente para mostrar.
                </div>
              ) : (
                activityItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <span className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      {item.description}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-2">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </article>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <article className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Agenda Operativa
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-2">
                  Eventos ({upcomingEvents7Days.length > 0 ? 'proximos 7 dias' : 'ultimos cargados'})
                </p>
                <div className="space-y-2">
                  {agendaEvents.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3 text-xs text-slate-500 dark:text-gray-500">
                      No hay eventos en agenda.
                    </div>
                  ) : (
                    agendaEvents.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                          {event.type} - {event.cell}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <Clock3 size={12} className="text-[#c5a059]" />
                          {formatDateTime(`${event.date}T${event.time || '00:00'}:00`)}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-2">
                  Escuela EDDI
                </p>
                {eddiClasses7Days.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3 text-xs text-slate-500 dark:text-gray-500">
                    Sin clases en los proximos 7 dias.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eddiClasses7Days.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                          {formatDate(item.date)} - {item.hour} - {item.teacher}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-1">
                    Adoracion
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{worshipAgenda.length}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">ensayos/servicios en 7 dias</p>
                </article>
                <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059] mb-1">
                    Multimedia
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{multimediaAgenda.length}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">turnos en 7 dias</p>
                </article>
              </div>
            </div>
          </article>

          <article className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Modulos Ministeriales
            </h2>

            <div className="space-y-3">
              <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <GraduationCap size={14} className="text-[#c5a059]" />
                    Escuela EDDI
                  </p>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${canEditEddi ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {canEditEddi ? 'Gestion' : 'Lectura'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  Cohortes activas: {eddiCohorts.filter((cohort) => cohort.status === 'EN_CURSO').length} |
                  Asistencia promedio:{' '}
                  {eddiStudents.length > 0
                    ? `${Math.round(eddiStudents.reduce((acc, item) => acc + item.attendanceRate, 0) / eddiStudents.length)}%`
                    : 'Sin datos'} |
                  Nota promedio:{' '}
                  {eddiStudents.filter((item) => item.averageGrade !== null).length > 0
                    ? (
                      eddiStudents
                        .filter((item) => item.averageGrade !== null)
                        .reduce((acc, item) => acc + (item.averageGrade ?? 0), 0) /
                      eddiStudents.filter((item) => item.averageGrade !== null).length
                    ).toFixed(1)
                    : 'Sin notas'}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Music size={14} className="text-[#c5a059]" />
                    Ministerio Adoracion
                  </p>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${canEditWorship ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {canEditWorship ? 'Gestion' : 'Lectura'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  Miembros activos: {totalWorshipActive} | Agenda futura:{' '}
                  {worshipUpcoming.length} | Repertorio: {worshipMinistryService.listSetlistSongs().length}
                </p>
              </article>

              <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MonitorPlay size={14} className="text-[#c5a059]" />
                    Ministerio Multimedia
                  </p>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${canEditMultimedia ? 'text-emerald-300' : 'text-blue-300'}`}>
                    {canEditMultimedia ? 'Gestion' : 'Lectura'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                  Miembros activos: {totalMultimediaActive} | Turnos futuros:{' '}
                  {multimediaUpcoming.length} | Equipos observados: {multimediaEquipmentService.list().length}
                </p>
              </article>
            </div>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <article className="xl:col-span-7 bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Calidad de Datos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
                Fichas incompletas
              </p>
              <p className="text-2xl font-black text-[#c5a059] mt-1">{incompleteProfilesCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
                Sin responsable
              </p>
              <p className="text-2xl font-black text-[#c5a059] mt-1">{profilesWithoutResponsibleCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
                Eventos sin hora
              </p>
              <p className="text-2xl font-black text-[#c5a059] mt-1">{eventsWithoutTimeCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
                Seguimiento vencido
              </p>
              <p className="text-2xl font-black text-[#c5a059] mt-1">{staleFollowUpCount}</p>
            </div>
          </div>

          <div className="space-y-2">
            {topQualityIssues.length === 0 ? (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                No se detectaron inconsistencias relevantes en las fichas visibles.
              </div>
            ) : (
              topQualityIssues.map((issue) => (
                <article
                  key={issue.brotherId}
                  className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-amber-200">{issue.brotherName}</p>
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-300">
                      {issue.missingFields.length} campos
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/80 mt-1">
                    {issue.missingFields.slice(0, 3).join(', ')}
                    {issue.missingFields.length > 3 ? '...' : ''}
                  </p>
                </article>
              ))
            )}
          </div>
        </article>

        <article className="xl:col-span-5 bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-[#c5a059]/10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Accesos Rapidos
          </h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/hermanos')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4 text-left hover:border-[#c5a059]/40 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={14} className="text-[#c5a059]" />
                Gestionar Hermanos
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {canEditHermanos ? 'Crear y actualizar seguimiento de fichas.' : 'Consultar fichas y estado actual.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/tracking')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4 text-left hover:border-[#c5a059]/40 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert size={14} className="text-[#c5a059]" />
                Revisar Seguimiento
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {canEditTracking ? 'Actualizar procesos y priorizar casos.' : 'Ver avance por etapa y responsables.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/events')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4 text-left hover:border-[#c5a059]/40 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarClock size={14} className="text-[#c5a059]" />
                Eventos y Noticias
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {canEditEvents ? 'Registrar eventos y publicaciones.' : 'Consultar agenda y comunicados visibles.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/escuela-eddi')}
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4 text-left hover:border-[#c5a059]/40 transition-colors"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap size={14} className="text-[#c5a059]" />
                Escuela EDDI
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                {canEditEddi ? 'Administrar cohortes y progreso academico.' : 'Ver calendario y avances academicos.'}
              </p>
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-blue-400/30 bg-blue-500/10 p-4 text-blue-200 text-xs">
            <div className="flex items-center gap-2 mb-2">
              <History size={14} />
              <span className="font-semibold uppercase tracking-widest">
                Recomendacion
              </span>
            </div>
            Prioriza primero las alertas criticas y luego la calidad de datos para mantener
            limpio el tablero de decisiones.
          </div>
        </article>
      </section>

      <footer className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-4">
        <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-500">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Resumen ejecutivo
          </span>
          <span className="inline-flex items-center gap-2">
            <AlertTriangle size={12} className="text-amber-400" />
            Alertas priorizadas
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldAlert size={12} className="text-blue-400" />
            Calidad y control
          </span>
        </div>
      </footer>
    </div>
  );
};


