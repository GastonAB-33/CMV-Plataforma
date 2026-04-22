import {
  ArrowLeftRight,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  MonitorPlay,
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
import { multimediaEquipmentService } from '../../services/multimediaEquipmentService';
import { multimediaScheduleService } from '../../services/multimediaScheduleService';
import {
  MULTIMEDIA_SKILL_LABELS,
  MULTIMEDIA_SKILL_TAGS,
  MultimediaSkillTag,
  multimediaTalentService,
} from '../../services/multimediaTalentService';
import { worshipScheduleService } from '../../services/worshipScheduleService';
import { worshipMinistryService } from '../ministerio-adoracion/services/worshipMinistryService';
import { multimediaMinistryService } from './services/multimediaMinistryService';

type CalendarMode = 'full' | 'scheduled';
type MultimediaRoleSlot = 'proyeccion' | 'luces' | 'sonido' | 'transmision';
type TagFilter = 'TODOS' | MultimediaSkillTag;

interface MultimediaServiceSchedule {
  id: string;
  date: string;
  hour: string;
  proyeccion: string[];
  luces: string[];
  sonido: string[];
  transmision: string[];
}

interface CalendarScheduleEntry extends MultimediaServiceSchedule {
  source: 'multimedia' | 'adoracion';
  setlistSongIds: string[];
  worshipMembers: Array<{ name: string; role: string }>;
}

interface MemberOption {
  id: string;
  name: string;
  tags: MultimediaSkillTag[];
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
  source: 'multimedia' | 'adoracion';
}

type ScheduleModalSection = 'miembros' | 'adoracion';
type ChangeLogFilter = 'all' | MinistryChangeLogModule;

const roleLabels: Record<MultimediaRoleSlot, string> = {
  proyeccion: 'Proyeccion',
  luces: 'Luces',
  sonido: 'Sonido',
  transmision: 'Transmision',
};

const roleTag: Record<MultimediaRoleSlot, MultimediaSkillTag> = {
  proyeccion: 'PROYECCION',
  luces: 'LUCES',
  sonido: 'SONIDO',
  transmision: 'TRANSMISION',
};

const availabilityLabel: Record<string, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
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

const inferTags = (value: string): MultimediaSkillTag[] => {
  const source = value.toLowerCase();
  const tags: MultimediaSkillTag[] = [];
  if (source.includes('proye')) tags.push('PROYECCION');
  if (source.includes('luz') || source.includes('ilumin')) tags.push('LUCES');
  if (source.includes('sonido') || source.includes('audio')) tags.push('SONIDO');
  if (source.includes('transm') || source.includes('stream') || source.includes('vivo')) tags.push('TRANSMISION');
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

const emptyDrafts = (): Record<MultimediaRoleSlot, string[]> => ({
  proyeccion: [''],
  luces: [''],
  sonido: [''],
  transmision: [''],
});

const allTagFilters: TagFilter[] = ['TODOS', ...MULTIMEDIA_SKILL_TAGS];

export const MinisterioMultimediaPage = () => {
  const { user } = useAuth();
  const canEdit = canEditManagedModule(user, 'ministerio_multimedia');

  const [refreshKey, setRefreshKey] = useState(0);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('full');
  const [monthRef, setMonthRef] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHour, setSelectedHour] = useState('19:30');
  const [roleDrafts, setRoleDrafts] = useState<Record<MultimediaRoleSlot, string[]>>(emptyDrafts);
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
  const [adoracionSearch, setAdoracionSearch] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentObservation, setEquipmentObservation] = useState('');
  const [editingManualEventId, setEditingManualEventId] = useState<string | null>(null);
  const [showScheduleToast, setShowScheduleToast] = useState(false);
  const [scheduleToastMessage, setScheduleToastMessage] = useState('');
  const [isChangeLogModalOpen, setIsChangeLogModalOpen] = useState(false);
  const [changeLogFilter, setChangeLogFilter] = useState<ChangeLogFilter>('all');

  const responsables = useMemo(() => listModuleResponsibleNames('ministerio_multimedia'), []);
  const shifts = useMemo(() => multimediaMinistryService.listShifts(), []);
  const worshipRehearsals = useMemo(() => worshipMinistryService.listRehearsals(), []);
  const songs = useMemo(() => worshipMinistryService.listSetlistSongs(), []);
  const baseMembers = useMemo(() => multimediaMinistryService.listMembers(), []);
  const brothers = useMemo(() => brothersService.list(), []);
  const talentProfiles = useMemo(() => multimediaTalentService.listProfiles(), [refreshKey]);
  const equipments = useMemo(() => multimediaEquipmentService.list(), [refreshKey]);

  const mergedSchedules = useMemo<MultimediaServiceSchedule[]>(
    () => {
      const rows = multimediaScheduleService.listAll(shifts);
      const grouped = new Map<string, MultimediaServiceSchedule>();

      for (const entry of rows) {
        const key = `${entry.date}|${entry.hour}`;
        const existing = grouped.get(key);

        if (!existing) {
          grouped.set(key, {
            id: entry.id,
            date: entry.date,
            hour: entry.hour,
            proyeccion: [...entry.proyeccion],
            luces: [...entry.luces],
            sonido: [...entry.sonido],
            transmision: [...entry.transmision],
          });
          continue;
        }

        const mergeUnique = (current: string[], next: string[]) => Array.from(new Set([...current, ...next]));
        existing.proyeccion = mergeUnique(existing.proyeccion, entry.proyeccion);
        existing.luces = mergeUnique(existing.luces, entry.luces);
        existing.sonido = mergeUnique(existing.sonido, entry.sonido);
        existing.transmision = mergeUnique(existing.transmision, entry.transmision);
      }

      return Array.from(grouped.values()).sort(byDateTime);
    },
    [shifts, refreshKey]
  );

  const worshipSchedules = useMemo(() => worshipScheduleService.listAll(worshipRehearsals), [worshipRehearsals]);

  const upcomingServices = useMemo(
    () => multimediaScheduleService.listUpcoming(shifts).sort(byDateTime),
    [shifts, refreshKey]
  );

  const allCalendarSchedules = useMemo<CalendarScheduleEntry[]>(() => {
    const multimediaRows: CalendarScheduleEntry[] = mergedSchedules.map((entry) => {
      const relatedWorship =
        worshipSchedules.find((worshipEntry) => worshipEntry.date === entry.date && worshipEntry.hour === entry.hour) ??
        worshipSchedules.find((worshipEntry) => worshipEntry.date === entry.date);

      const worshipMembers = relatedWorship
        ? [
            ...relatedWorship.cantantes.map((name) => ({ name, role: 'Cantante' })),
            ...relatedWorship.guitarristas.map((name) => ({ name, role: 'Guitarrista' })),
            ...relatedWorship.bajistas.map((name) => ({ name, role: 'Bajista' })),
            ...relatedWorship.pianistas.map((name) => ({ name, role: 'Pianista' })),
            ...relatedWorship.bateristas.map((name) => ({ name, role: 'Baterista' })),
          ]
        : [];

      return {
        ...entry,
        source: 'multimedia',
        setlistSongIds: relatedWorship?.setlistSongIds ?? [],
        worshipMembers,
      };
    });

    const multimediaKeySet = new Set(multimediaRows.map((row) => `${row.date}|${row.hour}`));

    const worshipOnlyRows: CalendarScheduleEntry[] = worshipSchedules
      .filter((entry) => !multimediaKeySet.has(`${entry.date}|${entry.hour}`))
      .map((entry) => ({
        id: `adoracion-${entry.id}`,
        date: entry.date,
        hour: entry.hour,
        proyeccion: [],
        luces: [],
        sonido: [],
        transmision: [],
        source: 'adoracion',
        setlistSongIds: entry.setlistSongIds,
        worshipMembers: [
          ...entry.cantantes.map((name) => ({ name, role: 'Cantante' })),
          ...entry.guitarristas.map((name) => ({ name, role: 'Guitarrista' })),
          ...entry.bajistas.map((name) => ({ name, role: 'Bajista' })),
          ...entry.pianistas.map((name) => ({ name, role: 'Pianista' })),
          ...entry.bateristas.map((name) => ({ name, role: 'Baterista' })),
        ],
      }));

    return [...multimediaRows, ...worshipOnlyRows].sort(byDateTime);
  }, [mergedSchedules, worshipSchedules]);

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

  const activeTagged = tagged.filter((entry) => entry.profile.isActiveInMultimedia);

  const memberOptions = useMemo<MemberOption[]>(() => {
    const base: MemberOption[] = baseMembers.map((member) => ({
      id: `min-${member.id}`,
      name: member.name,
      tags: inferTags(`${member.area} ${member.role}`),
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

  const optionsByRole = useMemo<Record<MultimediaRoleSlot, MemberOption[]>>(
    () => ({
      proyeccion: memberOptions.filter((entry) => entry.tags.includes(roleTag.proyeccion)),
      luces: memberOptions.filter((entry) => entry.tags.includes(roleTag.luces)),
      sonido: memberOptions.filter((entry) => entry.tags.includes(roleTag.sonido)),
      transmision: memberOptions.filter((entry) => entry.tags.includes(roleTag.transmision)),
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
        (!hideActiveInTalentModal || !entry.profile.isActiveInMultimedia)
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

  const relatedWorshipSchedule = useMemo(() => {
    const exact = worshipSchedules.find((entry) => entry.date === selectedDate && entry.hour === selectedHour);
    if (exact) {
      return exact;
    }
    return worshipSchedules.find((entry) => entry.date === selectedDate);
  }, [worshipSchedules, selectedDate, selectedHour]);

  const filteredWorshipSongs = useMemo(() => {
    if (!relatedWorshipSchedule) {
      return [];
    }
    const selectedSongs = relatedWorshipSchedule.setlistSongIds
      .map((songId) => songs.find((song) => song.id === songId))
      .filter((song): song is (typeof songs)[number] => Boolean(song));

    const query = normalizeText(adoracionSearch);
    if (!query) {
      return selectedSongs;
    }
    return selectedSongs.filter((song) => normalizeText(`${song.title} ${song.leadBy} ${song.tone}`).includes(query));
  }, [relatedWorshipSchedule, songs, adoracionSearch]);

  const filteredWorshipMembers = useMemo(() => {
    if (!relatedWorshipSchedule) {
      return [];
    }

    const rows = [
      ...relatedWorshipSchedule.cantantes.map((name) => ({ name, role: 'Cantante' })),
      ...relatedWorshipSchedule.guitarristas.map((name) => ({ name, role: 'Guitarrista' })),
      ...relatedWorshipSchedule.bajistas.map((name) => ({ name, role: 'Bajista' })),
      ...relatedWorshipSchedule.pianistas.map((name) => ({ name, role: 'Pianista' })),
      ...relatedWorshipSchedule.bateristas.map((name) => ({ name, role: 'Baterista' })),
    ];

    const query = normalizeText(adoracionSearch);
    if (!query) {
      return rows;
    }
    return rows.filter((row) => normalizeText(`${row.name} ${row.role}`).includes(query));
  }, [relatedWorshipSchedule, adoracionSearch]);

  const selectedDayEvents = useMemo(
    () => allCalendarSchedules.filter((entry) => entry.date === selectedDate).sort(byDateTime),
    [allCalendarSchedules, selectedDate]
  );
  const changeLogs = useMemo(
    () => ministryChangeLogService.list(changeLogFilter === 'all' ? undefined : changeLogFilter),
    [refreshKey, changeLogFilter]
  );

  const updateDraft = (role: MultimediaRoleSlot, index: number, value: string) =>
    setRoleDrafts((previous) => ({
      ...previous,
      [role]: previous[role].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));

  const addDraft = (role: MultimediaRoleSlot) =>
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
      mergedSchedules.some((entry) => entry.date === selectedDate && entry.hour === selectedHour);

    const toName = (id: string) => memberOptions.find((member) => member.id === id)?.name ?? id;
    multimediaScheduleService.upsertManualEntry({
      id: editingManualEventId ?? undefined,
      date: selectedDate,
      hour: selectedHour,
      proyeccion: roleDrafts.proyeccion.filter(Boolean).map(toName),
      luces: roleDrafts.luces.filter(Boolean).map(toName),
      sonido: roleDrafts.sonido.filter(Boolean).map(toName),
      transmision: roleDrafts.transmision.filter(Boolean).map(toName),
    });
    ministryChangeLogService.add({
      module: 'multimedia',
      responsible: user.name,
      change: wasUpdate ? 'Evento actualizado' : 'Evento registrado',
      details: `${formatDateWithWeekday(selectedDate)} - ${selectedHour} hs`,
    });
    setRoleDrafts(emptyDrafts());
    setEditingManualEventId(null);
    setAdoracionSearch('');
    setScheduleModalSection('miembros');
    setScheduleToastMessage(wasUpdate ? 'Evento actualizado.' : 'Evento registrado.');
    setShowScheduleToast(true);
    setIsScheduleModalOpen(false);
    setRefreshKey((previous) => previous + 1);
  };

  const mapNamesToDraft = (role: MultimediaRoleSlot, names: string[]): string[] => {
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
    setEditingManualEventId(
      entry.source === 'multimedia' && entry.id.startsWith('manual-') ? entry.id : null
    );
    setRoleDrafts({
      proyeccion: mapNamesToDraft('proyeccion', entry.proyeccion),
      luces: mapNamesToDraft('luces', entry.luces),
      sonido: mapNamesToDraft('sonido', entry.sonido),
      transmision: mapNamesToDraft('transmision', entry.transmision),
    });
    setScheduleModalSection('miembros');
    setAdoracionSearch('');
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
    setScheduleModalSection('miembros');
    setAdoracionSearch('');
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
      deleteEventConfirmation.source === 'multimedia'
        ? multimediaScheduleService.removeManualEntry(deleteEventConfirmation.id)
        : worshipScheduleService.removeManualEntry(deleteEventConfirmation.id);
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
        const all = [...entry.proyeccion, ...entry.luces, ...entry.sonido, ...entry.transmision];
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
    multimediaTalentService.setActiveMinistryMember(
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
      if (!entry.profile.isActiveInMultimedia) {
        return false;
      }
      return teamTagFilter === 'TODOS' ? true : entry.profile.tags.includes(teamTagFilter);
    });

    for (const row of targetRows) {
      multimediaTalentService.setActiveMinistryMember(row.brother.id, false, user.role);
    }

    setRefreshKey((previous) => previous + 1);
  };

  const addEquipment = () => {
    if (!canEdit) {
      return;
    }
    const name = equipmentName.trim();
    if (!name) {
      return;
    }
    multimediaEquipmentService.add(name, equipmentObservation.trim());
    setEquipmentName('');
    setEquipmentObservation('');
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-[#c5a059] text-xs uppercase tracking-[0.2em] font-black">
            <MonitorPlay size={14} />
            Ministerio multimedia
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
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Calendario y equipo tecnico de culto</h1>
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
              <span className="text-xs uppercase tracking-widest font-black">Setlist de adoracion</span>
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
            <span className="text-xs uppercase tracking-widest font-black">Proximos servicios</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{upcomingServices.length}</p>
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
        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays size={16} className="text-[#c5a059]" />
              Calendario
            </h2>
            <div className="flex gap-2">
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
            <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-700 dark:text-gray-300">
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
                      className={`min-h-[74px] rounded-xl p-2 border text-left ${
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
                            <span className="text-xs font-black">{cell.day}</span>
                            {isToday && (
                              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
                                Hoy
                              </span>
                            )}
                          </div>
                          {count > 0 && <span className="text-[10px] text-[#c5a059] font-black">{count} agendado</span>}
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
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      {entry.source === 'adoracion' ? 'Evento de adoracion' : 'Servicio tecnico multimedia'}
                    </p>
                    {entry.setlistSongIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Setlist: {entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ')}
                      </p>
                    )}
                    {entry.worshipMembers.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Musicos: {entry.worshipMembers.map((member) => `${member.name} (${member.role})`).join(', ')}
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
            daySchedules.map((entry) => {
              const worshipMembers = entry.worshipMembers.map((member) => member.name);

              return (
                <article key={entry.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                  <p className="font-black">{entry.hour} hs</p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                    Proyeccion: {entry.proyeccion.join(', ') || 'Sin asignar'} | Luces: {entry.luces.join(', ') || 'Sin asignar'} |
                    Sonido: {entry.sonido.join(', ') || 'Sin asignar'} | Transmision: {entry.transmision.join(', ') || 'Sin asignar'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                    Setlist: {entry.setlistSongIds.length ? entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ') : 'Sin definir'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Musicos: {worshipMembers.join(', ') || 'Sin asignar'}</p>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Integrantes multimedia</h2>
          <div className="space-y-3">
            {memberOptions.map((member) => (
              <div key={member.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                <BrotherNameTrigger
                  name={member.name}
                  className="font-bold text-slate-900 dark:text-white hover:text-[#c5a059] transition-colors"
                  fallbackClassName="font-bold text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  Habilidades: {member.tags.map((tag) => MULTIMEDIA_SKILL_LABELS[tag]).join(', ') || 'Sin definir'}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Instrumentos y equipos</h2>
          <div className="space-y-3">
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] space-y-2">
              <input
                type="text"
                value={equipmentName}
                onChange={(event) => setEquipmentName(event.target.value)}
                placeholder="Nombre del equipo (ej. consola, cableado, guitarra, camara)"
                disabled={!canEdit}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
              />
              <textarea
                value={equipmentObservation}
                onChange={(event) => setEquipmentObservation(event.target.value)}
                placeholder="Observacion/configuracion (ej. funciona mejor con puerto 14 y cable 15)"
                disabled={!canEdit}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
              />
              <button
                type="button"
                onClick={addEquipment}
                disabled={!canEdit}
                className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-[#c5a059]/40 bg-[#c5a059] text-black disabled:opacity-45"
              >
                Guardar equipo
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
              {equipments.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">Todavia no hay equipos registrados.</p>
              ) : (
                equipments.map((equipment) => (
                  <article key={equipment.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                    <p className="font-black text-slate-900 dark:text-white">{equipment.name}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      {equipment.observation || 'Sin observaciones por ahora.'}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </article>
      </section>

      {!canEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-500">
          <ShieldCheck size={14} />
          Solo los responsables del modulo pueden editar informacion de multimedia.
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
                {tag === 'TODOS' ? 'Todos' : MULTIMEDIA_SKILL_LABELS[tag]}
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
                          {MULTIMEDIA_SKILL_LABELS[tag]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {entry.profile.isActiveInMultimedia ? (
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
                {tag === 'TODOS' ? 'Todos' : MULTIMEDIA_SKILL_LABELS[tag]}
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
                      Fuente: {member.source === 'ministerio' ? 'Ministerio multimedia' : 'Hermanos etiquetados'}
                    </p>
                    {member.availability && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Disponibilidad: {availabilityLabel[member.availability] ?? member.availability}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.tags.map((tag) => (
                        <span key={`${member.id}-${tag}`} className="text-[10px] uppercase px-2 py-1 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 text-[#c5a059]">
                          {MULTIMEDIA_SKILL_LABELS[tag]}
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
                const multimediaMembers = [
                  ...entry.proyeccion.map((name) => `${name} (Proyeccion)`),
                  ...entry.luces.map((name) => `${name} (Luces)`),
                  ...entry.sonido.map((name) => `${name} (Sonido)`),
                  ...entry.transmision.map((name) => `${name} (Transmision)`),
                ];

                const worshipMembers = entry.worshipMembers.map((member) => `${member.name} (${member.role})`);

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
                      {entry.source === 'adoracion' ? 'Evento registrado por adoracion' : 'Evento registrado por multimedia'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      Miembros adoracion: {worshipMembers.join(', ') || 'Sin asignar'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                      Miembros multimedia: {multimediaMembers.join(', ') || 'Sin asignar'}
                    </p>
                    {entry.setlistSongIds.length > 0 && (
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Setlist: {entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ')}
                      </p>
                    )}
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
                selectedScheduleEntries.map((entry) => {
                  const worshipMembers = entry.worshipMembers.map((member) => member.name);

                  return (
                    <article key={entry.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatDateWithWeekday(entry.date)} - {entry.hour} hs
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        Proyeccion: {entry.proyeccion.join(', ') || 'Sin asignar'} | Luces: {entry.luces.join(', ') || 'Sin asignar'} |
                        Sonido: {entry.sonido.join(', ') || 'Sin asignar'} | Transmision: {entry.transmision.join(', ') || 'Sin asignar'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        Setlist: {entry.setlistSongIds.length ? entry.setlistSongIds.map((songId) => setlistById.get(songId)?.title ?? songId).join(', ') : 'Sin definir'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Musicos: {worshipMembers.join(', ') || 'Sin asignar'}</p>
                    </article>
                  );
                })
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
                  {(Object.keys(roleLabels) as MultimediaRoleSlot[]).map((role) => (
                    <div key={role} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 mb-2">
                        {roleLabels[role]}
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
                    value={adoracionSearch}
                    onChange={(event) => setAdoracionSearch(event.target.value)}
                    placeholder="Buscar en canciones o musicos..."
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"
                  />
                  {!relatedWorshipSchedule ? (
                    <p className="text-sm text-slate-500 dark:text-gray-400">
                      No hay informacion de Adoracion cargada para esta fecha.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0 flex-1">
                      <div className="min-h-0 overflow-y-auto pr-1 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Setlist del culto</p>
                        {filteredWorshipSongs.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-gray-400">Sin canciones para ese filtro.</p>
                        ) : (
                          filteredWorshipSongs.map((song) => (
                            <article key={song.id} className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                              <p className="font-black text-slate-900 dark:text-white text-sm">{song.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-gray-500">Tono {song.tone} - {song.leadBy}</p>
                            </article>
                          ))
                        )}
                      </div>
                      <div className="min-h-0 overflow-y-auto pr-1 space-y-2">
                        <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Musicos asignados</p>
                        {filteredWorshipMembers.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-gray-400">Sin musicos para ese filtro.</p>
                        ) : (
                          filteredWorshipMembers.map((member, index) => (
                            <article key={`${member.name}-${member.role}-${index}`} className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                              <BrotherNameTrigger
                                name={member.name}
                                className="font-black text-slate-900 dark:text-white hover:text-[#c5a059] transition-colors text-sm"
                                fallbackClassName="font-black text-slate-900 dark:text-white text-sm"
                              />
                              <p className="text-[11px] text-slate-500 dark:text-gray-500">{member.role}</p>
                            </article>
                          ))
                        )}
                      </div>
                    </div>
                  )}
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

      <Modal isOpen={isSetlistModalOpen} onClose={() => setIsSetlistModalOpen(false)} title="Setlist de adoracion">
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


