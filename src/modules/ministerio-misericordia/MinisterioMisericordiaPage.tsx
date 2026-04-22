
import {
  ArrowLeftRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  History,
  MapPinned,
  Plus,
  Soup,
  Trash2,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { canEditManagedModule, listModuleResponsibleNames } from '../../lib/moduleAccess';
import { brothersService } from '../../services/brothersService';
import { misericordiaBiblicalMessageService } from '../../services/misericordiaBiblicalMessageService';
import { ministryChangeLogService } from '../../services/ministryChangeLogService';
import { misericordiaScheduleService } from '../../services/misericordiaScheduleService';
import {
  MISERICORDIA_SKILL_LABELS,
  MISERICORDIA_SKILL_TAGS,
  MisericordiaSkillTag,
  misericordiaTalentService,
} from '../../services/misericordiaTalentService';
import {
  MisericordiaSupplyMovementType,
  MisericordiaSupplyUnit,
  misericordiaSupplyService,
} from '../../services/misericordiaSupplyService';
import { SanLuisZoneMap, SAN_LUIS_ZONES } from './components/SanLuisZoneMap';
import { misericordiaMinistryService } from './services/misericordiaMinistryService';

type RoleSlot = 'cocina' | 'preparacion' | 'reparto' | 'evangelismo';
type TagFilter = 'TODOS' | MisericordiaSkillTag;
type CalendarMode = 'full' | 'scheduled';

interface MemberOption {
  id: string;
  name: string;
  tags: MisericordiaSkillTag[];
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
}

const roleLabels: Record<RoleSlot, string> = {
  cocina: 'Cocina',
  preparacion: 'Preparacion',
  reparto: 'Reparto',
  evangelismo: 'Evangelismo',
};

const roleTag: Record<RoleSlot, MisericordiaSkillTag> = {
  cocina: 'COCINA',
  preparacion: 'PREPARACION',
  reparto: 'REPARTO',
  evangelismo: 'EVANGELISMO',
};

const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const todayStr = new Date().toISOString().slice(0, 10);

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isDateBeforeToday = (value: string) => value < todayStr;
const toDateStr = (date: Date) => date.toISOString().slice(0, 10);
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const monthLabel = (date: Date) => new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date);
const addMonths = (base: Date, n: number) => new Date(base.getFullYear(), base.getMonth() + n, 1);
const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value);

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(parsed);
};

const formatDateWithWeekday = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return capitalize(new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(parsed));
};

const formatDateTimeForLog = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
};

const formatHourForPrompt = (hour: string) => hour.replace(':', '.');

const formatUpcomingDateTime = (date: string, hour: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return `${date} a las ${formatHourForPrompt(hour)}`;
  const label = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(parsed);
  return `${label} a las ${formatHourForPrompt(hour)}`;
};

const formatSupplyQuantity = (quantity: number, unit: MisericordiaSupplyUnit) =>
  unit === 'KG'
    ? `${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(quantity)} kg`
    : `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(quantity)} un`;

const byDateTime = (a: { date: string; hour: string }, b: { date: string; hour: string }) =>
  new Date(`${a.date}T${a.hour}:00`).getTime() - new Date(`${b.date}T${b.hour}:00`).getTime();

const inferTags = (value: string): MisericordiaSkillTag[] => {
  const source = value.toLowerCase();
  const tags: MisericordiaSkillTag[] = [];
  if (source.includes('cocin')) tags.push('COCINA');
  if (source.includes('prep') || source.includes('armad')) tags.push('PREPARACION');
  if (source.includes('repart') || source.includes('calle')) tags.push('REPARTO');
  if (source.includes('evangel') || source.includes('predic')) tags.push('EVANGELISMO');
  return Array.from(new Set(tags));
};

const buildMonthCells = (monthRef: Date): Array<{ date: string | null; day: number | null }> => {
  const first = new Date(monthRef.getFullYear(), monthRef.getMonth(), 1);
  const last = new Date(monthRef.getFullYear(), monthRef.getMonth() + 1, 0);
  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < first.getDay(); i += 1) cells.push({ date: null, day: null });
  for (let d = 1; d <= last.getDate(); d += 1) cells.push({ date: toDateStr(new Date(monthRef.getFullYear(), monthRef.getMonth(), d)), day: d });
  while (cells.length % 7 !== 0) cells.push({ date: null, day: null });
  return cells;
};

const emptyDrafts = (): Record<RoleSlot, string[]> => ({
  cocina: [''],
  preparacion: [''],
  reparto: [''],
  evangelismo: [''],
});

export const MinisterioMisericordiaPage = () => {
  const { user } = useAuth();
  const canEdit = canEditManagedModule(user, 'ministerio_misericordia');

  const [refreshKey, setRefreshKey] = useState(0);
  const [monthRef, setMonthRef] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedHour, setSelectedHour] = useState('19:30');
  const [roleDrafts, setRoleDrafts] = useState<Record<RoleSlot, string[]>>(emptyDrafts);
  const [mealDraft, setMealDraft] = useState('');
  const [zoneDraft, setZoneDraft] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [editingManualEventId, setEditingManualEventId] = useState<string | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const [conversionConfirmation, setConversionConfirmation] = useState<ConversionConfirmation | null>(null);
  const [deleteEventConfirmation, setDeleteEventConfirmation] = useState<DeleteEventConfirmation | null>(null);

  const [teamFilter, setTeamFilter] = useState<TagFilter>('TODOS');
  const [talentFilter, setTalentFilter] = useState<TagFilter>('TODOS');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('full');
  const [messagesSearch, setMessagesSearch] = useState('');

  const [newMessageTitle, setNewMessageTitle] = useState('');
  const [newVerseReference, setNewVerseReference] = useState('');
  const [newVerseText, setNewVerseText] = useState('');
  const [newMessageNote, setNewMessageNote] = useState('');

  const [supplyName, setSupplyName] = useState('');
  const [supplyQuantity, setSupplyQuantity] = useState('1');
  const [supplyType, setSupplyType] = useState<MisericordiaSupplyMovementType>('NUEVO');
  const [supplyUnit, setSupplyUnit] = useState<MisericordiaSupplyUnit>('UNIDAD');
  const [supplyMeal, setSupplyMeal] = useState('');
  const [supplyObservation, setSupplyObservation] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const responsables = useMemo(() => listModuleResponsibleNames('ministerio_misericordia'), []);
  const brothers = useMemo(() => brothersService.list(), []);
  const baseMembers = useMemo(() => misericordiaMinistryService.listMembers(), []);
  const baseOutreaches = useMemo(() => misericordiaMinistryService.listOutreaches(), []);
  const talentProfiles = useMemo(() => misericordiaTalentService.listProfiles(), [refreshKey]);
  const schedules = useMemo(() => misericordiaScheduleService.listAll(baseOutreaches).sort(byDateTime), [baseOutreaches, refreshKey]);
  const biblicalMessages = useMemo(() => misericordiaBiblicalMessageService.list(), [refreshKey]);
  const supplyMovements = useMemo(() => misericordiaSupplyService.list(), [refreshKey]);

  const memberOptions = useMemo<MemberOption[]>(() => {
    const fromBase = baseMembers.map((member) => ({
      id: `base-${member.id}`,
      name: member.name,
      tags: inferTags(`${member.area} ${member.role}`),
    }));

    const fromTalent = talentProfiles
      .filter((profile) => profile.isActiveInMisericordia)
      .map((profile) => ({ profile, brother: brothers.find((row) => row.id === profile.brotherId) }))
      .filter((row): row is { profile: (typeof talentProfiles)[number]; brother: (typeof brothers)[number] } => Boolean(row.brother))
      .map((row) => ({
        id: `bro-${row.brother.id}`,
        name: row.brother.name,
        tags: row.profile.tags,
      }));

    return [...fromBase, ...fromTalent];
  }, [baseMembers, talentProfiles, brothers]);

  const optionsByRole = useMemo(
    () => ({
      cocina: memberOptions.filter((row) => row.tags.includes(roleTag.cocina)),
      preparacion: memberOptions.filter((row) => row.tags.includes(roleTag.preparacion)),
      reparto: memberOptions.filter((row) => row.tags.includes(roleTag.reparto)),
      evangelismo: memberOptions.filter((row) => row.tags.includes(roleTag.evangelismo)),
    }),
    [memberOptions]
  );

  const activeTeamRows = useMemo(
    () =>
      talentProfiles
        .filter((profile) => profile.isActiveInMisericordia && profile.tags.length > 0)
        .map((profile) => ({ profile, brother: brothers.find((row) => row.id === profile.brotherId) }))
        .filter((row): row is { profile: (typeof talentProfiles)[number]; brother: (typeof brothers)[number] } => Boolean(row.brother))
        .filter((row) => (teamFilter === 'TODOS' ? true : row.profile.tags.includes(teamFilter))),
    [talentProfiles, brothers, teamFilter]
  );

  const detectedTalentRows = useMemo(
    () =>
      talentProfiles
        .filter((profile) => !profile.isActiveInMisericordia && profile.tags.length > 0)
        .map((profile) => ({ profile, brother: brothers.find((row) => row.id === profile.brotherId) }))
        .filter((row): row is { profile: (typeof talentProfiles)[number]; brother: (typeof brothers)[number] } => Boolean(row.brother))
        .filter((row) => (talentFilter === 'TODOS' ? true : row.profile.tags.includes(talentFilter))),
    [talentProfiles, brothers, talentFilter]
  );

  const totalActiveTeamCount = useMemo(
    () =>
      talentProfiles.filter((profile) => profile.isActiveInMisericordia && profile.tags.length > 0).length,
    [talentProfiles]
  );

  const totalDetectedTalentCount = useMemo(
    () =>
      talentProfiles.filter((profile) => !profile.isActiveInMisericordia && profile.tags.length > 0).length,
    [talentProfiles]
  );

  const nextUpcoming = useMemo(
    () =>
      schedules
        .filter((entry) => !isDateBeforeToday(entry.date))
        .sort(byDateTime)[0],
    [schedules]
  );

  const monthSchedules = schedules.filter((entry) => entry.date.startsWith(monthKey(monthRef)));
  const monthScheduledList = monthSchedules.filter((entry) => !isDateBeforeToday(entry.date)).sort(byDateTime);
  const monthScheduleCountByDate = useMemo(
    () =>
      monthSchedules.reduce<Record<string, number>>((accumulator, entry) => {
        accumulator[entry.date] = (accumulator[entry.date] ?? 0) + 1;
        return accumulator;
      }, {}),
    [monthSchedules]
  );
  const selectedDayEvents = schedules.filter((entry) => entry.date === selectedDate).sort(byDateTime);
  const changeLogs = ministryChangeLogService.list('misericordia');
  const cells = buildMonthCells(monthRef);

  const incomingSupplyMovements = useMemo(
    () => supplyMovements.filter((entry) => entry.type === 'NUEVO'),
    [supplyMovements]
  );

  const outgoingSupplyMovements = useMemo(
    () => supplyMovements.filter((entry) => entry.type === 'UTILIZADO'),
    [supplyMovements]
  );

  const availableSupplies = useMemo(() => {
    const bucket = new Map<string, { name: string; unit: MisericordiaSupplyUnit; quantity: number }>();
    for (const movement of supplyMovements) {
      const key = `${normalizeText(movement.name)}|${movement.unit}`;
      const current = bucket.get(key) ?? { name: movement.name, unit: movement.unit, quantity: 0 };
      current.quantity += movement.type === 'NUEVO' ? movement.quantity : -movement.quantity;
      bucket.set(key, current);
    }
    return Array.from(bucket.values())
      .filter((entry) => entry.quantity > 0)
      .sort((a, b) => normalizeText(a.name).localeCompare(normalizeText(b.name), 'es'));
  }, [supplyMovements]);

  const filteredBiblicalMessages = useMemo(() => {
    const query = normalizeText(messagesSearch);
    if (!query) return biblicalMessages;
    return biblicalMessages.filter((entry) =>
      normalizeText(`${entry.title} ${entry.verseReference} ${entry.verseText} ${entry.note ?? ''}`).includes(query)
    );
  }, [biblicalMessages, messagesSearch]);

  const mapNamesToDraft = (role: RoleSlot, names: string[]): string[] => {
    const mapped = names
      .map((name) => optionsByRole[role].find((entry) => normalizeText(entry.name) === normalizeText(name))?.id ?? '')
      .filter(Boolean);
    return mapped.length > 0 ? mapped : [''];
  };

  const updateDraft = (role: RoleSlot, index: number, value: string) =>
    setRoleDrafts((previous) => ({
      ...previous,
      [role]: previous[role].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));

  const addDraft = (role: RoleSlot) =>
    setRoleDrafts((previous) => ({
      ...previous,
      [role]: [...previous[role], ''],
    }));

  const openScheduleModalForEntry = (entry: (typeof schedules)[number]) => {
    setSelectedDate(entry.date);
    setSelectedHour(entry.hour);
    setEditingManualEventId(entry.id.startsWith('manual-') ? entry.id : null);
    setRoleDrafts({
      cocina: mapNamesToDraft('cocina', entry.cocina),
      preparacion: mapNamesToDraft('preparacion', entry.preparacion),
      reparto: mapNamesToDraft('reparto', entry.reparto),
      evangelismo: mapNamesToDraft('evangelismo', entry.evangelismo),
    });
    setMealDraft(entry.comida || '');
    setZoneDraft(entry.zona || '');
    setMessageDraft(entry.mensaje || '');
    const zoneMatch = SAN_LUIS_ZONES.find((zone) => normalizeText(zone.name) === normalizeText(entry.zona));
    setSelectedZoneId(zoneMatch?.id ?? null);
    setIsDayEventsModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  const openNewScheduleForDate = (date: string) => {
    if (isDateBeforeToday(date)) return;
    setSelectedDate(date);
    setSelectedHour('19:30');
    setEditingManualEventId(null);
    setRoleDrafts(emptyDrafts());
    setMealDraft('');
    setZoneDraft('');
    setMessageDraft('');
    setSelectedZoneId(null);
    setIsDayEventsModalOpen(false);
    setIsScheduleModalOpen(true);
  };

  const saveSchedule = () => {
    if (!canEdit) return;
    if (isDateBeforeToday(selectedDate)) {
      setToastMessage('No se pueden registrar eventos en dias pasados.');
      setShowToast(true);
      return;
    }

    const toName = (id: string) => memberOptions.find((member) => member.id === id)?.name ?? id;
    const selectedZone = selectedZoneId ? SAN_LUIS_ZONES.find((zone) => zone.id === selectedZoneId) : undefined;
    const meal = mealDraft.trim();
    const zone = zoneDraft.trim();
    const message = messageDraft.trim();

    misericordiaScheduleService.upsertManualEntry({
      id: editingManualEventId ?? undefined,
      date: selectedDate,
      hour: selectedHour,
      cocina: roleDrafts.cocina.filter(Boolean).map(toName),
      preparacion: roleDrafts.preparacion.filter(Boolean).map(toName),
      reparto: roleDrafts.reparto.filter(Boolean).map(toName),
      evangelismo: roleDrafts.evangelismo.filter(Boolean).map(toName),
      comida: meal,
      zona: zone,
      callesZona: selectedZone?.streets ?? [],
      mensaje: message,
      messageIds: [],
    });

    const scheduleDetailParts = [`${formatDateWithWeekday(selectedDate)} - ${selectedHour} hs`];
    if (meal) scheduleDetailParts.push(meal);
    if (zone) scheduleDetailParts.push(zone);
    if (message) scheduleDetailParts.push('Mensaje cargado');

    ministryChangeLogService.add({
      module: 'misericordia',
      responsible: user.name,
      change: editingManualEventId ? 'Evento actualizado' : 'Evento registrado',
      details: scheduleDetailParts.join(' - '),
    });

    setToastMessage(editingManualEventId ? 'Evento actualizado.' : 'Evento registrado.');
    setShowToast(true);
    setIsScheduleModalOpen(false);
    setRefreshKey((previous) => previous + 1);
  };

  const toggleBrotherTag = (brotherId: string, tag: MisericordiaSkillTag, checked: boolean) => {
    if (!canEdit) return;
    const profile = misericordiaTalentService.getProfile(brotherId);
    const current = profile?.tags ?? [];
    const next = checked ? Array.from(new Set([...current, tag])) : current.filter((entry) => entry !== tag);
    misericordiaTalentService.setTagsForBrother(brotherId, next, user.role);
    setRefreshKey((previous) => previous + 1);
  };

  const listScheduledEventsByBrotherName = (brotherName: string) => {
    const name = normalizeText(brotherName);
    return schedules
      .filter((entry) => {
        const participants = [...entry.cocina, ...entry.preparacion, ...entry.reparto, ...entry.evangelismo];
        return participants.some((participant) => normalizeText(participant) === name);
      })
      .sort(byDateTime)
      .map((entry) => ({ id: entry.id, date: entry.date, hour: entry.hour }));
  };

  const requestActivation = (brotherId: string, brotherName: string) => {
    setConversionConfirmation({
      brotherId,
      brotherName,
      to: 'active',
      scheduledEvents: listScheduledEventsByBrotherName(brotherName),
    });
  };

  const requestTalentConversion = (brotherId: string, brotherName: string) => {
    setConversionConfirmation({
      brotherId,
      brotherName,
      to: 'talent',
      scheduledEvents: listScheduledEventsByBrotherName(brotherName),
    });
  };

  const confirmConversion = () => {
    if (!canEdit || !conversionConfirmation) return;
    misericordiaTalentService.setActiveMinistryMember(
      conversionConfirmation.brotherId,
      conversionConfirmation.to === 'active',
      user.role
    );
    ministryChangeLogService.add({
      module: 'misericordia',
      responsible: user.name,
      change: conversionConfirmation.to === 'active' ? 'Miembro activo' : 'Talento detectado',
      details: conversionConfirmation.brotherName,
    });
    setRefreshKey((previous) => previous + 1);
    setConversionConfirmation(null);
  };

  const transferActiveToTalents = () => {
    if (!canEdit) return;
    const filteredActives = activeTeamRows.filter((row) =>
      teamFilter === 'TODOS' ? true : row.profile.tags.includes(teamFilter)
    );
    for (const row of filteredActives) {
      misericordiaTalentService.setActiveMinistryMember(row.brother.id, false, user.role);
    }
    setRefreshKey((previous) => previous + 1);
  };

  const confirmDeleteEvent = () => {
    if (!deleteEventConfirmation) return;
    const removed = misericordiaScheduleService.removeManualEntry(deleteEventConfirmation.id);
    if (removed) {
      ministryChangeLogService.add({
        module: 'misericordia',
        responsible: user.name,
        change: 'Evento eliminado',
        details: `${formatDateWithWeekday(deleteEventConfirmation.date)} - ${deleteEventConfirmation.hour} hs`,
      });
      setToastMessage('Evento eliminado.');
      setShowToast(true);
      setRefreshKey((previous) => previous + 1);
    }
    setDeleteEventConfirmation(null);
    setIsDayEventsModalOpen(false);
  };

  const addBiblicalMessage = () => {
    if (!newMessageTitle.trim() || !newVerseReference.trim() || !newVerseText.trim()) {
      setToastMessage('Completa titulo, cita y versiculo.');
      setShowToast(true);
      return;
    }
    misericordiaBiblicalMessageService.add({
      title: newMessageTitle,
      verseReference: newVerseReference,
      verseText: newVerseText,
      note: newMessageNote,
    });
    ministryChangeLogService.add({
      module: 'misericordia',
      responsible: user.name,
      change: 'Mensaje biblico registrado',
      details: `${newMessageTitle.trim()} - ${newVerseReference.trim()}`,
    });
    setNewMessageTitle('');
    setNewVerseReference('');
    setNewVerseText('');
    setNewMessageNote('');
    setRefreshKey((previous) => previous + 1);
  };

  const addSupplyMovement = () => {
    if (!supplyName.trim()) {
      setToastMessage('Ingresa el nombre del insumo.');
      setShowToast(true);
      return;
    }

    const quantity = Number(supplyQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setToastMessage('La cantidad debe ser mayor a cero.');
      setShowToast(true);
      return;
    }
    if (supplyUnit === 'UNIDAD' && !Number.isInteger(quantity)) {
      setToastMessage('Para unidad, la cantidad debe ser un numero entero.');
      setShowToast(true);
      return;
    }

    misericordiaSupplyService.addMovement({
      name: supplyName,
      quantity,
      unit: supplyUnit,
      type: supplyType,
      meal: supplyMeal,
      observation: supplyObservation,
    });

    ministryChangeLogService.add({
      module: 'misericordia',
      responsible: user.name,
      change: supplyType === 'NUEVO' ? 'Insumo agregado' : 'Insumo utilizado',
      details: `${supplyName.trim()} x${formatSupplyQuantity(quantity, supplyUnit)}${supplyMeal.trim() ? ` - ${supplyMeal.trim()}` : ''}`,
    });

    setSupplyName('');
    setSupplyQuantity('1');
    setSupplyUnit('UNIDAD');
    setSupplyMeal('');
    setSupplyObservation('');
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[28px] border border-white/10 bg-gradient-to-r from-[#161616] to-[#1f1f1f] px-6 py-7">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.2em] font-black text-[#c5a059]">
              <Soup size={14} />
              Ministerio Misericordia
            </p>
            <h1 className="text-3xl md:text-[42px] leading-tight font-black text-white mt-3">
              Calendario y equipo de salida
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              Gestion de cocina, reparto en calles y predicacion con agenda propia del ministerio.
            </p>
            <p className="text-xs text-slate-400 mt-2">Responsables: {responsables.join(', ')}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c5a059]/40 text-[#c5a059] text-xs uppercase tracking-widest font-black self-start md:self-center"
          >
            <History size={14} />
            Log de cambios
          </button>
        </div>
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
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{totalActiveTeamCount}</p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-[#c5a059]">
            <CalendarClock size={16} />
            <span className="text-xs uppercase tracking-widest font-black">Proxima salida</span>
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white mt-3">
            {nextUpcoming ? formatUpcomingDateTime(nextUpcoming.date, nextUpcoming.hour) : 'Sin agenda'}
          </p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <Soup size={16} />
              <span className="text-xs uppercase tracking-widest font-black">Mensajes</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMessagesModalOpen(true)}
              className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              Ver
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{biblicalMessages.length}</p>
        </article>

        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#c5a059]">
              <UserCheck size={16} />
              <span className="text-xs uppercase tracking-widest font-black">Talentos detectados</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTalentModalOpen(true)}
              className="px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
            >
              Ver
            </button>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{totalDetectedTalentCount}</p>
        </article>
      </section>

      <section>
        <div className="p-4 sm:p-6 rounded-3xl border border-white/15 bg-[#171717]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2">
              <CalendarClock size={15} className="text-[#c5a059]" />
              <p className="text-xl font-black text-white">Calendario</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setCalendarMode('full')}
                className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-widest font-black transition-colors ${
                  calendarMode === 'full' ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#c5a059]' : 'border-white/15 text-slate-300 hover:text-white'
                }`}
              >
                Completo
              </button>
              <button
                type="button"
                onClick={() => setCalendarMode('scheduled')}
                className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-widest font-black transition-colors ${
                  calendarMode === 'scheduled' ? 'border-[#c5a059]/50 bg-[#c5a059]/15 text-[#c5a059]' : 'border-white/15 text-slate-300 hover:text-white'
                }`}
              >
                Solo agendados
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => setMonthRef((prev) => addMonths(prev, -1))} className="p-2 rounded-xl border border-white/10 text-white">
              <ChevronLeft size={16} />
            </button>
            <p className="font-black tracking-[0.22em] uppercase text-white text-sm">{capitalize(monthLabel(monthRef))}</p>
            <button type="button" onClick={() => setMonthRef((prev) => addMonths(prev, 1))} className="p-2 rounded-xl border border-white/10 text-white">
              <ChevronRight size={16} />
            </button>
          </div>
          {calendarMode === 'full' ? (
            <>
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {dayLabels.map((label) => (
                  <p key={label} className="text-center text-[10px] uppercase tracking-widest font-black text-slate-400">
                    {label}
                  </p>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((cell, index) => {
                  if (!cell.date) return <div key={`empty-${index}`} className="h-20" />;
                  const cellDate = cell.date;

                  const scheduledCount = monthScheduleCountByDate[cellDate] ?? 0;
                  const hasEvents = scheduledCount > 0;
                  const isToday = cellDate === todayStr;
                  const isPastNoEvents = !hasEvents && isDateBeforeToday(cellDate);

                  return (
                    <button
                      key={cellDate}
                      type="button"
                      onClick={() => {
                        setSelectedDate(cellDate);
                        if (hasEvents) {
                          setIsDayEventsModalOpen(true);
                          return;
                        }
                        if (!isPastNoEvents) {
                          openNewScheduleForDate(cellDate);
                        }
                      }}
                      className={`min-h-[58px] sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-left transition-colors ${
                        hasEvents
                          ? 'border-[#c5a059]/40 bg-[#c5a059]/12 text-white'
                          : isToday
                            ? 'border-blue-400/35 bg-blue-500/10 text-white'
                            : isPastNoEvents
                              ? 'border-white/10 bg-[#1a1a1a] text-slate-400'
                              : 'border-white/10 bg-[#0c0c0c] text-white hover:border-[#c5a059]/35'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-black text-[11px] sm:text-sm">{cell.day}</p>
                        {isToday && (
                          <span className="hidden sm:inline-flex text-[9px] uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
                            Hoy
                          </span>
                        )}
                      </div>
                      {hasEvents && (
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-[#c5a059] mt-1">
                          {scheduledCount} evt
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {monthScheduledList.length === 0 ? (
                <p className="text-sm text-slate-400">Sin eventos agendados este mes.</p>
              ) : (
                monthScheduledList.map((entry) => (
                  <article
                    key={entry.id}
                    className={`w-full text-left p-3 rounded-xl border ${
                      nextUpcoming?.id === entry.id ? 'border-blue-400/35 bg-blue-500/10' : 'border-white/10 bg-[#0f0f0f]'
                    }`}
                  >
                    <button type="button" onClick={() => openScheduleModalForEntry(entry)} className="w-full text-left">
                      <p className="font-black text-white">
                        {formatDateWithWeekday(entry.date)} - {entry.hour} hs
                      </p>
                    </button>
                    <p className="text-xs text-slate-400 mt-1">Comida: {entry.comida || 'Sin definir'}</p>
                    <p className="text-xs text-slate-400 mt-1">Zona: {entry.zona || 'Sin definir'}</p>
                    {nextUpcoming?.id === entry.id && (
                      <p className="text-[10px] uppercase tracking-widest font-black text-blue-300 mt-1">Proxima salida</p>
                    )}
                    {canEdit && entry.id.startsWith('manual-') && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setDeleteEventConfirmation({ id: entry.id, date: entry.date, hour: entry.hour })}
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
        </div>
      </section>

      <section className="space-y-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Mensajes biblicos y versiculos</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Lista de palabras para compartir en eventos y carga de nuevos versiculos.</p>
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4 mt-4">
            <div className="space-y-2"><input value={newMessageTitle} onChange={(event) => setNewMessageTitle(event.target.value)} placeholder="Titulo del mensaje" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]" /><input value={newVerseReference} onChange={(event) => setNewVerseReference(event.target.value)} placeholder="Cita biblica (Ej: Juan 3:16)" className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]" /><textarea value={newVerseText} onChange={(event) => setNewVerseText(event.target.value)} placeholder="Versiculo" className="w-full min-h-[88px] p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] resize-none" /><textarea value={newMessageNote} onChange={(event) => setNewMessageNote(event.target.value)} placeholder="Nota pastoral (opcional)" className="w-full min-h-[72px] p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] resize-none" /><button type="button" onClick={addBiblicalMessage} className="w-full py-2.5 rounded-xl bg-[#c5a059] text-black font-black text-[10px] uppercase tracking-widest">Guardar versiculo</button></div>
            <div><input value={messagesSearch} onChange={(event) => setMessagesSearch(event.target.value)} placeholder="Buscar por titulo, cita o texto..." className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] mb-3" /><div className="space-y-2 max-h-72 overflow-y-auto pr-1">{filteredBiblicalMessages.map((entry) => <article key={entry.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"><p className="font-black text-slate-900 dark:text-white">{entry.title}</p><p className="text-xs text-[#c5a059] mt-1">{entry.verseReference}</p><p className="text-sm text-slate-700 dark:text-gray-300 mt-1">{entry.verseText}</p>{entry.note && <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{entry.note}</p>}<button type="button" onClick={() => { setMessageDraft(`${entry.title}\n${entry.verseReference}\n${entry.verseText}`); setIsScheduleModalOpen(true); }} className="mt-2 text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Usar en preparativos</button></article>)}</div></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Seguimiento de insumos</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
            Registro de ingresos y egresos por unidad o por kg, con disponibilidad actual.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4 mt-4">
            <div className="space-y-2">
              <input
                value={supplyName}
                onChange={(event) => setSupplyName(event.target.value)}
                placeholder="Insumo"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="number"
                  min={supplyUnit === 'KG' ? 0.1 : 1}
                  step={supplyUnit === 'KG' ? 0.1 : 1}
                  value={supplyQuantity}
                  onChange={(event) => setSupplyQuantity(event.target.value)}
                  placeholder="Cantidad"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
                />
                <select
                  value={supplyUnit}
                  onChange={(event) => setSupplyUnit(event.target.value as MisericordiaSupplyUnit)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
                >
                  <option value="UNIDAD">Unidad</option>
                  <option value="KG">Kg</option>
                </select>
              </div>
              <select
                value={supplyType}
                onChange={(event) => setSupplyType(event.target.value as MisericordiaSupplyMovementType)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
              >
                <option value="NUEVO">Insumo que ingresa</option>
                <option value="UTILIZADO">Insumo que egresa</option>
              </select>
              <input
                value={supplyMeal}
                onChange={(event) => setSupplyMeal(event.target.value)}
                placeholder="Comida asociada (opcional)"
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
              />
              <textarea
                value={supplyObservation}
                onChange={(event) => setSupplyObservation(event.target.value)}
                placeholder="Observacion"
                className="w-full min-h-[76px] p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] resize-none"
              />
              <button
                type="button"
                onClick={addSupplyMovement}
                className="w-full py-2.5 rounded-xl bg-[#c5a059] text-black font-black text-[10px] uppercase tracking-widest"
              >
                Registrar movimiento
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              <article className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-300">Insumos que ingresan</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                  {incomingSupplyMovements.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-gray-400">Sin ingresos registrados.</p>
                  ) : (
                    incomingSupplyMovements.map((entry) => (
                      <article key={entry.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616]">
                        <p className="font-black text-sm text-slate-900 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Cantidad: {formatSupplyQuantity(entry.quantity, entry.unit)}</p>
                        {entry.meal && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Comida: {entry.meal}</p>}
                      </article>
                    ))
                  )}
                </div>
              </article>

              <article className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-amber-600 dark:text-amber-300">Insumos que egresan</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                  {outgoingSupplyMovements.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-gray-400">Sin egresos registrados.</p>
                  ) : (
                    outgoingSupplyMovements.map((entry) => (
                      <article key={entry.id} className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616]">
                        <p className="font-black text-sm text-slate-900 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Cantidad: {formatSupplyQuantity(entry.quantity, entry.unit)}</p>
                        {entry.meal && <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Comida: {entry.meal}</p>}
                      </article>
                    ))
                  )}
                </div>
              </article>

              <article className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Disponibles</p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                  {availableSupplies.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-gray-400">No hay stock disponible.</p>
                  ) : (
                    availableSupplies.map((entry) => (
                      <article key={`${entry.name}-${entry.unit}`} className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161616]">
                        <p className="font-black text-sm text-slate-900 dark:text-white">{entry.name}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Disponible: {formatSupplyQuantity(entry.quantity, entry.unit)}</p>
                      </article>
                    ))
                  )}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <Modal isOpen={isDayEventsModalOpen} onClose={() => setIsDayEventsModalOpen(false)} title={`Eventos del dia (${formatDate(selectedDate)})`}>
        <div className="space-y-3">{selectedDayEvents.length === 0 ? <p className="text-sm text-slate-500 dark:text-gray-400">Sin eventos para este dia.</p> : selectedDayEvents.map((entry) => <article key={entry.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"><button type="button" onClick={() => openScheduleModalForEntry(entry)} className="w-full text-left"><p className="font-black text-slate-900 dark:text-white">{formatDateWithWeekday(entry.date)} - {entry.hour} hs</p><p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Comida: {entry.comida || 'Sin definir'}</p><p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Zona: {entry.zona || 'Sin definir'}</p><p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Mensaje: {entry.mensaje || 'Sin definir'}</p></button>{canEdit && entry.id.startsWith('manual-') && <div className="flex justify-end mt-2"><button type="button" onClick={() => setDeleteEventConfirmation({ id: entry.id, date: entry.date, hour: entry.hour })} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-300/50 bg-rose-500/10 text-rose-300 text-[10px] uppercase tracking-widest font-black"><Trash2 size={12} />Eliminar</button></div>}</article>)}</div>
      </Modal>

      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title={`Agendar salida (${formatDate(selectedDate)})`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><input type="date" value={selectedDate} min={todayStr} onChange={(event) => setSelectedDate(event.target.value)} className="p-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]" /><input type="time" value={selectedHour} onChange={(event) => setSelectedHour(event.target.value)} className="p-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]" /></div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="space-y-3"><p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400">Preparativos</p><div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] space-y-2"><div className="flex items-center gap-2"><Soup size={14} className="text-[#c5a059]" /><input value={mealDraft} onChange={(event) => setMealDraft(event.target.value)} placeholder="Comida que se esta haciendo" className="w-full p-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]" /></div><div className="flex items-center gap-2"><MapPinned size={14} className="text-[#c5a059]" /><input value={zoneDraft} onChange={(event) => setZoneDraft(event.target.value)} placeholder="Zona donde van a repartir" className="w-full p-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]" /></div><SanLuisZoneMap selectedZoneId={selectedZoneId} onSelectZone={(zoneId) => { setSelectedZoneId(zoneId); const zone = SAN_LUIS_ZONES.find((row) => row.id === zoneId); if (zone) setZoneDraft(zone.name); }} /><textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Mensaje que van a compartir" className="w-full min-h-[96px] p-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a] resize-none" /></div></div>
            <div className="space-y-3"><p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 text-right xl:text-left">Miembros</p>{(Object.keys(roleLabels) as RoleSlot[]).map((role) => <div key={role} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"><p className="text-[10px] uppercase tracking-widest font-black mb-2">{roleLabels[role]}</p><div className="space-y-2">{roleDrafts[role].map((value, index) => <select key={`${role}-${index}`} value={value} onChange={(event) => updateDraft(role, index, event.target.value)} className="w-full p-2 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-[#1a1a1a]"><option value="">Seleccionar</option>{optionsByRole[role].map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>)}</div><button type="button" onClick={() => addDraft(role)} className="mt-2 text-[10px] uppercase tracking-widest font-black text-[#c5a059] inline-flex items-center gap-1"><Plus size={11} />Agregar</button></div>)}</div>
          </div>
          <button type="button" onClick={saveSchedule} className="w-full py-3 rounded-xl bg-[#c5a059] text-black font-black text-xs uppercase tracking-widest">Guardar agenda</button>
        </div>
      </Modal>

      <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title="Equipo activo">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={transferActiveToTalents}
              disabled={!canEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/45 bg-[#c5a059]/15 text-[#c5a059] disabled:opacity-60"
            >
              <ArrowLeftRight size={14} />
              transfirir a talentos detectados
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['TODOS', ...MISERICORDIA_SKILL_TAGS] as TagFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTeamFilter(filter)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                  teamFilter === filter
                    ? 'border-[#c5a059]/45 bg-[#c5a059]/15 text-[#c5a059]'
                    : 'border-white/20 text-slate-300'
                }`}
              >
                {filter === 'TODOS' ? 'Todos' : MISERICORDIA_SKILL_LABELS[filter]}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activeTeamRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">Sin miembros activos para este filtro.</p>
            ) : (
              activeTeamRows.map(({ profile, brother }) => (
                <article
                  key={brother.id}
                  className="p-4 rounded-2xl border border-white/10 bg-[#090909]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <BrotherNameTrigger
                        name={brother.name}
                        className="font-black text-white hover:text-[#c5a059]"
                        fallbackClassName="font-black text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Celula: {brother.acompanamiento?.celulaName ?? 'Sin celula'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.tags.map((tag) => (
                          <span
                            key={`${brother.id}-${tag}`}
                            className="text-[10px] uppercase px-2 py-1 rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
                          >
                            {MISERICORDIA_SKILL_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => requestTalentConversion(brother.id, brother.name)}
                      className="px-4 py-2 rounded-xl bg-[#c5a059] text-black text-[10px] uppercase tracking-widest font-black"
                    >
                      Convertir en talento detectado
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isTalentModalOpen} onClose={() => setIsTalentModalOpen(false)} title="Talentos detectados">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={transferActiveToTalents}
              disabled={!canEdit}
              className="inline-flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-widest font-black rounded-full border border-[#c5a059]/45 bg-[#c5a059]/15 text-[#c5a059] disabled:opacity-60"
            >
              <ArrowLeftRight size={14} />
              transfirir miembros activos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['TODOS', ...MISERICORDIA_SKILL_TAGS] as TagFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTalentFilter(filter)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                  talentFilter === filter
                    ? 'border-[#c5a059]/45 bg-[#c5a059]/15 text-[#c5a059]'
                    : 'border-white/20 text-slate-300'
                }`}
              >
                {filter === 'TODOS' ? 'Todos' : MISERICORDIA_SKILL_LABELS[filter]}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {detectedTalentRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">Sin talentos detectados para este filtro.</p>
            ) : (
              detectedTalentRows.map(({ profile, brother }) => (
                <article
                  key={brother.id}
                  className="p-4 rounded-2xl border border-white/10 bg-[#090909]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <BrotherNameTrigger
                        name={brother.name}
                        className="font-black text-white hover:text-[#c5a059]"
                        fallbackClassName="font-black text-white"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Celula: {brother.acompanamiento?.celulaName ?? 'Sin celula'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.tags.map((tag) => (
                          <span
                            key={`${brother.id}-${tag}`}
                            className="text-[10px] uppercase px-2 py-1 rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059]"
                          >
                            {MISERICORDIA_SKILL_LABELS[tag]}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => requestActivation(brother.id, brother.name)}
                      className="px-4 py-2 rounded-xl bg-[#c5a059] text-black text-[10px] uppercase tracking-widest font-black"
                    >
                      Convertir a miembro activo
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isMessagesModalOpen} onClose={() => setIsMessagesModalOpen(false)} title="Mensajes biblicos">
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">{biblicalMessages.map((entry) => <article key={entry.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"><p className="font-black text-slate-900 dark:text-white">{entry.title}</p><p className="text-xs text-[#c5a059] mt-1">{entry.verseReference}</p><p className="text-sm text-slate-700 dark:text-gray-300 mt-1">{entry.verseText}</p>{entry.note && <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{entry.note}</p>}</article>)}</div>
      </Modal>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log de cambios">
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {changeLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No hay cambios registrados en Misericordia.</p>
          ) : (
            changeLogs.map((entry) => (
              <article key={entry.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-xs font-black text-slate-900 dark:text-white">{entry.change}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{entry.details || 'Sin detalle'}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-1">
                  {formatDateTimeForLog(entry.createdAt)} - Responsable: {entry.responsible}
                </p>
              </article>
            ))
          )}
        </div>
      </Modal>

      <Modal isOpen={Boolean(conversionConfirmation)} onClose={() => setConversionConfirmation(null)} title="Confirmar conversion" size="sm">
        {conversionConfirmation && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-gray-200">
              Esta seguro que desea convertir a{' '}
              <span className="font-black">{conversionConfirmation.brotherName}</span> en{' '}
              <span className="font-black">{conversionConfirmation.to === 'active' ? 'miembro activo' : 'talento detectado'}</span>?
            </p>

            {conversionConfirmation.to === 'talent' && conversionConfirmation.scheduledEvents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-gray-300">
                  Este hermano esta registrado en estos eventos
                </p>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {conversionConfirmation.scheduledEvents.map((event) => (
                    <article key={event.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
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

      <Modal isOpen={Boolean(deleteEventConfirmation)} onClose={() => setDeleteEventConfirmation(null)} title="Eliminar evento" size="sm">
        {deleteEventConfirmation && <div className="space-y-4"><p className="text-sm text-slate-700 dark:text-gray-200">Esta seguro que desea eliminar el evento del dia <span className="font-black">{formatDateWithWeekday(deleteEventConfirmation.date)}</span> a las <span className="font-black">{deleteEventConfirmation.hour}</span>?</p><div className="flex justify-end gap-2"><button type="button" onClick={() => setDeleteEventConfirmation(null)} className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-300">No cancelar</button><button type="button" onClick={confirmDeleteEvent} className="px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest border border-rose-300/50 bg-rose-500/10 text-rose-300">Si eliminar</button></div></div>}
      </Modal>

      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
    </div>
  );
};


