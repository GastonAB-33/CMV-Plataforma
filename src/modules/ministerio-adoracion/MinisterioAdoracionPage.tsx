import {
  ArrowLeftRight,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  Music,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';
import { useAuth } from '../../hooks/useAuth';
import { canEditManagedModule, listModuleResponsibleNames } from '../../lib/moduleAccess';
import { brothersService } from '../../services/brothersService';
import { ministryChangeLogService, MinistryChangeLogModule } from '../../services/ministryChangeLogService';
import { multimediaScheduleService } from '../../services/multimediaScheduleService';
import { worshipScheduleService } from '../../services/worshipScheduleService';
import { MUSICAL_SKILL_LABELS, MUSICAL_SKILL_TAGS, MusicalSkillTag, worshipTalentService } from '../../services/worshipTalentService';
import { multimediaMinistryService } from '../ministerio-multimedia/services/multimediaMinistryService';
import { worshipMinistryService } from './services/worshipMinistryService';

type CalendarMode = 'full' | 'scheduled';
type WorshipRoleSlot = 'cantantes' | 'guitarristas' | 'bajistas' | 'pianistas' | 'bateristas';
type TagFilter = 'TODOS' | MusicalSkillTag;

interface WorshipServiceSchedule {
  id: string;
  date: string;
  hour: string;
  cantantes: string[];
  guitarristas: string[];
  bajistas: string[];
  pianistas: string[];
  bateristas: string[];
  setlistSongIds: string[];
  source: 'base' | 'manual';
}

interface CalendarScheduleEntry extends Omit<WorshipServiceSchedule, 'source'> {
  source: 'adoracion' | 'multimedia';
  multimediaMembers: string[];
}

interface MemberOption {
  id: string;
  name: string;
  tags: MusicalSkillTag[];
  source: 'ministerio' | 'hermano';
  availability?: 'ALTA' | 'MEDIA' | 'BAJA';
}

interface ConversionConfirmation {
  brotherId: string;
  brotherName: string;
  to: 'active' | 'talent';
  scheduledEvents: Array<{ id: string; date: string; hour: string }>;
}

interface DeleteEventConfirmation {
  id: string;
  date: string;
  hour: string;
  source: 'adoracion' | 'multimedia';
}

type ScheduleModalSection = 'miembros' | 'adoracion';
type ChangeLogFilter = 'all' | MinistryChangeLogModule;

const roleLabels: Record<WorshipRoleSlot, string> = {
  cantantes: 'Cantante',
  guitarristas: 'Guitarrista',
  bajistas: 'Bajista',
  pianistas: 'Pianista',
  bateristas: 'Baterista',
};

const roleTag: Record<WorshipRoleSlot, MusicalSkillTag> = {
  cantantes: 'CANTANTE',
  guitarristas: 'GUITARRISTA',
  bajistas: 'BAJISTA',
  pianistas: 'PIANISTA',
  bateristas: 'BATERISTA',
};

const availabilityLabel: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

const rehearsalStatusLabel: Record<string, string> = {
  PROGRAMADO: 'Programado',
  REALIZADO: 'Realizado',
};

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const todayStr = new Date().toISOString().slice(0, 10);
const isDateBeforeToday = (value: string) => value < todayStr;
const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const toDateStr = (date: Date) => date.toISOString().slice(0, 10);
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (date: Date) => new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date);
const addMonths = (base: Date, n: number) => new Date(base.getFullYear(), base.getMonth() + n, 1);
const capitalize = (value: string) => (value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value);
const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(parsed);
};
const formatDateWithWeekday = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return capitalize(
    new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(parsed)
  );
};
const formatHourForPrompt = (hour: string) => hour.replace(':', '.');
const formatDateTimeForLog = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const byDateTime = (a: { date: string; hour: string }, b: { date: string; hour: string }) =>
  new Date(`${a.date}T${a.hour}:00`).getTime() - new Date(`${b.date}T${b.hour}:00`).getTime();

const inferTags = (value: string): MusicalSkillTag[] => {
  const source = value.toLowerCase();
  const tags: MusicalSkillTag[] = [];
  if (source.includes('voz') || source.includes('cant')) tags.push('CANTANTE');
  if (source.includes('guit')) tags.push('GUITARRISTA');
  if (source.includes('baj')) tags.push('BAJISTA');
  if (source.includes('pian') || source.includes('tecl')) tags.push('PIANISTA');
  if (source.includes('bater') || source.includes('drum')) tags.push('BATERISTA');
  return Array.from(new Set(tags));
};

const buildMonthCells = (monthRef: Date): Array<{ date: string | null; day: number | null }> => {
  const first = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
  const last = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0);
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < first.getDay(); i += 1) cells.push({ date: null, day: null });
  for (let d = 1; d <= last.getDate(); d += 1) {
    cells.push({ date: toDateStr(new Date(monthRef.getFullYear(), monthRef.getMonth(), d)), day: d });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
  return cells;
};

const emptyDrafts = (): Record<WorshipRoleSlot, string[]> => ({
  cantantes: [''],
  guitarristas: [''],
  bajistas: [''],
  pianistas: [''],
  bateristas: [''],
});

const allTagFilters: TagFilter[] = ['TODOS', ...MUSICAL_SKILL_TAGS];

export const MinisterioAdoracionPage = () => {
  const { user } = useAuth();
  const canEdit = canEditManagedModule(user, 'ministerio_adoracion');

  const [refreshKey, setRefreshKey] = useState(0);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('full');
  const [monthRef, setMonthRef] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHour, setSelectedHour] = useState('19:30');
  const [roleDrafts, setRoleDrafts] = useState<Record<WorshipRoleSlot, string[]>>(emptyDrafts);
  const [talentTagFilter, setTalentTagFilter] = useState<TagFilter>('TODOS');
  const [teamTagFilter, setTeamTagFilter] = useState<TagFilter>('TODOS');
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isSetlistModalOpen, setIsSetlistModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [hideActiveInTalentModal, setHideActiveInTalentModal] = useState(false);
  const [conversionConfirmation, setConversionConfirmation] = useState<ConversionConfirmation | null>(null);
  const [deleteEventConfirmation, setDeleteEventConfirmation] = useState<DeleteEventConfirmation | null>(null);
  const [scheduleModalSection, setScheduleModalSection] = useState<ScheduleModalSection>('miembros');
  const [setlistSearch, setSetlistSearch] = useState('');
  const [selectedSetlistSongIds, setSelectedSetlistSongIds] = useState<string[]>([]);
  const [editingManualEventId, setEditingManualEventId] = useState<string | null>(null);
  const [showScheduleToast, setShowScheduleToast] = useState(false);
  const [scheduleToastMessage, setScheduleToastMessage] = useState('');
  const [isChangeLogModalOpen, setIsChangeLogModalOpen] = useState(false);
  const [changeLogFilter, setChangeLogFilter] = useState<ChangeLogFilter>('all');

  const responsables = useMemo(() => listModuleResponsibleNames('ministerio_adoracion'), []);
  const rehearsals = useMemo(() => worshipMinistryService.listRehearsals(), []);
  const multimediaShifts = useMemo(() => multimediaMinistryService.listShifts(), []);
  const songs = useMemo(() => worshipMinistryService.listSetlistSongs(), []);
  const baseMembers = useMemo(() => worshipMinistryService.listMembers(), []);
  const brothers = useMemo(() => brothersService.list(), []);
  const talentProfiles = useMemo(() => worshipTalentService.listProfiles(), [refreshKey]);

  const mergedSchedules = useMemo<WorshipServiceSchedule[]>(
    () => {
      const rows = worshipScheduleService.listAll(rehearsals);
      const grouped = new Map<string, WorshipServiceSchedule>();

      for (const entry of rows) {
        const key = `${entry.date}|${entry.hour}`;
        const current = grouped.get(key);
        const next: WorshipServiceSchedule = {
          id: entry.id,
          date: entry.date,
          hour: entry.hour,
          cantantes: [...entry.cantantes],
          guitarristas: [...entry.guitarristas],
          bajistas: [...entry.bajistas],
          pianistas: [...entry.pianistas],
          bateristas: [...entry.bateristas],
          setlistSongIds: [...entry.setlistSongIds],
          source: entry.source,
        };

        if (!current) {
          grouped.set(key, next);
          continue;
        }

        if (next.source === 'manual') {
          grouped.set(key, next);
        }
      }

      return Array.from(grouped.values()).sort(byDateTime);
    },
    [rehearsals, refreshKey]
  );

  const multimediaSchedules = useMemo(
    () => multimediaScheduleService.listAll(multimediaShifts),
    [multimediaShifts, refreshKey]
  );

  const allCalendarSchedules = useMemo<CalendarScheduleEntry[]>(() => {
    const worshipRows: CalendarScheduleEntry[] = mergedSchedules.map((entry) => {
      const relatedMultimedia =
        multimediaSchedules.find((item) => item.date === entry.date && item.hour === entry.hour) ?? null;
      const multimediaMembers = relatedMultimedia
        ? [
            ...relatedMultimedia.proyeccion.map((name) => `${name} (Proyeccion)`),
            ...relatedMultimedia.luces.map((name) => `${name} (Luces)`),
            ...relatedMultimedia.sonido.map((name) => `${name} (Sonido)`),
            ...relatedMultimedia.transmision.map((name) => `${name} (Transmision)`),
          ]
        : [];

      return {
        ...entry,
        source: 'adoracion',
        multimediaMembers,
      };
    });

    const worshipKeys = new Set(worshipRows.map((entry) => `${entry.date}|${entry.hour}`));

    const multimediaOnly: CalendarScheduleEntry[] = multimediaSchedules
      .filter((entry) => !worshipKeys.has(`${entry.date}|${entry.hour}`))
      .map((entry) => ({
        id: `multimedia-${entry.id}`,
        date: entry.date,
        hour: entry.hour,
        cantantes: [],
        guitarristas: [],
        bajistas: [],
        pianistas: [],
        bateristas: [],
        setlistSongIds: [],
        source: 'multimedia',
        multimediaMembers: [
          ...entry.proyeccion.map((name) => `${name} (Proyeccion)`),
          ...entry.luces.map((name) => `${name} (Luces)`),
          ...entry.sonido.map((name) => `${name} (Sonido)`),
          ...entry.transmision.map((name) => `${name} (Transmision)`),
        ],
      }));

    return [...worshipRows, ...multimediaOnly].sort(byDateTime);
  }, [mergedSchedules, multimediaSchedules]);

  const upcomingRehearsals = useMemo(
    () => worshipScheduleService.listUpcoming(rehearsals).sort(byDateTime),
    [rehearsals, refreshKey]
  );

  const tagged = useMemo(
    () =>
      talentProfiles
        .map((profile) => ({ profile, brother: brothers.find((b) => b.id === profile.brotherId) }))
        .filter(
          (
            entry
          ): entry is {
            profile: (typeof talentProfiles)[number];
            brother: (typeof brothers)[number];
          } => Boolean(entry.brother) && entry.profile.tags.length > 0
        ),
    [talentProfiles, brothers]
  );

  const activeTagged = tagged.filter((entry) => entry.profile.isActiveInWorship);

  const memberOptions = useMemo<MemberOption[]>(() => {
    const base: MemberOption[] = baseMembers.map((member) => ({
      id: `min-${member.id}`,
      name: member.name,
      tags: inferTags(`${member.instrument} ${member.role}`),
      source: 'ministerio',
      availability: member.availability,
    }));

    const taggedMembers: MemberOption[] = activeTagged.map((entry) => ({
      id: `bro-${entry.brother.id}`,
      name: entry.brother.name,
      tags: entry.profile.tags,
      source: 'hermano',
    }));

    return [...base, ...taggedMembers];
  }, [baseMembers, activeTagged]);

  const optionsByRole = useMemo<Record<WorshipRoleSlot, MemberOption[]>>(
    () => ({
      cantantes: memberOptions.filter((entry) => entry.tags.includes(roleTag.cantantes)),
      guitarristas: memberOptions.filter((entry) => entry.tags.includes(roleTag.guitarristas)),
      bajistas: memberOptions.filter((entry) => entry.tags.includes(roleTag.bajistas)),
      pianistas: memberOptions.filter((entry) => entry.tags.includes(roleTag.pianistas)),
      bateristas: memberOptions.filter((entry) => entry.tags.includes(roleTag.bateristas)),
    }),
    [memberOptions]
  );

  const monthSchedules = allCalendarSchedules.filter(
    (entry) => entry.date.startsWith(monthKey(monthRef)) && !isDateBeforeToday(entry.date)
  );
  const daySchedules = allCalendarSchedules.filter((entry) => entry.date === selectedDate);
  const selectedScheduleEntries = allCalendarSchedules.filter((entry) => entry.date === selectedDate && entry.hour === selectedHour);
  const cells = buildMonthCells(monthRef);
  const nextUpcomingSchedule = allCalendarSchedules
    .filter((entry) => new Date(`${entry.date}T${entry.hour}:00`).getTime() >= Date.now())
    .sort(byDateTime)[0];
  const selectedDateTime = new Date(`${selectedDate}T${selectedHour}:00`);
  const isPastSelection = !Number.isNaN(selectedDateTime.getTime()) && selectedDateTime.getTime() < Date.now();

  const filteredTalentRows = useMemo(
    () =>
      tagged.filter((entry) =>
        (talentTagFilter === 'TODOS' ? true : entry.profile.tags.includes(talentTagFilter)) &&
        (!hideActiveInTalentModal || !entry.profile.isActiveInWorship)
      ),
    [tagged, talentTagFilter, hideActiveInTalentModal]
  );

  const filteredTeamRows = useMemo(
    () =>
      memberOptions.filter((entry) =>
        teamTagFilter === 'TODOS' ? true : entry.tags.includes(teamTagFilter)
      ),
    [memberOptions, teamTagFilter]
  );

  const selectedSong = useMemo(() => {
    if (songs.length === 0) {
      return undefined;
    }
    if (!selectedSongId) {
      return songs[0];
    }
    return songs.find((song) => song.id === selectedSongId) ?? songs[0];
  }, [songs, selectedSongId]);

  const setlistById = useMemo(() => new Map(songs.map((song) => [song.id, song])), [songs]);

  const filteredSetlist = useMemo(() => {
    const query = normalizeText(setlistSearch);
    if (!query) {
      return songs;
    }
    return songs.filter((song) => normalizeText(`${song.title} ${song.leadBy} ${song.tone}`).includes(query));
  }, [songs, setlistSearch]);

  const selectedDayEvents = useMemo(
    () => allCalendarSchedules.filter((entry) => entry.date === selectedDate).sort(byDateTime),
    [allCalendarSchedules, selectedDate]
  );
  const changeLogs = useMemo(
    () => ministryChangeLogService.list(changeLogFilter === 'all' ? undefined : changeLogFilter),
    [refreshKey, changeLogFilter]
  );

  const updateDraft = (role: WorshipRoleSlot, index: number, value: string) =>
    setRoleDrafts((previous) => ({
      ...previous,
      [role]: previous[role].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));

  const addDraft = (role: WorshipRoleSlot) =>
    setRoleDrafts((previous) => ({
      ...previous,
      [role]: [...previous[role], ''],
    }));

  const saveSchedule = () => {
    if (!canEdit) {
      return;
    }
    if (isDateBeforeToday(selectedDate)) {
      setScheduleToastMessage('No se pueden registrar eventos en dias pasados.');
      setShowScheduleToast(true);
      return;
    }

    const wasUpdate =
      Boolean(editingManualEventId) ||
      mergedSchedules.some((entry) => entry.date === selectedDate && entry.hour === selectedHour && entry.source === 'manual');

    const toName = (id: string) => memberOptions.find((member) => member.id === id)?.name ?? id;
    worshipScheduleService.upsertManualEntry({
      id: editingManualEventId ?? undefined,
      date: selectedDate,
      hour: selectedHour,
      cantantes: roleDrafts.cantantes.filter(Boolean).map(toName),
      guitarristas: roleDrafts.guitarristas.filter(Boolean).map(toName),
      bajistas: roleDrafts.bajistas.filter(Boolean).map(toName),
      pianistas: roleDrafts.pianistas.filter(Boolean).map(toName),
      bateristas: roleDrafts.bateristas.filter(Boolean).map(toName),
      setlistSongIds: selectedSetlistSongIds,
    });
    ministryChangeLogService.add({
      module: 'adoracion',
      responsible: user.name,
      change: wasUpdate ? 'Evento actualizado' : 'Evento registrado',
      details: `${formatDateWithWeekday(selectedDate)} - ${selectedHour} hs`,
    });
    setRoleDrafts(emptyDrafts());
    setEditingManualEventId(null);
    setSelectedSetlistSongIds([]);
    setSetlistSearch('');
    setScheduleModalSection('miembros');
    setScheduleToastMessage(wasUpdate ? 'Evento actualizado.' : 'Evento registrado.');
    setShowScheduleToast(true);
    setIsScheduleModalOpen(false);
    setRefreshKey((previous) => previous + 1);
  };

  const mapNamesToDraft = (role: WorshipRoleSlot, names: string[]): string[] => {
    const mapped = names
      .map(
        (name) =>
          optionsByRole[role].find((member) => normalizeText(member.name) === normalizeText(name))?.id ?? ''
      )
      .filter(Boolean);
    return mapped.length > 0 ? mapped : [''];
  };

  const openScheduleModalForEntry = (entry: CalendarScheduleEntry) => {
    setSelectedDate(entry.date);
    setSelectedHour(entry.hour);
    setEditingManualEventId(entry.source === 'adoracion' && entry.id.startsWith('manual-') ? entry.id : null);
    setRoleDrafts({
      cantantes: mapNamesToDraft('cantantes', entry.cantantes),
      guitarristas: mapNamesToDraft('guitarristas', entry.guitarristas),
      bajistas: mapNamesToDraft('bajistas', entry.bajistas),
      pianistas: mapNamesToDraft('pianistas', entry.pianistas),
      bateristas: mapNamesToDraft('bateristas', entry.bateristas),
    });
    setSelectedSetlistSongIds(entry.setlistSongIds);
    setScheduleModalSection('miembros');
    setSetlistSearch('');
    setIsDayEventsModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  const openNewScheduleForDate = (date: string) => {
    if (isDateBeforeToday(date)) {
      return;
    }
    setSelectedDate(date);
    setSelectedHour('19:30');
    setEditingManualEventId(null);
    setRoleDrafts(emptyDrafts());
    setSelectedSetlistSongIds([]);
    setScheduleModalSection('miembros');
    setSetlistSearch('');
    setIsDayEventsModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  const openDayEventsModal = (date: string) => {
    setSelectedDate(date);
    setIsDayEventsModalOpen(true);
  };

  const canCreateOnSelectedDate = canEdit && !isDateBeforeToday(selectedDate);
  const canDeleteEntry = (entry: CalendarScheduleEntry) => canEdit && entry.id.startsWith('manual-');

  const requestDeleteEvent = (entry: CalendarScheduleEntry) => {
    if (!canDeleteEntry(entry)) {
      return;
    }
    setDeleteEventConfirmation({
      id: entry.id,
      date: entry.date,
      hour: entry.hour,
      source: entry.source,
    });
  };

  const confirmDeleteEvent = () => {
    if (!deleteEventConfirmation || !canEdit) {
      return;
    }
    const removed =
      deleteEventConfirmation.source === 'adoracion'
        ? worshipScheduleService.removeManualEntry(deleteEventConfirmation.id)
        : multimediaScheduleService.removeManualEntry(deleteEventConfirmation.id);
    setDeleteEventConfirmation(null);
    if (removed) {
      ministryChangeLogService.add({
        module: deleteEventConfirmation.source,
        responsible: user.name,
        change: 'Evento eliminado',
        details: `${formatDateWithWeekday(deleteEventConfirmation.date)} - ${deleteEventConfirmation.hour} hs`,
      });
      setScheduleToastMessage('Evento eliminado.');
      setShowScheduleToast(true);
      setRefreshKey((previous) => previous + 1);
      return;
    }
    setScheduleToastMessage('No se pudo eliminar el evento.');
    setShowScheduleToast(true);
  };

  const activateBrother = (brotherId: string) => {
    if (!canEdit) {
      return;
    }
    worshipTalentService.setActiveMinistryMember(brotherId, true, user.role);
    setRefreshKey((previous) => previous + 1);
  };

  const resolveBrotherIdFromMember = (member: MemberOption) => {
    if (member.source === 'hermano') {
      return member.id.replace('bro-', '');
    }
    const found = brothers.find((brother) => normalizeText(brother.name) === normalizeText(member.name));
    return found?.id;
  };

  const listScheduledEventsByBrotherName = (brotherName: string) => {
    const name = normalizeText(brotherName);
    return mergedSchedules
      .filter((entry) => {
        const all = [...entry.cantantes, ...entry.guitarristas, ...entry.bajistas, ...entry.pianistas, ...entry.bateristas];
        return all.some((participant) => normalizeText(participant) === name);
      })
      .sort(byDateTime)
      .map((entry) => ({ id: entry.id, date: entry.date, hour: entry.hour }));
  };

  const requestActivation = (brotherId: string) => {
    const brother = brothers.find((item) => item.id === brotherId);
    if (!brother) {
      return;
    }
    setConversionConfirmation({
      brotherId,
      brotherName: brother.name,
      to: 'active',
      scheduledEvents: listScheduledEventsByBrotherName(brother.name),
    });
  };

  const requestTalentConversion = (member: MemberOption) => {
    const brotherId = resolveBrotherIdFromMember(member);
    if (!brotherId) {
      return;
    }
    setConversionConfirmation({
      brotherId,
      brotherName: member.name,
      to: 'talent',
      scheduledEvents: listScheduledEventsByBrotherName(member.name),
    });
  };

  const confirmConversion = () => {
    if (!canEdit || !conversionConfirmation) {
      return;
    }
    worshipTalentService.setActiveMinistryMember(
      conversionConfirmation.brotherId,
      conversionConfirmation.to === 'active',
      user.role
    );
    setRefreshKey((previous) => previous + 1);
    setConversionConfirmation(null);
  };

  const transferActiveToTalents = () => {
    if (!canEdit) {
      return;
    }

    const targetRows = tagged.filter((entry) => {
      if (!entry.profile.isActiveInWorship) {
        return false;
      }
      return teamTagFilter === 'TODOS' ? true : entry.profile.tags.includes(teamTagFilter);
    });

    for (const row of targetRows) {
      worshipTalentService.setActiveMinistryMember(row.brother.id, false, user.role);
    }

    setRefreshKey((previous) => previous + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-[#c5a059] text-xs uppercase tracking-[0.2em] font-black">
            <Music size={14} />
            Ministerio de adoracion
          </div>
          <button
            type="button"
            onClick={() => setIsChangeLogModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
          >
            <History size={14} />
            Log de cambios
          </button>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Calendario y talentos musicales</h1>
        <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
          Responsables: <span className="font-bold">{responsables.join(', ')}</span>
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <UsersRound size={16} />
              <span className="text-xs uppercase tracking-widest font-black">Equipo activo</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(true)}
              className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              Ver
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{memberOptions.length}</p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Music size={16} />
              <span className="text-xs uppercase tracking-widest font-black">Setlist vigente</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSetlistModalOpen(true)}
              className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              Ver
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{songs.length}</p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-[#c5a059]">
            <CalendarClock size={16} />
            <span className="text-xs uppercase tracking-widest font-black">Proximos ensayos</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{upcomingRehearsals.length}</p>
          <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-2">
            Desde hoy ({formatDate(todayStr)}) hacia adelante
          </p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <UserCheck size={16} />
              <span className="text-xs uppercase tracking-widest font-black">Talentos detectados</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setHideActiveInTalentModal(false);
                setIsTalentModalOpen(true);
              }}
              className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              Ver
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{tagged.length}</p>
        </article>
      </section>

      <section>
        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={16} className="text-[#c5a059]" />
              Calendario
            </h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCalendarMode('full')}
                className={`px-3 py-1.5 text-[10px] uppercase rounded-full border ${
                  calendarMode === 'full'
                    ? 'border-[#c5a059]/40 text-[#c5a059] bg-[#c5a059]/10'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                }`}
              >
                Completo
              </button>
              <button
                onClick={() => setCalendarMode('scheduled')}
                className={`px-3 py-1.5 text-[10px] uppercase rounded-full border ${
                  calendarMode === 'scheduled'
                    ? 'border-[#c5a059]/40 text-[#c5a059] bg-[#c5a059]/10'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                }`}
              >
                Solo agendados
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setMonthRef((current) => addMonths(current, -1))}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-700 dark:text-gray-200">
              {monthLabel(monthRef)}
            </p>
            <button
              onClick={() => setMonthRef((current) => addMonths(current, 1))}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {calendarMode === 'full' ? (
            <>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {dayLabels.map((day) => (
                  <p key={day} className="text-[10px] text-center uppercase text-slate-500 dark:text-gray-500">
                    {day}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((cell, index) => {
                  const cellDate = cell.date;
                  const count = cellDate ? allCalendarSchedules.filter((entry) => entry.date === cellDate).length : 0;
                  const isToday = cellDate === todayStr;
                  const isSelected = cellDate === selectedDate;
                  const isPast = Boolean(cellDate && isDateBeforeToday(cellDate));
                  const isPastWithoutEvents = isPast && count === 0;

                  return (
                    <button
                      key={`${cell.date ?? 'empty'}-${index}`}
                      disabled={!cell.date}
                      onClick={() => {
                        if (!cell.date) {
                          return;
                        }
                        if (isPastWithoutEvents) {
                          return;
                        }
                        openDayEventsModal(cell.date);
                      }}
                      className={`min-h-[58px] sm:min-h-[74px] rounded-xl p-1.5 sm:p-2 border text-left ${
                        !cell.date
                          ? 'border-transparent'
                          : isSelected
                            ? 'border-[#c5a059]/40 bg-[#c5a059]/10'
                            : isToday
                              ? 'border-blue-400/35 bg-blue-500/10'
                              : isPast
                                ? 'border-slate-300/70 dark:border-white/10 bg-slate-100 dark:bg-[#1a1a1a] text-slate-500 dark:text-slate-400'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]'
                      }`}
                    >
                      {cell.day && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-black">{cell.day}</span>
                            {isToday && (
                              <span className="hidden sm:inline-flex text-[9px] uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
                                Hoy
                              </span>
                            )}
                          </div>
                          {count > 0 && <span className="text-[9px] sm:text-[10px] text-[#c5a059] font-black">{count} evt</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {monthSchedules.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">Sin eventos agendados este mes.</p>
              ) : (
                monthSchedules.map((entry) => (
                  <article
                    key={`${entry.id}-${entry.date}-${entry.hour}`}
                    className={`w-full text-left p-3 rounded-xl border ${
                      nextUpcomingSchedule?.id === entry.id
                        ? 'border-blue-400/35 bg-blue-500/10'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openDayEventsModal(entry.date)}
                      className="w-full text-left"
                    >
                      <p className="font-black">
                        {formatDateWithWeekday(entry.date)} - {entry.hour} hs
                      </p>
                    </button>
                    {entry.setlistSongIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Setlist: {entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ')}
                      </p>
                    )}
                    {nextUpcomingSchedule?.id === entry.id && (
                      <p className="text-[10px] uppercase tracking-widest font-black text-blue-300 mt-1">Proximo evento</p>
                    )}
                    {canDeleteEntry(entry) && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => requestDeleteEvent(entry)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-300/50 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-widest font-black"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>
          )}
        </article>
      </section>

      <section className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
        <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
          <UsersRound size={16} className="text-[#c5a059]" />
          Agenda del dia {selectedDate}
        </h2>
        <div className="space-y-2 mt-4">
          {daySchedules.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No hay servicios cargados para este dia.</p>
          ) : (
            daySchedules.map((entry) => (
              <article key={entry.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="font-black">{entry.hour} hs</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  Cantantes: {entry.cantantes.join(', ') || 'Sin asignar'} | Guitarristas:{' '}
                  {entry.guitarristas.join(', ') || 'Sin asignar'} | Bajistas: {entry.bajistas.join(', ') || 'Sin asignar'} |
                  Pianistas: {entry.pianistas.join(', ') || 'Sin asignar'} | Bateristas: {entry.bateristas.join(', ') || 'Sin asignar'}
                </p>
                {entry.setlistSongIds.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                    Setlist: {entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ')}
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Integrantes del ministerio</h2>
          <div className="space-y-3">
            {memberOptions.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  Habilidades: {member.tags.map((tag) => MUSICAL_SKILL_LABELS[tag]).join(', ') || 'Sin definir'}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Setlist y ensayos</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              {songs.map((song) => (
                <div key={song.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                  <p className="font-bold text-slate-900 dark:text-white">{song.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">Tono {song.tone} - Lidera {song.leadBy}</p>
                </div>
              ))}
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10" />
            <div className="space-y-2">
              {baseMembers.map((member) => (
                <div key={member.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                  <p className="font-bold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    {member.role} - {member.instrument} - Disponibilidad {availabilityLabel[member.availability] ?? member.availability}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-px bg-slate-200 dark:bg-white/10" />
            <div className="space-y-2">
              {rehearsals.map((rehearsal) => (
                <div key={rehearsal.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {rehearsal.date} - {rehearsal.hour}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    {rehearsal.location} - {rehearsalStatusLabel[rehearsal.status] ?? rehearsal.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {!canEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-500">
          <ShieldCheck size={14} />
          Solo los responsables del modulo pueden editar informacion de adoracion.
        </div>
      )}

      <Modal isOpen={isTalentModalOpen} onClose={() => setIsTalentModalOpen(false)} title="Talentos detectados">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setHideActiveInTalentModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              <ArrowLeftRight size={14} />
              transfirir miembros activos
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTagFilters.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTalentTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                  talentTagFilter === tag
                    ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                    : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
                }`}
              >
                {tag === 'TODOS' ? 'Todos' : MUSICAL_SKILL_LABELS[tag]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredTalentRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">No hay hermanos para ese filtro.</p>
            ) : (
              filteredTalentRows.map((entry) => (
                <article key={entry.brother.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <BrotherNameTrigger
                      name={entry.brother.name}
                      className="font-black text-slate-900 dark:text-white hover:text-[#c5a059] transition-colors"
                      fallbackClassName="font-black text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Celula: {entry.brother.acompanamiento.celulaName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.profile.tags.map((tag) => (
                        <span key={`${entry.brother.id}-${tag}`} className="text-[10px] uppercase px-2 py-1 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059]">
                          {MUSICAL_SKILL_LABELS[tag]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {entry.profile.isActiveInWorship ? (
                    <span className="text-[10px] uppercase font-black px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                      Miembro activo
                    </span>
                  ) : canEdit ? (
                    <button
                      onClick={() => requestActivation(entry.brother.id)}
                      className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-[#c5a059]/40 bg-[#c5a059] text-black"
                    >
                      Convertir a miembro activo
                    </button>
                  ) : (
                    <span className="text-[10px] uppercase font-black text-slate-500 dark:text-gray-400 px-3 py-1 rounded-full border border-slate-300 dark:border-white/10">
                      Pendiente
                    </span>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Equipo activo">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={transferActiveToTalents}
              disabled={!canEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059] disabled:opacity-60"
            >
              <ArrowLeftRight size={14} />
              transfirir a talentos detectados
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTagFilters.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTeamTagFilter(tag)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                  teamTagFilter === tag
                    ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                    : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
                }`}
              >
                {tag === 'TODOS' ? 'Todos' : MUSICAL_SKILL_LABELS[tag]}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filteredTeamRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">No hay miembros para ese filtro.</p>
            ) : (
              filteredTeamRows.map((member) => (
                <article key={member.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <BrotherNameTrigger
                      name={member.name}
                      className="font-black text-slate-900 dark:text-white hover:text-[#c5a059] transition-colors"
                      fallbackClassName="font-black text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      Fuente: {member.source === 'ministerio' ? 'Ministerio de adoracion' : 'Hermanos etiquetados'}
                    </p>
                    {member.availability && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Disponibilidad: {availabilityLabel[member.availability] ?? member.availability}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.tags.map((tag) => (
                        <span key={`${member.id}-${tag}`} className="text-[10px] uppercase px-2 py-1 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059]">
                          {MUSICAL_SKILL_LABELS[tag]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canEdit || !resolveBrotherIdFromMember(member)}
                    onClick={() => requestTalentConversion(member)}
                    className="mt-3 px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-[#c5a059]/40 bg-[#c5a059] text-black disabled:opacity-45"
                    title={!resolveBrotherIdFromMember(member) ? 'No se encontro un hermano vinculado por nombre para convertir.' : undefined}
                  >
                    Convertir en talento detectado
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDayEventsModalOpen}
        onClose={() => setIsDayEventsModalOpen(false)}
        title={`Eventos del dia (${formatDate(selectedDate)})`}
      >
        <div className="space-y-4">
          {!isDateBeforeToday(selectedDate) && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => openNewScheduleForDate(selectedDate)}
                disabled={!canCreateOnSelectedDate}
                className="px-3 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black uppercase text-[10px] tracking-widest disabled:opacity-60"
              >
                Nuevo evento
              </button>
            </div>
          )}
          {isDateBeforeToday(selectedDate) && (
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Para este dia solo se muestran eventos ya registrados.
            </p>
          )}

          <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">No hay eventos registrados para este dia.</p>
            ) : (
              selectedDayEvents.map((entry) => {
                const adoracionMembers = [
                  ...entry.cantantes.map((name) => `${name} (Cantante)`),
                  ...entry.guitarristas.map((name) => `${name} (Guitarrista)`),
                  ...entry.bajistas.map((name) => `${name} (Bajista)`),
                  ...entry.pianistas.map((name) => `${name} (Pianista)`),
                  ...entry.bateristas.map((name) => `${name} (Baterista)`),
                ];

                const relatedMultimedia =
                  multimediaSchedules.find((item) => item.date === entry.date && item.hour === entry.hour) ??
                  null;

                const multimediaMembers = relatedMultimedia
                  ? [
                      ...relatedMultimedia.proyeccion.map((name) => `${name} (Proyeccion)`),
                      ...relatedMultimedia.luces.map((name) => `${name} (Luces)`),
                      ...relatedMultimedia.sonido.map((name) => `${name} (Sonido)`),
                      ...relatedMultimedia.transmision.map((name) => `${name} (Transmision)`),
                    ]
                  : [];

                return (
                  <article
                    key={`${entry.id}-${entry.date}-${entry.hour}`}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
                  >
                    <button type="button" onClick={() => openScheduleModalForEntry(entry)} className="w-full text-left">
                    <p className="font-black text-slate-900 dark:text-white">
                      {formatDateWithWeekday(entry.date)} - {entry.hour} hs
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      {entry.source === 'multimedia' ? 'Evento registrado por multimedia' : 'Evento registrado por adoracion'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      Miembros adoracion: {adoracionMembers.join(', ') || 'Sin asignar'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      Miembros multimedia: {multimediaMembers.join(', ') || 'Sin asignar'}
                    </p>
                    </button>
                    {canDeleteEntry(entry) && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => requestDeleteEvent(entry)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-300/50 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-widest font-black"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      <Toast
        isVisible={showScheduleToast}
        onClose={() => setShowScheduleToast(false)}
        message={scheduleToastMessage}
      />

      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Agendar servicio (${formatDate(selectedDate)})`}>
        <div className="space-y-4">
          {isPastSelection && (
            <div className="px-3 py-2 rounded-xl border border-blue-400/35 bg-blue-500/10 text-blue-200 text-[11px] uppercase tracking-widest font-black">
              Evento realizado
            </div>
          )}

          {isPastSelection ? (
            <div className="space-y-3">
              {selectedScheduleEntries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">No hay participantes registrados para este evento.</p>
              ) : (
                selectedScheduleEntries.map((entry) => (
                  <article key={entry.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                    <p className="font-black text-slate-900 dark:text-white">
                      {formatDateWithWeekday(entry.date)} - {entry.hour} hs
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                      Cantantes: {entry.cantantes.join(', ') || 'Sin asignar'} | Guitarristas: {entry.guitarristas.join(', ') || 'Sin asignar'} |
                      Bajistas: {entry.bajistas.join(', ') || 'Sin asignar'} | Pianistas: {entry.pianistas.join(', ') || 'Sin asignar'} |
                      Bateristas: {entry.bateristas.join(', ') || 'Sin asignar'}
                    </p>
                    {entry.setlistSongIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        Setlist: {entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ')}
                      </p>
                    )}
                  </article>
                ))
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalSection('miembros')}
                  className={`w-full justify-self-center max-w-[260px] px-4 py-2 text-xs uppercase tracking-widest rounded-full border font-black ${
                    scheduleModalSection === 'miembros'
                      ? 'border-[#c5a059]/40 text-[#c5a059] bg-[#c5a059]/10'
                      : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                  }`}
                >
                  Miembros
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleModalSection('adoracion')}
                  className={`w-full justify-self-center max-w-[260px] px-4 py-2 text-xs uppercase tracking-widest rounded-full border font-black ${
                    scheduleModalSection === 'adoracion'
                      ? 'border-[#c5a059]/40 text-[#c5a059] bg-[#c5a059]/10'
                      : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400'
                  }`}
                >
                  Adoracion
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  min={todayStr}
                  className="p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f]"
                  disabled={!canEdit}
                />
                <input
                  type="time"
                  value={selectedHour}
                  onChange={(event) => setSelectedHour(event.target.value)}
                  className="p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f]"
                  disabled={!canEdit}
                />
              </div>

              {scheduleModalSection === 'miembros' ? (
                <>
                  {(Object.keys(roleLabels) as WorshipRoleSlot[]).map((role) => (
                    <div key={role} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 mb-2">
                        {roleLabels[role]}(s)
                      </p>
                      <div className="space-y-2">
                        {roleDrafts[role].map((value, idx) => (
                          <select
                            key={`${role}-${idx}`}
                            value={value}
                            onChange={(event) => updateDraft(role, idx, event.target.value)}
                            disabled={!canEdit}
                            className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
                          >
                            <option value="">Seleccionar {roleLabels[role].toLowerCase()}</option>
                            {optionsByRole[role].map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.name}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => addDraft(role)}
                        disabled={!canEdit}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-black text-[#c5a059]"
                      >
                        <Plus size={12} />
                        Agregar nuevo
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] h-[420px] flex flex-col gap-3">
                  <input
                    type="text"
                    value={setlistSearch}
                    onChange={(event) => setSetlistSearch(event.target.value)}
                    placeholder="Buscar por cancion, tono o lider..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
                  />
                  <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredSetlist.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-gray-400">No hay canciones para ese filtro.</p>
                    ) : (
                      filteredSetlist.map((song) => {
                        const isChecked = selectedSetlistSongIds.includes(song.id);
                        return (
                          <label
                            key={song.id}
                            className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setSelectedSetlistSongIds((previous) => [...previous, song.id]);
                                } else {
                                  setSelectedSetlistSongIds((previous) => previous.filter((item) => item !== song.id));
                                }
                              }}
                              disabled={!canEdit}
                              className="mt-1"
                            />
                            <span>
                              <span className="font-black text-slate-900 dark:text-white">{song.title}</span>
                              <span className="block text-xs text-slate-500 dark:text-gray-500">
                                Tono {song.tone} - {song.leadBy}
                              </span>
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={saveSchedule}
                disabled={!canEdit}
                className="w-full py-3 rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black uppercase text-xs tracking-widest disabled:opacity-60"
              >
                Guardar agenda
              </button>
            </>
          )}
        </div>
      </Modal>

      <Modal isOpen={isSetlistModalOpen} onClose={() => setIsSetlistModalOpen(false)} title="Setlist vigente">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          <div className="space-y-2">
            {songs.map((song) => {
              const isSelected = (selectedSongId ?? songs[0]?.id) === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => setSelectedSongId(song.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    isSelected
                      ? 'border-[#c5a059]/40 bg-[#c5a059]/10'
                      : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]'
                  }`}
                >
                  <p className="font-black text-slate-900 dark:text-white">{song.title}</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">Tono {song.tone} - {song.leadBy}</p>
                </button>
              );
            })}
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{selectedSong?.title ?? 'Sin cancion'}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-500 mb-4">
              {selectedSong ? `Tono ${selectedSong.tone} - Lidera ${selectedSong.leadBy}` : ''}
            </p>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-gray-300 font-sans">
              {selectedSong?.lyrics ?? 'Letra pendiente de carga para esta cancion.'}
            </pre>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isChangeLogModalOpen} onClose={() => setIsChangeLogModalOpen(false)} title="Log de cambios">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChangeLogFilter('all')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                changeLogFilter === 'all'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Todos los cambios
            </button>
            <button
              type="button"
              onClick={() => setChangeLogFilter('adoracion')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                changeLogFilter === 'adoracion'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Adoracion
            </button>
            <button
              type="button"
              onClick={() => setChangeLogFilter('multimedia')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                changeLogFilter === 'multimedia'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Multimedia
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto pr-1 space-y-2">
            {changeLogs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">No hay cambios registrados para este filtro.</p>
            ) : (
              changeLogs.map((entry) => (
                <article
                  key={entry.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
                >
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {entry.module === 'adoracion' ? 'Adoracion' : 'Multimedia'} - {entry.change}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                    {entry.details || 'Sin detalle'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">
                    {formatDateTimeForLog(entry.createdAt)} - Responsable: {entry.responsible}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(deleteEventConfirmation)}
        onClose={() => setDeleteEventConfirmation(null)}
        title="Eliminar evento"
        size="sm"
      >
        {deleteEventConfirmation && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-gray-200">
              Esta seguro que desea eliminar el evento del dia{' '}
              <span className="font-black">{formatDateWithWeekday(deleteEventConfirmation.date)}</span> a las{' '}
              <span className="font-black">{formatHourForPrompt(deleteEventConfirmation.hour)}</span>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteEventConfirmation(null)}
                className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300"
              >
                No cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-rose-300/50 bg-rose-500/10 text-rose-300"
              >
                Si eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(conversionConfirmation)}
        onClose={() => setConversionConfirmation(null)}
        title="Confirmar conversion"
        size="sm"
      >
        {conversionConfirmation && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-gray-200">
              Esta seguro que desea convertir a{' '}
              <span className="font-black">{conversionConfirmation.brotherName}</span> en{' '}
              <span className="font-black">
                {conversionConfirmation.to === 'active' ? 'miembro activo' : 'talento detectado'}
              </span>
              ?
            </p>

            {conversionConfirmation.to === 'talent' && conversionConfirmation.scheduledEvents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-300">
                  Este hermano esta registrado en estos eventos
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {conversionConfirmation.scheduledEvents.map((event) => (
                    <article
                      key={event.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
                    >
                      <p className="text-xs font-black text-slate-800 dark:text-gray-100">
                        {formatDateWithWeekday(event.date)} - {event.hour} hs
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConversionConfirmation(null)}
                className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300"
              >
                No cancelar
              </button>
              <button
                type="button"
                onClick={confirmConversion}
                className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-[#c5a059]/40 bg-[#c5a059] text-black"
              >
                Si estoy seguro
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


