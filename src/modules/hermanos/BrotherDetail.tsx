import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Star,
  Camera,
  Edit2,
  Music2
} from 'lucide-react';
import { brothersService } from '../../services/brothersService';
import { photoService } from '../../services/photos/photoService';
import { addObservation, getObservations, Observation, ObservationRole } from '../../services/observationsService';
import { Acompanamiento, Proceso, Role } from '../../types';
import { eddiModuleService } from '../eddi/services/eddiModuleService';
import { seguimientoModuleService } from '../seguimiento/services/seguimientoModuleService';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { MUSICAL_SKILL_LABELS, MUSICAL_SKILL_TAGS, MusicalSkillTag, worshipTalentService } from '../../services/worshipTalentService';
import { MULTIMEDIA_SKILL_LABELS, MULTIMEDIA_SKILL_TAGS, MultimediaSkillTag, multimediaTalentService } from '../../services/multimediaTalentService';
import { MISERICORDIA_SKILL_LABELS, MISERICORDIA_SKILL_TAGS, MisericordiaSkillTag, misericordiaTalentService } from '../../services/misericordiaTalentService';

const CURRENT_USER_ROLE: Role = Role.PASTOR;
const canEditProfile = [Role.APOSTOL, Role.PASTOR, Role.LIDER_CELULA, Role.DISCIPULO].includes(CURRENT_USER_ROLE);

const getCardStyle = (isCurrent: boolean) => {
  if (isCurrent) {
    return 'bg-[#1a1a1a] border-2 border-[#c5a059] shadow-[0_0_30px_rgba(197,160,89,0.15)] relative overflow-hidden ring-1 ring-[#c5a059]/20';
  }
  return 'bg-[#1a1a1a] border border-white/5 opacity-80';
};

const displayDate = (value?: string) => value || 'Pendiente';

const processBadgeLabelMap: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'Hermano nuevo',
  [Proceso.GRUPO]: 'Hermano en consolidacion',
  [Proceso.EXPERIENCIA]: 'Hermano mayor',
  [Proceso.EDDI]: 'Discipulo',
  [Proceso.DISCIPULO]: 'Discipulo',
};

const statusStyle: Record<'APROBADO' | 'REPROBADO' | 'EN_CURSO', string> = {
  APROBADO: 'text-green-400 border-green-500/30 bg-green-500/10',
  REPROBADO: 'text-red-400 border-red-500/30 bg-red-500/10',
  EN_CURSO: 'text-amber-300 border-amber-400/30 bg-amber-500/10'
};

type ObservationDraftByProcess = Record<Proceso, string>;
type ObservationComposerByProcess = Record<Proceso, boolean>;
type ObservationSavingByProcess = Record<Proceso, boolean>;
const EMPTY_OBSERVATIONS: Observation[] = [];

const createProcessRecord = <T,>(factory: () => T): Record<Proceso, T> => ({
  [Proceso.ALTAR]: factory(),
  [Proceso.GRUPO]: factory(),
  [Proceso.EXPERIENCIA]: factory(),
  [Proceso.EDDI]: factory(),
  [Proceso.DISCIPULO]: factory(),
});

const observationRoleBadgeLabel: Record<ObservationRole, string> = {
  Pastor: 'PASTOR',
  Líder: 'LÍDER',
  Discípulo: 'DISCÍPULO',
};

const formatObservationDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const areObservationListsEqual = (left: Observation[] = [], right: Observation[] = []) => {
  if (left === right) {
    return true;
  }
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftEntry = left[index];
    const rightEntry = right[index];
    if (
      leftEntry.id !== rightEntry.id ||
      leftEntry.createdAt !== rightEntry.createdAt ||
      leftEntry.text !== rightEntry.text ||
      leftEntry.author !== rightEntry.author ||
      leftEntry.role !== rightEntry.role ||
      leftEntry.process !== rightEntry.process
    ) {
      return false;
    }
  }

  return true;
};

type AltarTrackingStatus = 'ABIERTO' | 'FINALIZADO' | 'INTERRUMPIDO';
type DiscipuloAltarsFilter = 'TODOS' | 'FINALIZADOS' | 'INTERRUMPIDOS';

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const altarTrackingStatusLabel: Record<AltarTrackingStatus, string> = {
  ABIERTO: 'Abierto',
  FINALIZADO: 'Finalizado',
  INTERRUMPIDO: 'Interrumpido',
};

const altarTrackingStatusStyle: Record<AltarTrackingStatus, string> = {
  ABIERTO: 'text-amber-300 border-amber-400/30 bg-amber-500/10',
  FINALIZADO: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10',
  INTERRUMPIDO: 'text-rose-300 border-rose-400/30 bg-rose-500/10',
};


interface ResponsablesPanelProps {
  acompanamiento: Acompanamiento;
}

const ResponsablesPanel = ({ acompanamiento }: ResponsablesPanelProps) => {
  const rows = [
    { label: 'Célula', value: acompanamiento.celulaName || 'No asignada' },
    { label: 'Líder', value: acompanamiento.liderCelulaName || 'No asignado' },
    { label: 'Discípulo o Hermano Mayor', value: acompanamiento.acompananteName || 'No asignado' }
  ];

  return (
    <aside className="w-full md:w-[320px] bg-black/65 border border-[#c5a059]/30 rounded-3xl p-5 space-y-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Responsables</p>
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 border border-white/5 rounded-xl px-3 py-2 bg-black/30">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">{row.label}</span>
          <span className="text-xs text-gray-200 font-bold text-right">{row.value}</span>
        </div>
      ))}
    </aside>
  );
};

interface StageWrapperProps {
  brotherId: string;
  number: number;
  title: string;
  isCurrent: boolean;
  children: React.ReactNode;
  rightTitle: string;
  rightEntries?: Observation[];
  rightEmpty: string;
  centerClassName?: string;
  isComposerOpen: boolean;
  isSavingObservation: boolean;
  draftValue: string;
  onComposerOpen: () => void;
  onComposerClose: () => void;
  onDraftChange: (value: string) => void;
  onSaveObservation: () => void;
}

const StageWrapperComponent = ({
  number,
  title,
  isCurrent,
  children,
  rightTitle,
  rightEntries,
  rightEmpty,
  centerClassName,
  isComposerOpen,
  isSavingObservation,
  draftValue,
  onComposerOpen,
  onComposerClose,
  onDraftChange,
  onSaveObservation,
}: StageWrapperProps) => (
  <div className={`p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden ${getCardStyle(isCurrent)}`}>
    <div className="w-full min-w-0 flex items-start sm:items-center gap-2 md:gap-3 mb-4 md:mb-5 pb-2 border-b border-white/5">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-gradient-to-br from-black/70 to-black/40 flex items-center justify-center text-[#c5a059] font-black text-2xl sm:text-3xl border border-[#c5a059]/25 shadow-[inset_0_0_16px_rgba(197,160,89,0.12)] shrink-0">
        {number}
      </div>
      <h3 className="flex-1 min-w-0 text-xl sm:text-2xl font-black uppercase tracking-[0.1em] sm:tracking-[0.14em] text-white leading-tight break-words">
        {title}
      </h3>
      <span
        className={`hidden sm:inline-flex text-black text-[10px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg border border-[#c5a059]/30 bg-[#c5a059] shrink-0 ${
          isCurrent ? '' : 'opacity-0 pointer-events-none'
        }`}
      >
        Actual
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] gap-6 md:gap-8 items-stretch">
      <div className={`w-full min-w-0 space-y-5 flex flex-col justify-center ${centerClassName ?? ''}`}>{children}</div>

      <div className="w-full min-w-0 bg-black/60 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 flex flex-col overflow-hidden md:min-h-[240px] shadow-inner">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 text-[#c5a059]">
          <div className="flex items-center gap-3">
            <MessageSquare size={16} />
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">{rightTitle}</span>
          </div>
          <button
            type="button"
            onClick={onComposerOpen}
            className="w-full sm:w-auto text-center text-[10px] uppercase font-black tracking-[0.12em] px-3 py-1.5 rounded-full border border-[#c5a059]/35 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
          >
            Agregar observación
          </button>
        </div>
        {isComposerOpen && (
          <div className="mb-4 p-3 rounded-xl border border-white/10 bg-black/35 space-y-3">
            <textarea
              value={draftValue}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Escribí la observación..."
              className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#c5a059] outline-none min-h-[88px] resize-none shadow-inner"
            />
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={onComposerClose}
                className="w-full sm:w-auto text-center text-[10px] uppercase font-black tracking-[0.12em] px-3 py-1.5 rounded-full border border-white/15 text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveObservation}
                disabled={!draftValue.trim() || isSavingObservation}
                className="w-full sm:w-auto text-center text-[10px] uppercase font-black tracking-[0.12em] px-3 py-1.5 rounded-full border border-[#c5a059]/40 bg-[#c5a059] text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </div>
        )}
        {rightEntries && rightEntries.length > 0 ? (
          <div className="max-h-[230px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="space-y-3">
              {rightEntries.map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-white/10 bg-black/35 p-3.5">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#c5a059] border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-1 rounded-full">
                        {observationRoleBadgeLabel[entry.role]}
                      </span>
                      <span className="text-sm font-semibold text-gray-200 break-words">{entry.author}</span>
                      <span className="w-full sm:w-auto sm:ml-auto text-[11px] text-gray-500 shrink-0">{formatObservationDate(entry.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed break-words">{entry.text}</p>
                  </article>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-40 text-center min-h-[88px] max-h-[210px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">{rightEmpty}</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const StageWrapper = React.memo(
  StageWrapperComponent,
  (previous, next) =>
    previous.brotherId === next.brotherId &&
    previous.number === next.number &&
    previous.title === next.title &&
    previous.isCurrent === next.isCurrent &&
    previous.rightTitle === next.rightTitle &&
    previous.rightEmpty === next.rightEmpty &&
    previous.centerClassName === next.centerClassName &&
    previous.isComposerOpen === next.isComposerOpen &&
    previous.isSavingObservation === next.isSavingObservation &&
    previous.draftValue === next.draftValue &&
    areObservationListsEqual(previous.rightEntries, next.rightEntries)
);

StageWrapper.displayName = 'StageWrapper';

export const BrotherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const canManageServiceTags = [Role.APOSTOL, Role.PASTOR, Role.LIDER_RED_CELULAS, Role.LIDER_CELULA].includes(CURRENT_USER_ROLE);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiscipuloAltarsModalOpen, setIsDiscipuloAltarsModalOpen] = useState(false);
  const [discipuloAltarsFilter, setDiscipuloAltarsFilter] = useState<DiscipuloAltarsFilter>('TODOS');
  const [selectedDiscipuloAltarBrotherId, setSelectedDiscipuloAltarBrotherId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showPhotoToast, setShowPhotoToast] = useState(false);
  const [showServiceTagsToast, setShowServiceTagsToast] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [worshipTagsDraft, setWorshipTagsDraft] = useState<MusicalSkillTag[]>([]);
  const [multimediaTagsDraft, setMultimediaTagsDraft] = useState<MultimediaSkillTag[]>([]);
  const [misericordiaTagsDraft, setMisericordiaTagsDraft] = useState<MisericordiaSkillTag[]>([]);

  const brother = useMemo(() => brothersService.findById(id ?? ''), [id]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationsOwnerId, setObservationsOwnerId] = useState<string | null>(null);
  const [observationDraftByProcess, setObservationDraftByProcess] = useState<ObservationDraftByProcess>(() => createProcessRecord(() => ''));
  const [observationComposerByProcess, setObservationComposerByProcess] = useState<ObservationComposerByProcess>(() => createProcessRecord(() => false));
  const [observationSavingByProcess, setObservationSavingByProcess] = useState<ObservationSavingByProcess>(() => createProcessRecord(() => false));
  const observationSavingLockRef = useRef<ObservationSavingByProcess>(createProcessRecord(() => false));

  useEffect(() => {
    return () => {
      if (selectedPhotoUrl) {
        photoService.revokePreviewUrl(selectedPhotoUrl);
      }
    };
  }, [selectedPhotoUrl]);

  useEffect(() => {
    if (!brother) {
      setWorshipTagsDraft([]);
      setMultimediaTagsDraft([]);
      setMisericordiaTagsDraft([]);
      return;
    }

    setWorshipTagsDraft(worshipTalentService.getTagsForBrother(brother.id));
    setMultimediaTagsDraft(multimediaTalentService.getTagsForBrother(brother.id));
    setMisericordiaTagsDraft(misericordiaTalentService.getTagsForBrother(brother.id));
  }, [brother]);

  useEffect(() => {
    let isMounted = true;

    setIsEditModalOpen(false);
    setIsDiscipuloAltarsModalOpen(false);
    setDiscipuloAltarsFilter('TODOS');
    setSelectedDiscipuloAltarBrotherId(null);
    setShowToast(false);
    setShowPhotoToast(false);
    setShowServiceTagsToast(false);
    setSelectedPhotoUrl((previous) => {
      if (previous) {
        photoService.revokePreviewUrl(previous);
      }
      return null;
    });
    setObservationDraftByProcess(createProcessRecord(() => ''));
    setObservationComposerByProcess(createProcessRecord(() => false));
    setObservationSavingByProcess(createProcessRecord(() => false));
    observationSavingLockRef.current = createProcessRecord(() => false);

    if (!id) {
      setObservations([]);
      setObservationsOwnerId(null);
      return () => {
        isMounted = false;
      };
    }

    const loadObservations = async () => {
      try {
        const remoteObservations = await getObservations(id);
        if (!isMounted) {
          return;
        }
        setObservations(remoteObservations);
        setObservationsOwnerId(id);
      } catch {
        // Mantener las observaciones reales actuales visibles mientras falla/reintenta.
      }
    };

    void loadObservations();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!brother) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl text-slate-900 dark:text-white font-bold">Hermano no encontrado</h2>
          <button onClick={() => navigate('/hermanos')} className="text-[#c5a059] hover:underline font-bold">
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const { acompanamiento } = brother;
  const procesoActual = seguimientoModuleService.getCurrentProcess(brother.id) ?? brother.procesoActual;
  const eddiTracking = useMemo(() => eddiModuleService.getBrotherEddiTracking(brother.id), [brother.id]);
  const captureAttributes = photoService.getInputCaptureAttributes();
  const profilePhotoUrl = selectedPhotoUrl ?? brother.fotoUrl;
  const observationRoleByUserRole: Record<Role, ObservationRole> = {
    [Role.APOSTOL]: 'Pastor',
    [Role.PASTOR]: 'Pastor',
    [Role.LIDER_RED_CELULAS]: 'Pastor',
    [Role.LIDER_CELULA]: 'Líder',
    [Role.DISCIPULO]: 'Discípulo',
    [Role.HERMANO_MAYOR]: 'Discípulo',
    [Role.HERMANO_NUEVO]: 'Discípulo',
  };
  const observationAuthorByRole: Record<ObservationRole, string> = {
    Pastor: 'Pastor Carlos',
    Líder: 'Líder Marcos',
    Discípulo: 'Discípulo Juan',
  };
  const observationRole = observationRoleByUserRole[CURRENT_USER_ROLE];
  const observationAuthor = observationAuthorByRole[observationRole];
  const selectedServiceTags = {
    worship: worshipTagsDraft.map((tag) => MUSICAL_SKILL_LABELS[tag]),
    multimedia: multimediaTagsDraft.map((tag) => MULTIMEDIA_SKILL_LABELS[tag]),
    misericordia: misericordiaTagsDraft.map((tag) => MISERICORDIA_SKILL_LABELS[tag]),
  };
  const hasWorshipServiceTags = selectedServiceTags.worship.length > 0;
  const hasMultimediaServiceTags = selectedServiceTags.multimedia.length > 0;
  const hasMisericordiaServiceTags = selectedServiceTags.misericordia.length > 0;
  const hasAnyServiceTags = hasWorshipServiceTags || hasMultimediaServiceTags || hasMisericordiaServiceTags;

  const toggleWorshipTag = (tag: MusicalSkillTag) => {
    if (!canManageServiceTags) return;
    setWorshipTagsDraft((previous) =>
      previous.includes(tag) ? previous.filter((entry) => entry !== tag) : [...previous, tag]
    );
  };

  const toggleMultimediaTag = (tag: MultimediaSkillTag) => {
    if (!canManageServiceTags) return;
    setMultimediaTagsDraft((previous) =>
      previous.includes(tag) ? previous.filter((entry) => entry !== tag) : [...previous, tag]
    );
  };

  const toggleMisericordiaTag = (tag: MisericordiaSkillTag) => {
    if (!canManageServiceTags) return;
    setMisericordiaTagsDraft((previous) =>
      previous.includes(tag) ? previous.filter((entry) => entry !== tag) : [...previous, tag]
    );
  };

  const saveServiceTags = () => {
    if (!canManageServiceTags) return;

    worshipTalentService.setTagsForBrother(brother.id, worshipTagsDraft, CURRENT_USER_ROLE);
    multimediaTalentService.setTagsForBrother(brother.id, multimediaTagsDraft, CURRENT_USER_ROLE);
    misericordiaTalentService.setTagsForBrother(brother.id, misericordiaTagsDraft, CURRENT_USER_ROLE);
    setShowServiceTagsToast(true);
  };

  const disciplesAltarBrothers = useMemo(() => {
    const discipleName = normalizeName(brother.name);
    return brothersService.list().filter((entry) =>
      (entry.altar?.realizadoPor ?? []).some((responsable) => normalizeName(responsable) === discipleName)
    );
  }, [brother.name]);

  const getAltarTrackingStatus = (entry: (typeof disciplesAltarBrothers)[number]): AltarTrackingStatus => {
    if (entry.altar?.fechaFin) {
      return 'FINALIZADO';
    }
    if (entry.procesoActual === Proceso.ALTAR) {
      return 'ABIERTO';
    }
    return 'INTERRUMPIDO';
  };

  const altarTrackingSummary = useMemo(() => {
    const finalized = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'FINALIZADO').length;
    const interrupted = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'INTERRUMPIDO').length;

    return {
      opened: disciplesAltarBrothers.length,
      finalized,
      interrupted,
    };
  }, [disciplesAltarBrothers]);

  const filteredDisciplesAltarBrothers = useMemo(() => {
    if (discipuloAltarsFilter === 'FINALIZADOS') {
      return disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'FINALIZADO');
    }
    if (discipuloAltarsFilter === 'INTERRUMPIDOS') {
      return disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'INTERRUMPIDO');
    }
    return disciplesAltarBrothers;
  }, [disciplesAltarBrothers, discipuloAltarsFilter]);

  const selectedDiscipuloAltarBrother = useMemo(
    () => disciplesAltarBrothers.find((entry) => entry.id === selectedDiscipuloAltarBrotherId),
    [disciplesAltarBrothers, selectedDiscipuloAltarBrotherId]
  );

  const selectedBrotherProcessSummary = useMemo(() => {
    if (!selectedDiscipuloAltarBrother) {
      return [];
    }

    const processEntries = [
      {
        key: Proceso.ALTAR,
        label: 'Altar',
        startDate: selectedDiscipuloAltarBrother.altar?.fechaInicio,
        endDate: selectedDiscipuloAltarBrother.altar?.fechaFin,
        observations: selectedDiscipuloAltarBrother.altar?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.GRUPO,
        label: 'Grupo',
        startDate: selectedDiscipuloAltarBrother.grupo?.fechaInicio,
        endDate: selectedDiscipuloAltarBrother.grupo?.fechaFin,
        observations: selectedDiscipuloAltarBrother.grupo?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EXPERIENCIA,
        label: 'Experiencia',
        startDate: selectedDiscipuloAltarBrother.experiencia?.fechaRealizacion,
        endDate: selectedDiscipuloAltarBrother.experiencia?.fechaRealizacion,
        observations: selectedDiscipuloAltarBrother.experiencia?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EDDI,
        label: 'EDDI',
        startDate: selectedDiscipuloAltarBrother.eddi?.fechaInicio,
        endDate: selectedDiscipuloAltarBrother.eddi?.fechaFin,
        observations: selectedDiscipuloAltarBrother.eddi?.observaciones ?? [],
        grades: selectedDiscipuloAltarBrother.eddi?.notasExamenes ?? [],
      },
      {
        key: Proceso.DISCIPULO,
        label: 'Discipulo',
        startDate: selectedDiscipuloAltarBrother.discipulo?.fechaInicio,
        endDate: undefined,
        observations: selectedDiscipuloAltarBrother.discipulo?.observaciones ?? [],
        grades: [],
      },
    ];

    return processEntries.filter((entry) => Boolean(entry.startDate || entry.endDate));
  }, [selectedDiscipuloAltarBrother]);

  const openObservationComposer = (process: Proceso) => {
    setObservationComposerByProcess(() => ({
      [Proceso.ALTAR]: process === Proceso.ALTAR,
      [Proceso.GRUPO]: process === Proceso.GRUPO,
      [Proceso.EXPERIENCIA]: process === Proceso.EXPERIENCIA,
      [Proceso.EDDI]: process === Proceso.EDDI,
      [Proceso.DISCIPULO]: process === Proceso.DISCIPULO,
    }));
  };

  const closeObservationComposer = (process: Proceso) => {
    setObservationComposerByProcess((previous) => ({
      ...previous,
      [process]: false,
    }));
  };

  const updateObservationDraft = (process: Proceso, value: string) => {
    setObservationDraftByProcess((previous) => ({
      ...previous,
      [process]: value,
    }));
  };

  const visibleObservations = useMemo(
    () => (observationsOwnerId === id ? observations : EMPTY_OBSERVATIONS),
    [id, observations, observationsOwnerId]
  );

  const observationsByProcess = useMemo<Record<Proceso, Observation[]>>(
    () => ({
      [Proceso.ALTAR]: visibleObservations
        .filter((obs) => obs.process === Proceso.ALTAR)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      [Proceso.GRUPO]: visibleObservations
        .filter((obs) => obs.process === Proceso.GRUPO)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      [Proceso.EXPERIENCIA]: visibleObservations
        .filter((obs) => obs.process === Proceso.EXPERIENCIA)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      [Proceso.EDDI]: visibleObservations
        .filter((obs) => obs.process === Proceso.EDDI)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      [Proceso.DISCIPULO]: visibleObservations
        .filter((obs) => obs.process === Proceso.DISCIPULO)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }),
    [visibleObservations]
  );

  const saveObservation = async (process: Proceso) => {
    if (observationSavingLockRef.current[process]) {
      return;
    }

    const text = observationDraftByProcess[process].trim();
    if (!text || !id) {
      return;
    }

    observationSavingLockRef.current[process] = true;
    setObservationSavingByProcess((previous) => ({
      ...previous,
      [process]: true,
    }));

    const newObservation: Observation = {
      id: `${process}-${Date.now()}`,
      brotherId: id,
      text,
      author: observationAuthor,
      role: observationRole,
      createdAt: new Date().toISOString(),
      process,
    };

    try {
      const savedObservation = await addObservation(id, newObservation);
      setObservations((previous) => {
        const normalizedSavedObservation: Observation = {
          ...newObservation,
          ...savedObservation,
          process: savedObservation.process ?? process,
          brotherId: savedObservation.brotherId ?? id,
        };
        const alreadyExists = previous.some((entry) =>
          entry.id === normalizedSavedObservation.id ||
          (
            entry.process === normalizedSavedObservation.process &&
            entry.author === normalizedSavedObservation.author &&
            entry.text === normalizedSavedObservation.text &&
            entry.createdAt === normalizedSavedObservation.createdAt
          )
        );
        if (alreadyExists) {
          return previous;
        }
        return [...previous, normalizedSavedObservation].sort(
          (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        );
      });
      setObservationsOwnerId(id);
      setObservationDraftByProcess((previous) => ({
        ...previous,
        [process]: '',
      }));
      setObservationComposerByProcess((previous) => ({
        ...previous,
        [process]: false,
      }));
    } catch {
      return;
    } finally {
      observationSavingLockRef.current[process] = false;
      setObservationSavingByProcess((previous) => ({
        ...previous,
        [process]: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pb-20 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-8 space-y-10">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 bg-[#1a1a1a] p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden mt-4 md:mt-6">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <ShieldCheck size={200} className="text-[#c5a059]" />
          </div>

          <button
            onClick={() => navigate('/hermanos')}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 p-3 sm:p-4 bg-black/40 rounded-2xl text-gray-400 hover:text-[#c5a059] transition-all border border-white/5 active:scale-95 z-20"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>

          <div className="relative z-10 mt-14 md:mt-0 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 lg:gap-10 items-start">
            <div className="min-w-0 space-y-8">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                <div
                  className="relative group cursor-pointer z-10 shrink-0 mx-auto md:mx-0"
                  onClick={() => photoInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      photoInputRef.current?.click();
                    }
                  }}
                >
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-br from-[#c5a059]/20 to-transparent flex items-center justify-center text-[#c5a059] font-black text-6xl sm:text-7xl shadow-[0_0_50px_rgba(197,160,89,0.2)] overflow-hidden border-2 border-[#c5a059]/30 relative transition-transform duration-500 group-hover:scale-[1.02]">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt={brother.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="drop-shadow-lg">{brother.name.charAt(0)}</span>
                    )}

                    <div className="absolute inset-0 pointer-events-none bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#c5a059]/20 flex items-center justify-center">
                        <Camera className="text-[#c5a059]" size={28} />
                      </div>
                      <span className="text-[10px] uppercase font-black text-[#c5a059] tracking-widest">Cambiar Foto</span>
                    </div>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept={captureAttributes.accept}
                    capture={captureAttributes.capture}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      const previewUrl = photoService.createPreviewUrl(file);
                      setSelectedPhotoUrl((previous) => {
                        if (previous) {
                          photoService.revokePreviewUrl(previous);
                        }
                        return previewUrl;
                      });
                      setShowPhotoToast(true);
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 sm:gap-3 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#c5a059]">Ficha Pastoral</span>
                    <div className="hidden sm:block h-[1px] w-12 bg-[#c5a059]/30" />
                    <span className="bg-[#c5a059] text-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-black shadow-lg">
                      {processBadgeLabelMap[brother.procesoActual]}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#c5a059] uppercase mb-6 md:mb-0 break-words" style={{ textShadow: '0 4px 20px rgba(197,160,89,0.3)' }}>
                    {brother.name}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full items-stretch">
                <div className="flex items-stretch gap-3 sm:gap-4 bg-black/60 p-4 sm:p-5 rounded-2xl border border-white/5 min-h-[100px] sm:min-h-[110px] shadow-inner w-full min-w-0">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <Users className="text-[#c5a059]" size={20} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-500 mb-1">Discípulo o Hermano Mayor</p>
                    <p className="font-bold text-sm text-gray-200 break-words">{acompanamiento.acompananteName || 'No asignado'}</p>
                  </div>
                </div>

                <div className="flex items-stretch gap-3 sm:gap-4 bg-black/60 p-4 sm:p-5 rounded-2xl border border-white/5 min-h-[100px] sm:min-h-[110px] shadow-inner w-full min-w-0">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <MapPin className="text-[#c5a059]" size={20} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-gray-500 mb-1">Líder / Célula</p>
                    <p className="font-bold text-sm text-gray-200 break-words">{acompanamiento.liderCelulaName || 'No asignada'}</p>
                    <p className="text-[10px] font-black text-[#c5a059] mt-0.5">{acompanamiento.celulaName}</p>
                  </div>
                </div>
              </div>

              <div className="w-full lg:hidden mt-1">
                <ResponsablesPanel acompanamiento={acompanamiento} />
              </div>

              {canEditProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="lg:hidden w-full sm:w-auto sm:min-w-[220px] bg-gradient-to-r from-[#c5a059]/10 to-transparent text-[#c5a059] hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/30 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Edit2 size={16} />
                  <span>Editar Ficha</span>
                </button>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-6">
              <ResponsablesPanel acompanamiento={acompanamiento} />
              {canEditProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full bg-gradient-to-r from-[#c5a059]/10 to-transparent text-[#c5a059] hover:bg-[#c5a059] hover:text-black border border-[#c5a059]/30 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                >
                  <Edit2 size={16} />
                  <span>Editar Ficha</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="space-y-8 pt-4">
          <section className="bg-[#1a1a1a] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-4 sm:p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black uppercase tracking-[0.12em] text-white flex items-center gap-2">
                  <Music2 size={16} className="text-[#c5a059]" />
                  Talentos y dones de servicio
                </h2>
              </div>
            </div>

            <div className="space-y-4 mt-5">
              {hasWorshipServiceTags && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] mb-2">Adoracion</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceTags.worship.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasMultimediaServiceTags && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] mb-2">Multimedia</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceTags.multimedia.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasMisericordiaServiceTags && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] mb-2">Misericordia</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceTags.misericordia.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!hasAnyServiceTags && (
                <p className="text-xs text-gray-500">No tiene talentos o dones registrados.</p>
              )}
            </div>
          </section>

          <div className="flex items-center gap-6 px-2">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Línea de Vida</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#c5a059]/30 to-transparent" />
          </div>

          <div className="flex flex-col gap-6">
            <StageWrapper
              brotherId={id ?? ''}
              number={1}
              title="Altar"
              isCurrent={procesoActual === Proceso.ALTAR}
              rightTitle="Observaciones"
              rightEntries={observationsByProcess[Proceso.ALTAR]}
              rightEmpty="Sin observaciones en esta etapa."
              isComposerOpen={observationComposerByProcess[Proceso.ALTAR]}
              isSavingObservation={observationSavingByProcess[Proceso.ALTAR]}
              draftValue={observationDraftByProcess[Proceso.ALTAR]}
              onComposerOpen={() => openObservationComposer(Proceso.ALTAR)}
              onComposerClose={() => closeObservationComposer(Proceso.ALTAR)}
              onDraftChange={(value) => updateObservationDraft(Proceso.ALTAR, value)}
              onSaveObservation={() => saveObservation(Proceso.ALTAR)}
            >
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Inicio</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(brother.altar?.fechaInicio)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Fin</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(brother.altar?.fechaFin)}</p>
                </div>
              </div>
              <div className="bg-gradient-to-r from-black/80 to-black/20 w-full md:w-max px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-inner">
                <span className="text-[9px] uppercase tracking-widest font-black text-gray-500">Realizado por:</span>
                <span className="text-xs font-black text-[#c5a059] bg-[#c5a059]/10 px-3 py-1 rounded-lg">{brother.altar?.realizadoPor?.join(' · ') || 'No registrado'}</span>
              </div>
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={2}
              title="Grupo de Célula"
              isCurrent={procesoActual === Proceso.GRUPO}
              rightTitle="Observaciones"
              rightEntries={observationsByProcess[Proceso.GRUPO]}
              rightEmpty="Sin observaciones añadidas."
              isComposerOpen={observationComposerByProcess[Proceso.GRUPO]}
              isSavingObservation={observationSavingByProcess[Proceso.GRUPO]}
              draftValue={observationDraftByProcess[Proceso.GRUPO]}
              onComposerOpen={() => openObservationComposer(Proceso.GRUPO)}
              onComposerClose={() => closeObservationComposer(Proceso.GRUPO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.GRUPO, value)}
              onSaveObservation={() => saveObservation(Proceso.GRUPO)}
            >
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Inicio</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(brother.grupo?.fechaInicio)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Fin</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(brother.grupo?.fechaFin)}</p>
                </div>
              </div>
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={3}
              title="Experiencia Transformadora"
              isCurrent={procesoActual === Proceso.EXPERIENCIA}
              rightTitle="Observaciones"
              rightEntries={observationsByProcess[Proceso.EXPERIENCIA]}
              rightEmpty="Sin registro de experiencia."
              isComposerOpen={observationComposerByProcess[Proceso.EXPERIENCIA]}
              isSavingObservation={observationSavingByProcess[Proceso.EXPERIENCIA]}
              draftValue={observationDraftByProcess[Proceso.EXPERIENCIA]}
              onComposerOpen={() => openObservationComposer(Proceso.EXPERIENCIA)}
              onComposerClose={() => closeObservationComposer(Proceso.EXPERIENCIA)}
              onDraftChange={(value) => updateObservationDraft(Proceso.EXPERIENCIA, value)}
              onSaveObservation={() => saveObservation(Proceso.EXPERIENCIA)}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2 mb-2">
                  <Calendar size={14} /> Fecha de realización
                </span>
                <p className="text-sm font-bold text-gray-200 bg-black/55 px-5 py-3 rounded-xl inline-flex border border-[#c5a059]/25 shadow-inner">
                  {displayDate(brother.experiencia?.fechaRealizacion)}
                </p>
              </div>
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={4}
              title="EDDI"
              isCurrent={procesoActual === Proceso.EDDI}
              rightTitle="Observaciones EDDI"
              rightEntries={observationsByProcess[Proceso.EDDI]}
              rightEmpty="Sin observaciones del tutor."
              centerClassName="space-y-6"
              isComposerOpen={observationComposerByProcess[Proceso.EDDI]}
              isSavingObservation={observationSavingByProcess[Proceso.EDDI]}
              draftValue={observationDraftByProcess[Proceso.EDDI]}
              onComposerOpen={() => openObservationComposer(Proceso.EDDI)}
              onComposerClose={() => closeObservationComposer(Proceso.EDDI)}
              onDraftChange={(value) => updateObservationDraft(Proceso.EDDI, value)}
              onSaveObservation={() => saveObservation(Proceso.EDDI)}
            >
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Fecha Inicio</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(eddiTracking.stageDates.startDate)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Fecha Fin</span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-white/10 shadow-inner">{displayDate(eddiTracking.stageDates.endDate)}</p>
                </div>
              </div>

              <div className="space-y-3 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2">
                  <BookOpen size={14} /> Tabla de Notas EDDI
                </span>

                {eddiTracking.grades.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 w-full max-h-[260px] [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="min-w-[620px] text-xs sm:text-sm">
                      <thead className="bg-black/70 sticky top-0 z-[1]">
                        <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                          <th className="text-left px-4 py-3">Materia</th>
                          <th className="text-left px-4 py-3">Módulo</th>
                          <th className="text-left px-4 py-3">Fecha</th>
                          <th className="text-left px-4 py-3">Nota</th>
                          <th className="text-left px-4 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eddiTracking.grades.map((grade) => {
                          const status = grade.resolvedStatus;
                          return (
                            <tr key={grade.id} className="border-t border-white/5 bg-black/20">
                              <td className="px-4 py-3 text-gray-200 font-semibold">{grade.materia}</td>
                              <td className="px-4 py-3 text-gray-400">{grade.modulo || '-'}</td>
                              <td className="px-4 py-3 text-gray-400">{grade.fecha || '-'}</td>
                              <td className="px-4 py-3 text-white font-black">{grade.nota}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] px-2 py-1 rounded-md border font-black tracking-wider ${statusStyle[status]}`}>{status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-widest bg-black/30 w-fit px-4 py-2 rounded-lg">
                    Aún no hay calificaciones cargadas
                  </p>
                )}
              </div>
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={5}
              title="Discípulo"
              isCurrent={procesoActual === Proceso.DISCIPULO}
              rightTitle="Observaciones"
              rightEntries={observationsByProcess[Proceso.DISCIPULO]}
              rightEmpty="El proceso culminante espera."
              isComposerOpen={observationComposerByProcess[Proceso.DISCIPULO]}
              isSavingObservation={observationSavingByProcess[Proceso.DISCIPULO]}
              draftValue={observationDraftByProcess[Proceso.DISCIPULO]}
              onComposerOpen={() => openObservationComposer(Proceso.DISCIPULO)}
              onComposerClose={() => closeObservationComposer(Proceso.DISCIPULO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.DISCIPULO, value)}
              onSaveObservation={() => saveObservation(Proceso.DISCIPULO)}
            >
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2 mb-2">
                    <Award size={14} /> Fecha Inicio
                  </span>
                  <p className="text-sm font-bold text-gray-200 bg-black/55 px-5 py-3 rounded-xl inline-flex border border-[#c5a059]/25 shadow-inner">
                    {displayDate(brother.discipulo?.fechaInicio)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">
                      Seguimiento de altares
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscipuloAltarsFilter('TODOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
                    >
                      Ver
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/45 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Altares abiertos</p>
                      <p className="text-2xl font-black text-[#c5a059] mt-2">{altarTrackingSummary.opened}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/45 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Altares finalizados</p>
                      <p className="text-2xl font-black text-emerald-300 mt-2">{altarTrackingSummary.finalized}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/45 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Altares interrumpidos</p>
                      <p className="text-2xl font-black text-rose-300 mt-2">{altarTrackingSummary.interrupted}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StageWrapper>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isDiscipuloAltarsModalOpen}
        onClose={() => {
          setIsDiscipuloAltarsModalOpen(false);
          setDiscipuloAltarsFilter('TODOS');
          setSelectedDiscipuloAltarBrotherId(null);
        }}
        title={
          selectedDiscipuloAltarBrother
            ? `Ficha de ${selectedDiscipuloAltarBrother.name}`
            : `Altares abiertos por ${brother.name}`
        }
      >
        {selectedDiscipuloAltarBrother ? (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setSelectedDiscipuloAltarBrotherId(null)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black border border-white/15 text-gray-300 hover:text-white hover:border-[#c5a059]/40 transition-colors"
            >
              <ArrowLeft size={14} />
              Volver a lista
            </button>

            <div className="rounded-2xl border border-white/10 bg-black/45 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#c5a059]/30 bg-black/50 flex items-center justify-center text-2xl font-black text-[#c5a059] shrink-0">
                {selectedDiscipuloAltarBrother.fotoUrl ? (
                  <img
                    src={selectedDiscipuloAltarBrother.fotoUrl}
                    alt={selectedDiscipuloAltarBrother.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedDiscipuloAltarBrother.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-black text-white break-words">{selectedDiscipuloAltarBrother.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Célula: {selectedDiscipuloAltarBrother.acompanamiento.celulaName} · Proceso actual:{' '}
                  {processBadgeLabelMap[selectedDiscipuloAltarBrother.procesoActual]}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Discípulo/Hermano mayor: {selectedDiscipuloAltarBrother.acompanamiento.acompananteName || 'No asignado'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Líder: {selectedDiscipuloAltarBrother.acompanamiento.liderCelulaName || 'No asignado'}
                </p>
              </div>
              <span
                className={`self-start sm:self-auto text-[10px] px-3 py-1.5 rounded-full border font-black tracking-wider ${altarTrackingStatusStyle[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}`}
              >
                {altarTrackingStatusLabel[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}
              </span>
            </div>

            <div className="flex justify-stretch sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDiscipuloAltarsModalOpen(false);
                  setSelectedDiscipuloAltarBrotherId(null);
                  navigate(`/hermanos/${selectedDiscipuloAltarBrother.id}`);
                }}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/35 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
              >
                Ver ficha completa
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Procesos realizados</p>
              {selectedBrotherProcessSummary.length === 0 ? (
                <p className="text-sm text-gray-400">Este hermano no tiene procesos registrados.</p>
              ) : (
                <div className="space-y-3">
                  {selectedBrotherProcessSummary.map((processEntry) => (
                    <article key={processEntry.key} className="rounded-xl border border-white/10 bg-black/35 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-black text-gray-500">{processEntry.label}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-gray-300 border border-white/15 rounded-md px-2 py-1 bg-black/30">
                            Inicio: {displayDate(processEntry.startDate)}
                          </span>
                          {processEntry.endDate && (
                            <span className="text-[10px] font-black text-gray-300 border border-white/15 rounded-md px-2 py-1 bg-black/30">
                              Fin: {displayDate(processEntry.endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-[84px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {processEntry.observations.length === 0 ? (
                          <p className="text-xs text-gray-500">Sin observaciones en este proceso.</p>
                        ) : (
                          processEntry.observations.map((observation, index) => (
                            <div
                              key={`${processEntry.key}-${index}`}
                              className={`rounded-lg border border-white/10 bg-black/45 p-2.5 min-h-[72px] ${
                                index === 0 ? '' : 'mt-2'
                              }`}
                            >
                              <p className="text-xs text-gray-300">{observation.text}</p>
                              <p className="text-[10px] text-gray-500 mt-2">{observation.author.name}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {processEntry.key === Proceso.EDDI && processEntry.grades.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.16em] font-black text-gray-500">Materias y notas</p>
                          <div className="max-h-[120px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {processEntry.grades.map((grade) => (
                              <div key={grade.id} className="rounded-lg border border-white/10 bg-black/45 px-3 py-2 flex items-center justify-between gap-3">
                                <span className="text-xs text-gray-300">{grade.materia}</span>
                                <span className="text-xs font-black text-[#c5a059]">{grade.nota}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('TODOS')}
                className="rounded-xl border border-white/10 bg-black/40 p-3 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Altares abiertos</p>
                <p className="text-2xl font-black text-[#c5a059] mt-2">{altarTrackingSummary.opened}</p>
              </button>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('FINALIZADOS')}
                className="rounded-xl border border-white/10 bg-black/40 p-3 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Finalizados</p>
                <p className="text-2xl font-black text-emerald-300 mt-2">{altarTrackingSummary.finalized}</p>
              </button>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('INTERRUMPIDOS')}
                className="rounded-xl border border-white/10 bg-black/40 p-3 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.18em] font-black text-gray-500">Interrumpidos</p>
                <p className="text-2xl font-black text-rose-300 mt-2">{altarTrackingSummary.interrupted}</p>
              </button>
            </div>

            {filteredDisciplesAltarBrothers.length === 0 ? (
              <p className="text-sm text-gray-400">
                {discipuloAltarsFilter === 'TODOS'
                  ? 'No hay hermanos registrados en altares abiertos por este discípulo.'
                  : 'No hay hermanos para el filtro seleccionado.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredDisciplesAltarBrothers.map((entry) => {
                  const status = getAltarTrackingStatus(entry);
                  return (
                    <article
                      key={entry.id}
                      className="rounded-xl border border-white/10 bg-black/35 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-white truncate">{entry.name}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Célula: {entry.acompanamiento.celulaName} · Inicio: {displayDate(entry.altar?.fechaInicio)} · Fin:{' '}
                          {displayDate(entry.altar?.fechaFin)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span
                          className={`text-[10px] px-2.5 py-1 rounded-md border font-black tracking-wider ${altarTrackingStatusStyle[status]}`}
                        >
                          {altarTrackingStatusLabel[status]}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDiscipuloAltarBrotherId(entry.id)}
                          className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
                        >
                          Ver
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {canEditProfile && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Actualizando Ficha de ${brother.name}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveServiceTags();
              setIsEditModalOpen(false);
              setShowToast(true);
            }}
            className="space-y-8"
          >
            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Users size={18} /> Red y Estructura
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Líder de Célula a Cargo</label>
                  <input type="text" defaultValue={acompanamiento.liderCelulaName} className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Discípulo/Hermano mayor</label>
                  <input type="text" defaultValue={acompanamiento.acompananteName} className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors" />
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Star size={18} /> Proceso Altar (Rápido)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Fecha Inicio</label>
                  <input type="date" defaultValue={brother.altar?.fechaInicio} className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none [color-scheme:dark]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Altar Realizado Por</label>
                  <input type="text" defaultValue={brother.altar?.realizadoPor?.join(', ')} className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Observaciones de Altar</label>
                <textarea defaultValue={brother.altar?.observaciones?.[0]?.text || ''} className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none min-h-[100px] resize-none shadow-inner" />
              </div>
            </div>

            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Music2 size={18} /> Talentos y dones de servicio
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Adoracion</p>
                  {!canManageServiceTags && (
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border border-blue-400/30 bg-blue-500/10 text-blue-300">
                      Solo lectura
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {MUSICAL_SKILL_TAGS.map((tag) => {
                    const isSelected = worshipTagsDraft.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={!canManageServiceTags}
                        onClick={() => toggleWorshipTag(tag)}
                        className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-black border transition-colors ${
                          isSelected
                            ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                            : 'border-white/10 bg-black/50 text-gray-400'
                        } disabled:opacity-70`}
                      >
                        {MUSICAL_SKILL_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Multimedia</p>
                <div className="flex flex-wrap gap-2">
                  {MULTIMEDIA_SKILL_TAGS.map((tag) => {
                    const isSelected = multimediaTagsDraft.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={!canManageServiceTags}
                        onClick={() => toggleMultimediaTag(tag)}
                        className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-black border transition-colors ${
                          isSelected
                            ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                            : 'border-white/10 bg-black/50 text-gray-400'
                        } disabled:opacity-70`}
                      >
                        {MULTIMEDIA_SKILL_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Misericordia</p>
                <div className="flex flex-wrap gap-2">
                  {MISERICORDIA_SKILL_TAGS.map((tag) => {
                    const isSelected = misericordiaTagsDraft.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        disabled={!canManageServiceTags}
                        onClick={() => toggleMisericordiaTag(tag)}
                        className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-black border transition-colors ${
                          isSelected
                            ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                            : 'border-white/10 bg-black/50 text-gray-400'
                        } disabled:opacity-70`}
                      >
                        {MISERICORDIA_SKILL_LABELS[tag]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#c5a059] to-[#d4b375] text-black font-black uppercase tracking-[0.15em] px-6 py-3 text-sm rounded-[1.1rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Información del hermano actualizada." />
      <Toast isVisible={showPhotoToast} onClose={() => setShowPhotoToast(false)} message="Foto actualizada en vista previa web." />
      <Toast isVisible={showServiceTagsToast} onClose={() => setShowServiceTagsToast(false)} message="Etiquetas de servicio guardadas." />
    </div>
  );
};

