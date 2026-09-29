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
  Camera,
  Edit2,
  Music2,
  Phone,
  Save,
  Trash2,
  X,
  AlertTriangle,
  UserCheck,
  Heart,
  Sparkles,
  CheckCircle2,
  Flame,
  Building2,
  Crown,
  Shield,
  Compass,
  RotateCcw,
  Lock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { brothersService } from '../../services/brothersService';
import { useAuth } from '../../hooks/useAuth';
import { photoService } from '../../services/photos/photoService';
import {
  addObservation,
  deleteObservation,
  getObservations,
  Observation,
  ObservationRole,
  updateObservation,
} from '../../services/observationsService';
import { Acompanamiento, Proceso, Role } from '../../types';
import { BrotherProfile } from './types';
import { eddiModuleService } from '../eddi/services/eddiModuleService';
import { edemModuleService } from '../edem/services/edemModuleService';
import { seguimientoModuleService } from '../seguimiento/services/seguimientoModuleService';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { talentsService } from '../../services/talentsService';
import { altarService, BrotherAltarData, getAltarState } from '../../services/altarService';
import { marriagesService, Marriage } from '../../services/marriagesService';
import { accompanimentService } from '../../services/accompanimentService';
import { stageDatesService, CincoMinisterios } from '../../services/stageDatesService';
import { experienciaService } from '../../services/experienciaService';
import { discipleshipConfigService } from '../../services/discipleshipConfigService';
import { grupoVidaApprovalService, BrotherGrupoVidaApproval } from '../../services/grupoVidaApprovalService';
import { liderCelulaApprovalService, BrotherLiderCelulaApproval } from '../../services/liderCelulaApprovalService';
import { stageFrozenStatsService, BrotherFrozenStages } from '../../services/stageFrozenStatsService';
import { stageProgressionService } from '../../services/stageProgressionService';
import { StageSimulatorModal } from './components/StageSimulatorModal';

const CURRENT_USER_ROLE: Role = Role.PASTOR;
const canEditProfile = [Role.APOSTOL, Role.PASTOR, Role.LIDER_CELULA, Role.DISCIPULO].includes(CURRENT_USER_ROLE);

const getCardStyle = (isCurrent: boolean, isCompleted?: boolean) => {
  if (isCurrent && !isCompleted) {
    return 'bg-white dark:bg-[#1a1a1a] border-2 border-[#c5a059]/70 dark:border-[#c5a059] shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_0_30px_rgba(197,160,89,0.15)] relative overflow-hidden ring-1 ring-[#c5a059]/25';
  }
  if (isCompleted) {
    return 'bg-white dark:bg-[#1a1a1a] border border-emerald-500/70 dark:border-emerald-400/50 shadow-[0_4px_20px_rgba(16,185,129,0.06)] relative overflow-hidden';
  }
  return 'bg-[#f8fafc] dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 opacity-100 dark:opacity-80';
};

const ApproximateDateHint = () => (
  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/25 text-[#a58345] dark:text-[#c5a059] text-[11px] font-medium mt-1">
    <span className="text-sm shrink-0">💡</span>
    <span>
      <strong>Sugerencia:</strong> Si no recuerdas las fechas exactas, puedes ingresar una fecha aproximada para completar la etapa y habilitar el avance a la siguiente.
    </span>
  </div>
);

const displayDate = (value?: string) => value || 'Pendiente';

const processBadgeLabelMap: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'Hermano nuevo',
  [Proceso.GRUPO]: 'Hermano menor',
  [Proceso.EXPERIENCIA]: 'Hermano mayor',
  [Proceso.EDDI]: 'EDDI Escuela de Discipulados',
  [Proceso.DISCIPULO]: 'Discípulo conector',
  [Proceso.EDEM]: 'EDEM Escuela de Entrenamiento Ministerial',
};

const statusStyle: Record<'APROBADO' | 'REPROBADO' | 'EN_CURSO', string> = {
  APROBADO: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 dark:border-emerald-400/30 bg-emerald-100 dark:bg-emerald-500/10',
  REPROBADO: 'text-rose-700 dark:text-rose-300 border-rose-500/40 dark:border-rose-400/30 bg-rose-100 dark:bg-rose-500/10',
  EN_CURSO: 'text-amber-700 dark:text-amber-300 border-amber-500/45 dark:border-amber-400/30 bg-amber-100 dark:bg-amber-500/10'
};

type ObservationDraftByProcess = Record<Proceso, string>;
type ObservationComposerByProcess = Record<Proceso, boolean>;
type ObservationSavingByProcess = Record<Proceso, boolean>;
type ObservationEditDraftById = Record<string, string>;
const EMPTY_OBSERVATIONS: Observation[] = [];

const createProcessRecord = <T,>(factory: () => T): Record<Proceso, T> => ({
  [Proceso.ALTAR]: factory(),
  [Proceso.GRUPO]: factory(),
  [Proceso.EXPERIENCIA]: factory(),
  [Proceso.EDDI]: factory(),
  [Proceso.DISCIPULO]: factory(),
  [Proceso.EDEM]: factory(),
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

type AltarTrackingStatus = 'SIN_ALTAR' | 'EN_PROCESO' | 'INTERRUMPIDO' | 'FINALIZADO';
type DiscipuloAltarsFilter = 'TODOS' | 'EN_PROCESO' | 'FINALIZADOS' | 'INTERRUMPIDOS' | 'SIN_ALTAR' | 'CONECTORES';

const normalizeName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const splitFullName = (fullName: string): { nombres: string; apellidos: string } => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length <= 1) {
    return { nombres: parts[0] ?? '', apellidos: '-' };
  }

  if (parts.length === 2) {
    return { nombres: parts[0], apellidos: parts[1] };
  }

  return {
    nombres: parts.slice(0, parts.length - 1).join(' '),
    apellidos: parts[parts.length - 1] ?? '-',
  };
};

const altarTrackingStatusLabel: Record<AltarTrackingStatus, string> = {
  SIN_ALTAR: 'Sin Altar',
  EN_PROCESO: 'En Proceso',
  INTERRUMPIDO: 'Interrumpido',
  FINALIZADO: 'Finalizado',
};

const altarTrackingStatusStyle: Record<AltarTrackingStatus, string> = {
  SIN_ALTAR: 'text-slate-600 dark:text-gray-400 border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5',
  EN_PROCESO: 'text-amber-700 dark:text-amber-300 border-amber-500/45 dark:border-amber-400/30 bg-amber-100 dark:bg-amber-500/10',
  FINALIZADO: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/45 dark:border-emerald-400/30 bg-emerald-100 dark:bg-emerald-500/10',
  INTERRUMPIDO: 'text-rose-700 dark:text-rose-300 border-rose-500/45 dark:border-rose-400/30 bg-rose-100 dark:bg-rose-500/10',
};

const computeAltarStatus = (params: {
  isInterrumpido?: boolean;
  fechaInicio?: string | null;
  fechaFin?: string | null;
}): AltarTrackingStatus => {
  if (params.isInterrumpido) {
    return 'INTERRUMPIDO';
  }
  if (params.fechaFin && params.fechaFin.trim() !== '') {
    return 'FINALIZADO';
  }
  if (params.fechaInicio && params.fechaInicio.trim() !== '') {
    return 'EN_PROCESO';
  }
  return 'SIN_ALTAR';
};



interface StageWrapperProps {
  brotherId: string;
  number: number;
  title: string;
  subtitle?: string;
  isCurrent: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  lockedReason?: string;
  children: React.ReactNode;
  rightTitle: string;
  rightEntries?: Observation[];
  rightEmpty: string;
  centerClassName?: string;
  isComposerOpen: boolean;
  isSavingObservation: boolean;
  draftValue: string;
  editingObservationId: string | null;
  editDraftValue: string;
  mutatingObservationId: string | null;
  onComposerOpen: () => void;
  onComposerClose: () => void;
  onDraftChange: (value: string) => void;
  onSaveObservation: () => void;
  onEditObservationStart: (entry: Observation) => void;
  onEditObservationCancel: () => void;
  onEditDraftChange: (entryId: string, value: string) => void;
  onUpdateObservation: (entry: Observation) => void;
  onDeleteObservation: (entry: Observation) => void;
  isEditing?: boolean;
  isOtherStageEditing?: boolean;
  canEdit?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  isSavingStage?: boolean;
}

const StageWrapperComponent = ({
  number,
  title,
  subtitle,
  isCurrent,
  isCompleted = false,
  isLocked = false,
  lockedReason,
  children,
  rightTitle,
  rightEntries,
  rightEmpty,
  centerClassName,
  isComposerOpen,
  isSavingObservation,
  draftValue,
  editingObservationId,
  editDraftValue,
  mutatingObservationId,
  onComposerOpen,
  onComposerClose,
  onDraftChange,
  onSaveObservation,
  onEditObservationStart,
  onEditObservationCancel,
  onEditDraftChange,
  onUpdateObservation,
  onDeleteObservation,
  isEditing = false,
  isOtherStageEditing = false,
  canEdit = true,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  isSavingStage = false,
}: StageWrapperProps) => (
  <div
    className={`p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden transition-all duration-300 ${
      isOtherStageEditing
        ? 'opacity-35 grayscale-[60%] pointer-events-none select-none contrast-75 cursor-not-allowed'
        : isEditing
        ? 'bg-white dark:bg-[#181818] border-2 border-[#c5a059] shadow-[0_0_35px_rgba(197,160,89,0.25)] ring-2 ring-[#c5a059]/40 relative z-10'
        : getCardStyle(isCurrent, isCompleted)
    }`}
  >
    <div className="w-full min-w-0 flex items-center justify-between gap-3 mb-4 md:mb-5 pb-3 border-b border-slate-200 dark:border-white/5">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        <div
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-black/70 dark:to-black/40 flex items-center justify-center text-[#c5a059] font-black text-xl sm:text-2xl border ${
            isCurrent && !isCompleted
              ? 'border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.3)]'
              : 'border-[#c5a059]/25'
          } shrink-0 relative`}
        >
          {number}
          {isCurrent && !isCompleted && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#c5a059] rounded-full ring-2 ring-white dark:ring-black animate-pulse" />
          )}
        </div>

        <div className="min-w-0 flex flex-wrap items-baseline gap-2 sm:gap-2.5">
          <h3 className="text-lg sm:text-2xl font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] text-slate-900 dark:text-white leading-tight break-words">
            {title}
          </h3>
          {subtitle && (
            <span className="text-sm sm:text-base md:text-lg font-semibold tracking-wide text-slate-500 dark:text-gray-400">
              {subtitle}
            </span>
          )}
          {isCurrent && !isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-widest bg-[#c5a059]/15 text-[#a58345] dark:text-[#c5a059] border border-[#c5a059]/40 shadow-sm self-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
              Etapa Actual
            </span>
          )}
        </div>
      </div>

      {/* Botones de acción en la esquina superior derecha */}
      {canEdit && (
        <div className="shrink-0 flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onCancelEdit}
                disabled={isSavingStage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <X size={13} />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                disabled={isSavingStage || isLocked}
                title={isLocked ? 'Para editar esta etapa tienes que completar la etapa anterior' : undefined}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider bg-[#c5a059] hover:bg-[#d4af37] text-black shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={13} />
                <span>Guardar</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              disabled={isOtherStageEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 hover:border-[#c5a059]/50 text-[10px] uppercase font-black tracking-wider text-slate-700 dark:text-gray-200 hover:text-[#c5a059] bg-white/70 dark:bg-black/50 hover:bg-[#c5a059]/10 transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Edit2 size={12} />
              <span>Editar</span>
            </button>
          )}
        </div>
      )}
    </div>

    <div className={isLocked ? 'w-full' : 'grid grid-cols-1 md:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] gap-6 md:gap-8 items-stretch'}>
      <div className={`w-full min-w-0 space-y-5 flex flex-col justify-center ${centerClassName ?? ''}`}>
        {isEditing && isLocked && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-2">
            <AlertTriangle size={16} className="text-[#c5a059] shrink-0" />
            <span>
              Para editar esta etapa tienes que completar la etapa anterior{lockedReason ? ` (${lockedReason})` : ''}.
            </span>
          </div>
        )}
        {children}
      </div>

      {!isLocked && (
        <div className="w-full min-w-0 bg-[#f3f4f6] dark:bg-black/60 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-white/5 flex flex-col overflow-hidden md:min-h-[240px] shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 text-[#c5a059]">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} />
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">{rightTitle}</span>
            </div>
            <button
              type="button"
              onClick={onComposerOpen}
              className="w-full sm:w-auto text-center text-[10px] uppercase font-black tracking-[0.12em] px-3 py-1.5 rounded-full border border-[#c5a059]/35 bg-[#c5a059]/15 dark:bg-[#c5a059]/10 text-[#a58345] dark:text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
            >
              Agregar observación
            </button>
          </div>
          {isComposerOpen && (
            <div className="mb-4 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/35 space-y-3">
              <textarea
                value={draftValue}
                onChange={(event) => onDraftChange(event.target.value)}
                placeholder="Escribí la observación..."
                className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-800 dark:text-white focus:border-[#c5a059] outline-none min-h-[88px] resize-none shadow-inner"
              />
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onComposerClose}
                  className="w-full sm:w-auto text-center text-[10px] uppercase font-black tracking-[0.12em] px-3 py-1.5 rounded-full border border-slate-300 dark:border-white/15 text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                    <article key={entry.id} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/35 p-3.5">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#c5a059] border border-[#c5a059]/40 bg-[#c5a059]/10 px-2 py-1 rounded-full">
                          {observationRoleBadgeLabel[entry.role]}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-200 break-words">{entry.author}</span>
                        <span className="w-full sm:w-auto sm:ml-auto text-[11px] text-slate-500 dark:text-gray-500 shrink-0">{formatObservationDate(entry.createdAt)}</span>
                      </div>
                      {editingObservationId === entry.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editDraftValue}
                            onChange={(event) => onEditDraftChange(entry.id, event.target.value)}
                            className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white focus:border-[#c5a059] outline-none min-h-[64px] resize-none shadow-inner"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={onEditObservationCancel}
                              className="px-3 py-1 rounded-lg border border-slate-300 dark:border-white/15 text-[10px] uppercase font-bold text-slate-600 dark:text-gray-300"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateObservation(entry)}
                              disabled={!editDraftValue.trim() || mutatingObservationId === entry.id}
                              className="px-3 py-1 rounded-lg border border-[#c5a059]/40 bg-[#c5a059] text-[10px] uppercase font-black text-black disabled:opacity-50"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed break-words">{entry.text}</p>
                          {isEditing && (
                            <div className="mt-3 flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                              <button
                                type="button"
                                onClick={() => onEditObservationStart(entry)}
                                disabled={mutatingObservationId === entry.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/15 text-[10px] uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
                              >
                                <Edit2 size={13} />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteObservation(entry)}
                                disabled={mutatingObservationId === entry.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-300/70 dark:border-rose-400/20 text-[10px] uppercase tracking-widest font-black text-rose-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                Eliminar
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-40 text-center min-h-[88px] max-h-[210px] overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              <p className="text-xs text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest mt-2">{rightEmpty}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

const StageWrapper = React.memo(
  StageWrapperComponent,
  (previous, next) =>
    previous.brotherId === next.brotherId &&
    previous.number === next.number &&
    previous.title === next.title &&
    previous.subtitle === next.subtitle &&
    previous.isCurrent === next.isCurrent &&
    previous.isCompleted === next.isCompleted &&
    previous.isLocked === next.isLocked &&
    previous.lockedReason === next.lockedReason &&
    previous.isEditing === next.isEditing &&
    previous.isOtherStageEditing === next.isOtherStageEditing &&
    previous.canEdit === next.canEdit &&
    previous.isSavingStage === next.isSavingStage &&
    previous.rightTitle === next.rightTitle &&
    previous.rightEmpty === next.rightEmpty &&
    previous.centerClassName === next.centerClassName &&
    previous.isComposerOpen === next.isComposerOpen &&
    previous.isSavingObservation === next.isSavingObservation &&
    previous.draftValue === next.draftValue &&
    previous.editingObservationId === next.editingObservationId &&
    previous.editDraftValue === next.editDraftValue &&
    previous.mutatingObservationId === next.mutatingObservationId &&
    areObservationListsEqual(previous.rightEntries, next.rightEntries) &&
    previous.children === next.children
);

StageWrapper.displayName = 'StageWrapper';

export const BrotherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const canManageServiceTags = [Role.APOSTOL, Role.PASTOR, Role.LIDER_RED_CELULAS, Role.LIDER_CELULA].includes(CURRENT_USER_ROLE);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDiscipuloAltarsModalOpen, setIsDiscipuloAltarsModalOpen] = useState(false);
  const [altarModalSourceStage, setAltarModalSourceStage] = useState<number>(4);
  const [discipuloAltarsFilter, setDiscipuloAltarsFilter] = useState<DiscipuloAltarsFilter>('TODOS');
  const [selectedDiscipuloAltarBrotherId, setSelectedDiscipuloAltarBrotherId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [profileToastMessage, setProfileToastMessage] = useState('Información del hermano actualizada.');
  const [profileToastType, setProfileToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPhotoToast, setShowPhotoToast] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [talentsText, setTalentsText] = useState('');
  const [isEditingTalents, setIsEditingTalents] = useState(false);
  const [isSavingTalents, setIsSavingTalents] = useState(false);

  const [altarData, setAltarData] = useState<BrotherAltarData>(() =>
    id ? altarService.getAltarInfo(id) : { brotherId: '', isInterrumpido: false, updatedAt: '' }
  );
  const [isInterruptModalOpen, setIsInterruptModalOpen] = useState(false);
  const [interruptReasonDraft, setInterruptReasonDraft] = useState('');
  const [isGrupoInterruptModalOpen, setIsGrupoInterruptModalOpen] = useState(false);
  const [grupoInterruptReasonDraft, setGrupoInterruptReasonDraft] = useState('');

  // Editing state for timeline stages: 1 = Altar, 2 = Hermano Menor, 3 = EDDI, 4 = Discípulo, null = none
  const [editingStage, setEditingStage] = useState<number | null>(null);

  // Drafts for Stage 1 (Altar)
  const [altarStartDateDraft, setAltarStartDateDraft] = useState('');
  const [altarEndDateDraft, setAltarEndDateDraft] = useState('');
  const [altarHermanoMayorDraft, setAltarHermanoMayorDraft] = useState('');

  // Drafts for Stage 2 (Hermano Menor)
  const [grupoStartDateDraft, setGrupoStartDateDraft] = useState('');
  const [grupoEndDateDraft, setGrupoEndDateDraft] = useState('');
  const [experienciaDateDraft, setExperienciaDateDraft] = useState('');

  // Drafts for Stage 3 (EDDI)
  const [eddiStartDateDraft, setEddiStartDateDraft] = useState('');
  const [eddiEndDateDraft, setEddiEndDateDraft] = useState('');

  // Drafts for Stage 4 (Discípulo Conector)
  const [discipuloStartDateDraft, setDiscipuloStartDateDraft] = useState('');
  const [discipuloEndDateDraft, setDiscipuloEndDateDraft] = useState('');

  // Drafts for Stage 5 (Hermano Mayor)
  const [hermanoMayorStartDateDraft, setHermanoMayorStartDateDraft] = useState('');
  const [hermanoMayorEndDateDraft, setHermanoMayorEndDateDraft] = useState('');

  // Drafts for Stage 6 (Líder de Célula)
  const [liderCelulaStartDateDraft, setLiderCelulaStartDateDraft] = useState('');
  const [liderCelulaEndDateDraft, setLiderCelulaEndDateDraft] = useState('');

  // Drafts for Stage 7 (EDEM)
  const [edemStartDateDraft, setEdemStartDateDraft] = useState('');
  const [edemEndDateDraft, setEdemEndDateDraft] = useState('');

  // Drafts for Stage 8 (Líder Ministerial)
  const [liderMinisterialStartDateDraft, setLiderMinisterialStartDateDraft] = useState('');
  const [ministerioAsignadoDraft, setMinisterioAsignadoDraft] = useState<CincoMinisterios | ''>('');

  // Grupo de Vida Approval state & modals
  const [grupoVidaApproval, setGrupoVidaApproval] = useState<BrotherGrupoVidaApproval>(() =>
    id ? grupoVidaApprovalService.getApproval(id) : { brotherId: '', isAprobado: false, updatedAt: '' }
  );
  const [isApproveGrupoVidaModalOpen, setIsApproveGrupoVidaModalOpen] = useState(false);
  const [isGrupoVidaMembersModalOpen, setIsGrupoVidaMembersModalOpen] = useState(false);
  const [selectedGrupoVidaMemberId, setSelectedGrupoVidaMemberId] = useState<string | null>(null);
  const [grupoVidaNombreDraft, setGrupoVidaNombreDraft] = useState('');

  // Líder de Célula Approval state & modals
  const [liderCelulaApproval, setLiderCelulaApproval] = useState<BrotherLiderCelulaApproval>(() =>
    id ? liderCelulaApprovalService.getApproval(id) : { brotherId: '', isAprobado: false, updatedAt: '' }
  );
  const [isApproveLiderCelulaModalOpen, setIsApproveLiderCelulaModalOpen] = useState(false);
  const [isHermanosMenoresModalOpen, setIsHermanosMenoresModalOpen] = useState(false);

  // Frozen Stages statistics snapshot
  const [frozenStages, setFrozenStages] = useState<BrotherFrozenStages>(() =>
    id ? stageFrozenStatsService.getFrozenStages(id) : { brotherId: '', updatedAt: '' }
  );

  const [editLiderChoice, setEditLiderChoice] = useState('');
  const [editLiderCustom, setEditLiderCustom] = useState('');
  const [editHermanoMayorChoice, setEditHermanoMayorChoice] = useState('');
  const [editHermanoMayorCustom, setEditHermanoMayorCustom] = useState('');

  const applyAccompaniment = (b: BrotherProfile | undefined): BrotherProfile | undefined => {
    if (!b) return undefined;
    const acc = accompanimentService.getAccompaniment(b.id);
    const expDate = experienciaService.getExperienciaDate(b.id);
    const savedDates = stageDatesService.getBrotherStageDates(b.id);
    return {
      ...b,
      acompanamiento: {
        ...b.acompanamiento,
        liderCelulaName: acc?.liderCelulaName || b.acompanamiento.liderCelulaName,
        acompananteName: acc?.acompananteName || b.acompanamiento.acompananteName,
      },
      grupo: {
        ...b.grupo,
        fechaInicio: savedDates?.grupoFechaInicio !== undefined ? savedDates.grupoFechaInicio : b.grupo?.fechaInicio,
        fechaFin: savedDates?.grupoFechaFin !== undefined ? savedDates.grupoFechaFin : b.grupo?.fechaFin,
        interrumpido: savedDates?.grupoInterrumpido !== undefined ? savedDates.grupoInterrumpido : b.grupo?.interrumpido,
        motivoInterrupcion: savedDates?.grupoMotivoInterrupcion !== undefined ? savedDates.grupoMotivoInterrupcion : b.grupo?.motivoInterrupcion,
        fechaInterrupcion: savedDates?.grupoFechaInterrupcion !== undefined ? savedDates.grupoFechaInterrupcion : b.grupo?.fechaInterrupcion,
        interrumpidoPor: savedDates?.grupoInterrumpidoPor !== undefined ? savedDates.grupoInterrumpidoPor : b.grupo?.interrumpidoPor,
      },
      experiencia: {
        ...b.experiencia,
        fechaRealizacion: savedDates?.experienciaFechaRealizacion !== undefined
          ? savedDates.experienciaFechaRealizacion
          : expDate !== undefined
          ? expDate
          : b.experiencia?.fechaRealizacion,
      },
      eddi: {
        ...b.eddi,
        fechaInicio: savedDates?.eddiFechaInicio !== undefined ? savedDates.eddiFechaInicio : b.eddi?.fechaInicio,
        fechaFin: savedDates?.eddiFechaFin !== undefined ? savedDates.eddiFechaFin : b.eddi?.fechaFin,
      },
      discipulo: {
        ...b.discipulo,
        fechaInicio: savedDates?.discipuloFechaInicio !== undefined ? savedDates.discipuloFechaInicio : b.discipulo?.fechaInicio,
      },
      edem: {
        ...b.edem,
        fechaInicio: savedDates?.edemFechaInicio !== undefined ? savedDates.edemFechaInicio : b.edem?.fechaInicio,
        fechaFin: savedDates?.edemFechaFin !== undefined ? savedDates.edemFechaFin : b.edem?.fechaFin,
      },
    };
  };

  const [brother, setBrother] = useState<BrotherProfile | undefined>(() =>
    applyAccompaniment(brothersService.findById(id ?? ''))
  );
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationsOwnerId, setObservationsOwnerId] = useState<string | null>(null);
  const [observationDraftByProcess, setObservationDraftByProcess] = useState<ObservationDraftByProcess>(() => createProcessRecord(() => ''));
  const [observationComposerByProcess, setObservationComposerByProcess] = useState<ObservationComposerByProcess>(() => createProcessRecord(() => false));
  const [observationSavingByProcess, setObservationSavingByProcess] = useState<ObservationSavingByProcess>(() => createProcessRecord(() => false));
  const [editingObservationId, setEditingObservationId] = useState<string | null>(null);
  const [observationEditDraftById, setObservationEditDraftById] = useState<ObservationEditDraftById>({});
  const [mutatingObservationId, setMutatingObservationId] = useState<string | null>(null);
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
      setTalentsText('');
      setIsEditingTalents(false);
      return;
    }

    setTalentsText(talentsService.getTalents(brother.id));
    setIsEditingTalents(false);

    const info = altarService.getAltarInfo(brother.id);
    const acc = accompanimentService.getAccompaniment(brother.id);
    if (acc?.acompananteName && !info.hermanoMayorName) {
      info.hermanoMayorName = acc.acompananteName;
      info.isMatrimonio = acc.acompananteIsMatrimonio;
      info.matrimonioId = acc.acompananteMatrimonioId;
    }
    if (!info.hermanoMayorName) {
      const defaultName = brother.altar?.realizadoPor?.[0] || brother.acompanamiento?.acompananteName;
      if (defaultName) {
        info.hermanoMayorName = defaultName;
      }
    }
    if (!info.fechaInicio && brother.altar?.fechaInicio) {
      info.fechaInicio = brother.altar.fechaInicio;
    }
    if (!info.fechaFin && brother.altar?.fechaFin) {
      info.fechaFin = brother.altar.fechaFin;
    }
    setAltarData(info);
    setGrupoVidaApproval(grupoVidaApprovalService.getApproval(brother.id));
    setLiderCelulaApproval(liderCelulaApprovalService.getApproval(brother.id));
    setFrozenStages(stageFrozenStatsService.getFrozenStages(brother.id));
  }, [brother]);

  useEffect(() => {
    let isMounted = true;

    setIsEditModalOpen(false);
    setIsDiscipuloAltarsModalOpen(false);
    setIsApproveGrupoVidaModalOpen(false);
    setIsGrupoVidaMembersModalOpen(false);
    setSelectedGrupoVidaMemberId(null);
    setIsApproveLiderCelulaModalOpen(false);
    setIsHermanosMenoresModalOpen(false);
    setDiscipuloAltarsFilter('TODOS');
    setSelectedDiscipuloAltarBrotherId(null);
    setShowToast(false);
    setShowPhotoToast(false);
    setSelectedPhotoUrl((previous) => {
      if (previous) {
        photoService.revokePreviewUrl(previous);
      }
      return null;
    });
    setObservationDraftByProcess(createProcessRecord(() => ''));
    setObservationComposerByProcess(createProcessRecord(() => false));
    setObservationSavingByProcess(createProcessRecord(() => false));
    setEditingObservationId(null);
    setObservationEditDraftById({});
    setMutatingObservationId(null);
    observationSavingLockRef.current = createProcessRecord(() => false);

    if (!id) {
      setBrother(undefined);
      setObservations([]);
      setObservationsOwnerId(null);
      return () => {
        isMounted = false;
      };
    }

    setBrother(applyAccompaniment(brothersService.findById(id)));

    const loadBrother = async () => {
      const remoteBrother = await brothersService.findByIdAsync(id);
      if (!isMounted || !remoteBrother) {
        return;
      }
      setBrother(applyAccompaniment(remoteBrother));
    };

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

    void loadBrother();
    void loadObservations();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const acompanamiento = brother?.acompanamiento ?? {
    liderCelulaName: '',
    acompananteName: '',
    celulaName: '',
  };
  const profileNameParts = splitFullName(brother?.name ?? '');
  const eddiTracking = eddiModuleService.getBrotherEddiTracking(brother?.id ?? '');
  const edemTracking = edemModuleService.getBrotherEdemTracking(brother?.id ?? '');

  const resolvedGrupoVidaStartDate =
    brother?.experiencia?.fechaRealizacion || brother?.grupo?.fechaInicio || undefined;
  const resolvedGrupoVidaEndDate =
    eddiTracking?.stageDates?.startDate || brother?.eddi?.fechaInicio || brother?.grupo?.fechaFin || undefined;

  const isGrupoInterrumpido = Boolean(brother?.grupo?.interrumpido);

  const progression = useMemo(
    () => (brother ? stageProgressionService.resolveProgression(brother) : ({ currentProcess: Proceso.ALTAR } as any)),
    [
      brother,
      altarData,
      grupoVidaApproval,
      liderCelulaApproval,
      isGrupoInterrumpido,
      resolvedGrupoVidaEndDate,
      resolvedGrupoVidaStartDate,
    ]
  );
  const procesoActual = progression.currentProcess;

  const grupoVidaStatus: 'PENDIENTE' | 'EN_CURSO' | 'FINALIZADO' | 'INTERRUMPIDO' = useMemo(() => {
    if (isGrupoInterrumpido) return 'INTERRUMPIDO';
    if (resolvedGrupoVidaEndDate) return 'FINALIZADO';
    if (resolvedGrupoVidaStartDate) return 'EN_CURSO';
    return 'PENDIENTE';
  }, [isGrupoInterrumpido, resolvedGrupoVidaStartDate, resolvedGrupoVidaEndDate]);

  const captureAttributes = photoService.getInputCaptureAttributes();
  const profilePhotoUrl = selectedPhotoUrl ?? brother?.fotoUrl;
  const observationRoleByUserRole: Record<Role, ObservationRole> = {
    [Role.SUPERADMIN]: 'Pastor',
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
  const availableBrothers = useMemo(
    () => (brother ? brothersService.listForListing().filter((b) => b.id !== brother.id) : brothersService.listForListing()),
    [brother?.id],
  );
  const marriages = useMemo(() => marriagesService.list(), [isEditModalOpen]);

  const initAccompanimentSelectors = (currentBrother: BrotherProfile) => {
    const currentLider = (currentBrother.acompanamiento.liderCelulaName || '').trim();
    const currentAcompanante = (currentBrother.acompanamiento.acompananteName || '').trim();

    // Líder
    const matchedLiderMarriage = marriages.find(
      (m) =>
        m.label.toLowerCase() === currentLider.toLowerCase() ||
        currentLider.toLowerCase().includes(m.label.toLowerCase()) ||
        (currentLider.toLowerCase().includes(m.spouse1Name.toLowerCase()) &&
          currentLider.toLowerCase().includes(m.spouse2Name.toLowerCase()))
    );
    if (matchedLiderMarriage) {
      setEditLiderChoice(`mat:${matchedLiderMarriage.id}`);
      setEditLiderCustom('');
    } else {
      const matchedLiderBrother = availableBrothers.find(
        (b) => b.name.toLowerCase() === currentLider.toLowerCase()
      );
      if (matchedLiderBrother) {
        setEditLiderChoice(`bro:${matchedLiderBrother.id}`);
        setEditLiderCustom('');
      } else if (currentLider) {
        setEditLiderChoice('custom');
        setEditLiderCustom(currentLider);
      } else {
        setEditLiderChoice('');
        setEditLiderCustom('');
      }
    }

    // Hermano Mayor
    const matchedHMMarriage = marriages.find(
      (m) =>
        m.label.toLowerCase() === currentAcompanante.toLowerCase() ||
        currentAcompanante.toLowerCase().includes(m.label.toLowerCase()) ||
        (currentAcompanante.toLowerCase().includes(m.spouse1Name.toLowerCase()) &&
          currentAcompanante.toLowerCase().includes(m.spouse2Name.toLowerCase()))
    );
    if (matchedHMMarriage) {
      setEditHermanoMayorChoice(`mat:${matchedHMMarriage.id}`);
      setEditHermanoMayorCustom('');
    } else {
      const matchedHMBrother = availableBrothers.find(
        (b) => b.name.toLowerCase() === currentAcompanante.toLowerCase()
      );
      if (matchedHMBrother) {
        setEditHermanoMayorChoice(`bro:${matchedHMBrother.id}`);
        setEditHermanoMayorCustom('');
      } else if (currentAcompanante) {
        setEditHermanoMayorChoice('custom');
        setEditHermanoMayorCustom(currentAcompanante);
      } else {
        setEditHermanoMayorChoice('');
        setEditHermanoMayorCustom('');
      }
    }
  };

  const currentUserRole = user?.role ?? CURRENT_USER_ROLE;
  const currentUserName = (user?.name || '').trim().toLowerCase();
  const currentUserId = user?.id || '';

  const hermanoMayorName = (
    altarData.hermanoMayorName ||
    brother?.altar?.realizadoPor?.[0] ||
    brother?.acompanamiento?.acompananteName ||
    ''
  ).trim();

  const matchingMarriage = altarData.matrimonioId
    ? marriagesService.findById(altarData.matrimonioId)
    : marriages.find(
        (m) =>
          hermanoMayorName &&
          (hermanoMayorName.toLowerCase().includes(m.spouse1Name.toLowerCase()) ||
            hermanoMayorName.toLowerCase().includes(m.spouse2Name.toLowerCase()) ||
            hermanoMayorName.toLowerCase().includes(m.label.toLowerCase()))
      );

  const isMarriageSpouse = matchingMarriage
    ? Boolean(
        (currentUserId &&
          (matchingMarriage.spouse1Id === currentUserId || matchingMarriage.spouse2Id === currentUserId)) ||
        (currentUserName &&
          (normalizeName(matchingMarriage.spouse1Name) === currentUserName ||
            normalizeName(matchingMarriage.spouse2Name) === currentUserName))
      )
    : false;

  const isUserDoingAltar = Boolean(
    (altarData.hermanoMayorId && currentUserId && altarData.hermanoMayorId === currentUserId) ||
    (hermanoMayorName &&
      currentUserName &&
      (normalizeName(hermanoMayorName) === currentUserName ||
        normalizeName(hermanoMayorName).includes(currentUserName))) ||
    isMarriageSpouse
  );

  const isCellLeader = currentUserRole === Role.LIDER_CELULA || currentUserRole === Role.LIDER_RED_CELULAS;
  const isApostleOrHigher = [Role.APOSTOL, Role.SUPERADMIN, Role.PASTOR].includes(currentUserRole);

  const canManageAltar = isUserDoingAltar || isCellLeader || isApostleOrHigher;

  const currentAltarStatus = computeAltarStatus({
    isInterrumpido: altarData.isInterrumpido,
    fechaInicio: altarData.fechaInicio || brother?.altar?.fechaInicio,
    fechaFin: altarData.fechaFin || brother?.altar?.fechaFin,
  });

  const handleConfirmInterruption = () => {
    if (!brother) return;
    const updated = altarService.setAltarInterrumpido(
      brother.id,
      true,
      interruptReasonDraft,
      user ? { id: user.id, name: user.name, role: currentUserRole } : undefined,
    );
    setAltarData(updated);
    setIsInterruptModalOpen(false);
    setInterruptReasonDraft('');
    setProfileToastType('info');
    setProfileToastMessage('El altar fue marcado como interrumpido.');
    setShowToast(true);
  };

  const handleResumeAltar = () => {
    if (!brother) return;
    const updated = altarService.setAltarInterrumpido(brother.id, false);
    setAltarData(updated);
    setProfileToastType('success');
    setProfileToastMessage('El altar fue reanudado correctamente.');
    setShowToast(true);
  };

  // Stage 1 (Altar) Handlers
  const handleStartEditStage1 = () => {
    setAltarStartDateDraft(altarData.fechaInicio || brother?.altar?.fechaInicio || '');
    setAltarEndDateDraft(altarData.fechaFin || brother?.altar?.fechaFin || '');
    if (altarData.matrimonioId) {
      setAltarHermanoMayorDraft(`mat:${altarData.matrimonioId}`);
    } else if (altarData.hermanoMayorId) {
      setAltarHermanoMayorDraft(`bro:${altarData.hermanoMayorId}`);
    } else {
      const currentName = hermanoMayorName;
      const matchMat = marriages.find((m) => m.label === currentName || currentName.includes(m.label));
      if (matchMat) {
        setAltarHermanoMayorDraft(`mat:${matchMat.id}`);
      } else {
        const matchBro = availableBrothers.find((b) => b.name === currentName);
        if (matchBro) {
          setAltarHermanoMayorDraft(`bro:${matchBro.id}`);
        } else {
          setAltarHermanoMayorDraft('');
        }
      }
    }
    setEditingStage(1);
  };

  const handleCancelEditStage1 = () => {
    setEditingStage(null);
  };

  const handleSaveStage1 = () => {
    if (!brother) return;
    const start = altarStartDateDraft.trim() || undefined;
    const end = altarEndDateDraft.trim() || undefined;

    let updatedAltar = altarService.setAltarDates(brother.id, start, end);

    let assignedLabel = hermanoMayorName;
    if (altarHermanoMayorDraft.startsWith('mat:')) {
      const mId = altarHermanoMayorDraft.replace('mat:', '');
      const m = marriagesService.findById(mId);
      if (m) {
        assignedLabel = `${m.spouse1Name} & ${m.spouse2Name}`;
        updatedAltar = altarService.setHermanoMayor(brother.id, {
          id: m.id,
          name: assignedLabel,
          isMatrimonio: true,
          matrimonioId: m.id,
        });
        accompanimentService.saveAccompaniment(brother.id, {
          acompananteName: assignedLabel,
          acompananteId: m.id,
          acompananteIsMatrimonio: true,
          acompananteMatrimonioId: m.id,
        });
      }
    } else if (altarHermanoMayorDraft.startsWith('bro:')) {
      const bId = altarHermanoMayorDraft.replace('bro:', '');
      const b = brothersService.findById(bId);
      if (b) {
        assignedLabel = b.name;
        updatedAltar = altarService.setHermanoMayor(brother.id, {
          id: b.id,
          name: b.name,
          isMatrimonio: false,
        });
        accompanimentService.saveAccompaniment(brother.id, {
          acompananteName: b.name,
          acompananteId: b.id,
          acompananteIsMatrimonio: false,
        });
      }
    } else if (altarHermanoMayorDraft === '') {
      assignedLabel = '';
      updatedAltar = altarService.setHermanoMayor(brother.id, {
        id: undefined,
        name: '',
        isMatrimonio: false,
      });
      accompanimentService.saveAccompaniment(brother.id, {
        acompananteName: undefined,
        acompananteId: undefined,
        acompananteIsMatrimonio: false,
        acompananteMatrimonioId: undefined,
      });
    }

    setAltarData(updatedAltar);
    setBrother((prev) =>
      prev
        ? {
            ...prev,
            acompanamiento: {
              ...prev.acompanamiento,
              acompananteName: assignedLabel || undefined,
            },
            altar: {
              ...prev.altar,
              fechaInicio: start,
              fechaFin: end,
            },
          }
        : prev
    );

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Altar guardada correctamente.');
    setShowToast(true);
  };

  const handleConfirmGrupoInterruption = () => {
    if (!brother) return;
    const author = user ? { id: user.id, name: user.name, role: currentUserRole } : undefined;
    const nowIso = new Date().toISOString();
    const reason = grupoInterruptReasonDraft.trim() || undefined;

    stageDatesService.setGrupoInterrumpido(brother.id, true, reason, author);

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            grupo: {
              ...prev.grupo,
              interrumpido: true,
              motivoInterrupcion: reason,
              fechaInterrupcion: nowIso,
              interrumpidoPor: author,
            },
          }
        : prev
    );

    setIsGrupoInterruptModalOpen(false);
    setGrupoInterruptReasonDraft('');
    setProfileToastType('info');
    setProfileToastMessage('El Grupo de Vida fue marcado como interrumpido.');
    setShowToast(true);
  };

  const handleResumeGrupoVida = () => {
    if (!brother) return;
    stageDatesService.setGrupoInterrumpido(brother.id, false);

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            grupo: {
              ...prev.grupo,
              interrumpido: false,
              motivoInterrupcion: undefined,
              fechaInterrupcion: undefined,
              interrumpidoPor: undefined,
            },
          }
        : prev
    );

    setProfileToastType('success');
    setProfileToastMessage('El Grupo de Vida fue reanudado correctamente.');
    setShowToast(true);
  };

  // Stage 2 (Hermano Menor) Handlers
  const handleStartEditStage2 = () => {
    setGrupoStartDateDraft(brother?.grupo?.fechaInicio || resolvedGrupoVidaStartDate || '');
    setGrupoEndDateDraft(brother?.grupo?.fechaFin || resolvedGrupoVidaEndDate || '');
    setExperienciaDateDraft(brother?.experiencia?.fechaRealizacion || experienciaService.getExperienciaDate(brother?.id || '') || '');
    if (brother) {
      initAccompanimentSelectors(brother);
    }
    setEditingStage(2);
  };

  const handleCancelEditStage2 = () => {
    setEditingStage(null);
  };

  const handleSaveStage2 = () => {
    if (!brother) return;
    const grupoStart = grupoStartDateDraft.trim() || undefined;
    const grupoEnd = grupoEndDateDraft.trim() || undefined;
    const expDate = experienciaDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      grupoFechaInicio: grupoStart,
      grupoFechaFin: grupoEnd,
      experienciaFechaRealizacion: expDate,
    });

    experienciaService.saveExperienciaDate(brother.id, expDate);

    // Resolver Líder de Célula / Grupo de Vida
    let finalLiderName = brother.acompanamiento.liderCelulaName;
    let finalLiderId: string | undefined;
    let finalLiderIsMatrimonio = false;
    let finalLiderMatrimonioId: string | undefined;

    if (editLiderChoice === 'custom') {
      finalLiderName = editLiderCustom.trim() || undefined;
    } else if (editLiderChoice.startsWith('mat:')) {
      const m = marriages.find((item) => item.id === editLiderChoice.replace('mat:', ''));
      if (m) {
        finalLiderName = `${m.spouse1Name} & ${m.spouse2Name}`;
        finalLiderId = m.id;
        finalLiderIsMatrimonio = true;
        finalLiderMatrimonioId = m.id;
      }
    } else if (editLiderChoice.startsWith('bro:')) {
      const b = availableBrothers.find((item) => item.id === editLiderChoice.replace('bro:', ''));
      if (b) {
        finalLiderName = b.name;
        finalLiderId = b.id;
      }
    } else if (editLiderChoice === '') {
      finalLiderName = undefined;
      finalLiderId = undefined;
    }

    // Resolver Hermano Mayor
    let finalHermanoMayorName = brother.acompanamiento.acompananteName;
    let finalHermanoMayorId: string | undefined;
    let finalHermanoMayorIsMatrimonio = false;
    let finalHermanoMayorMatrimonioId: string | undefined;

    if (editHermanoMayorChoice === 'custom') {
      finalHermanoMayorName = editHermanoMayorCustom.trim() || undefined;
    } else if (editHermanoMayorChoice.startsWith('mat:')) {
      const m = marriages.find((item) => item.id === editHermanoMayorChoice.replace('mat:', ''));
      if (m) {
        finalHermanoMayorName = `${m.spouse1Name} & ${m.spouse2Name}`;
        finalHermanoMayorId = m.id;
        finalHermanoMayorIsMatrimonio = true;
        finalHermanoMayorMatrimonioId = m.id;
      }
    } else if (editHermanoMayorChoice.startsWith('bro:')) {
      const b = availableBrothers.find((item) => item.id === editHermanoMayorChoice.replace('bro:', ''));
      if (b) {
        finalHermanoMayorName = b.name;
        finalHermanoMayorId = b.id;
      }
    } else if (editHermanoMayorChoice === '') {
      finalHermanoMayorName = undefined;
      finalHermanoMayorId = undefined;
    }

    accompanimentService.saveAccompaniment(brother.id, {
      liderCelulaName: finalLiderName,
      liderCelulaId: finalLiderId,
      liderIsMatrimonio: finalLiderIsMatrimonio,
      liderMatrimonioId: finalLiderMatrimonioId,
      acompananteName: finalHermanoMayorName,
      acompananteId: finalHermanoMayorId,
      acompananteIsMatrimonio: finalHermanoMayorIsMatrimonio,
      acompananteMatrimonioId: finalHermanoMayorMatrimonioId,
    });

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            acompanamiento: {
              ...prev.acompanamiento,
              liderCelulaName: finalLiderName,
              acompananteName: finalHermanoMayorName,
            },
            grupo: {
              ...prev.grupo,
              fechaInicio: grupoStart,
              fechaFin: grupoEnd,
            },
            experiencia: {
              ...prev.experiencia,
              fechaRealizacion: expDate,
            },
          }
        : prev
    );

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Hermano Menor guardada correctamente.');
    setShowToast(true);
  };

  // Stage 3 (EDDI) Handlers
  const handleStartEditStage3 = () => {
    setEddiStartDateDraft(brother?.eddi?.fechaInicio || eddiTracking.stageDates.startDate || '');
    setEddiEndDateDraft(brother?.eddi?.fechaFin || eddiTracking.stageDates.endDate || '');
    setEditingStage(3);
  };

  const handleCancelEditStage3 = () => {
    setEditingStage(null);
  };

  const handleSaveStage3 = () => {
    if (!brother) return;
    const start = eddiStartDateDraft.trim() || undefined;
    const end = eddiEndDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      eddiFechaInicio: start,
      eddiFechaFin: end,
    });

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            eddi: {
              ...prev.eddi,
              fechaInicio: start,
              fechaFin: end,
            },
          }
        : prev
    );

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa EDDI guardada correctamente.');
    setShowToast(true);
  };

  // Stage 4 (Discípulo Conector) Handlers
  const handleStartEditStage4 = () => {
    const savedDates = stageDatesService.getBrotherStageDates(brother?.id || '');
    setDiscipuloStartDateDraft(brother?.discipulo?.fechaInicio || savedDates?.discipuloFechaInicio || '');
    setDiscipuloEndDateDraft(savedDates?.discipuloFechaFin || '');
    setEditingStage(4);
  };

  const handleCancelEditStage4 = () => {
    setEditingStage(null);
  };

  const handleSaveStage4 = () => {
    if (!brother) return;
    const start = discipuloStartDateDraft.trim() || undefined;
    const end = discipuloEndDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      discipuloFechaInicio: start,
      discipuloFechaFin: end,
    });

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            discipulo: {
              ...prev.discipulo,
              fechaInicio: start,
            },
          }
        : prev
    );

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Discípulo Conector guardada correctamente.');
    setShowToast(true);
  };

  // Stage 5 (Hermano Mayor) Handlers
  const handleStartEditStage5 = () => {
    const savedDates = stageDatesService.getBrotherStageDates(brother?.id || '');
    setHermanoMayorStartDateDraft(
      savedDates?.hermanoMayorFechaInicio ||
      grupoVidaApproval.approvedAt?.slice(0, 10) ||
      ''
    );
    setHermanoMayorEndDateDraft(savedDates?.hermanoMayorFechaFin || '');
    setEditingStage(5);
  };

  const handleCancelEditStage5 = () => {
    setEditingStage(null);
  };

  const handleSaveStage5 = () => {
    if (!brother) return;
    const start = hermanoMayorStartDateDraft.trim() || undefined;
    const end = hermanoMayorEndDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      hermanoMayorFechaInicio: start,
      hermanoMayorFechaFin: end,
    });

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Hermano Mayor guardada correctamente.');
    setShowToast(true);
  };

  // Stage 6 (Líder de Célula) Handlers
  const handleStartEditStage6 = () => {
    const savedDates = stageDatesService.getBrotherStageDates(brother?.id || '');
    setLiderCelulaStartDateDraft(savedDates?.liderCelulaFechaInicio || liderCelulaApproval.fechaAprobacion?.slice(0, 10) || '');
    setLiderCelulaEndDateDraft(savedDates?.liderCelulaFechaFin || '');
    setEditingStage(6);
  };

  const handleCancelEditStage6 = () => {
    setEditingStage(null);
  };

  const handleSaveStage6 = () => {
    if (!brother) return;
    const start = liderCelulaStartDateDraft.trim() || undefined;
    const end = liderCelulaEndDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      liderCelulaFechaInicio: start,
      liderCelulaFechaFin: end,
    });

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Líder de Célula guardada correctamente.');
    setShowToast(true);
  };

  // Stage 7 (EDEM) Handlers
  const handleStartEditStage7 = () => {
    const savedDates = stageDatesService.getBrotherStageDates(brother?.id || '');
    setEdemStartDateDraft(savedDates?.edemFechaInicio || brother?.edem?.fechaInicio || edemTracking.stageDates.startDate || '');
    setEdemEndDateDraft(savedDates?.edemFechaFin || brother?.edem?.fechaFin || edemTracking.stageDates.endDate || '');
    setEditingStage(7);
  };

  const handleCancelEditStage7 = () => {
    setEditingStage(null);
  };

  const handleSaveStage7 = () => {
    if (!brother) return;
    const start = edemStartDateDraft.trim() || undefined;
    const end = edemEndDateDraft.trim() || undefined;

    stageDatesService.saveStageDates(brother.id, {
      edemFechaInicio: start,
      edemFechaFin: end,
    });

    setBrother((prev) =>
      prev
        ? {
            ...prev,
            edem: {
              ...prev.edem,
              fechaInicio: start,
              fechaFin: end,
            },
          }
        : prev
    );

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa EDEM guardada correctamente.');
    setShowToast(true);
  };

  // Stage 8 (Líder Ministerial) Handlers
  const handleStartEditStage8 = () => {
    const savedDates = stageDatesService.getBrotherStageDates(brother?.id || '');
    setLiderMinisterialStartDateDraft(savedDates?.liderMinisterialFechaInicio || '');
    setMinisterioAsignadoDraft(savedDates?.ministerioAsignado || '');
    setEditingStage(8);
  };

  const handleCancelEditStage8 = () => {
    setEditingStage(null);
  };

  const handleSaveStage8 = () => {
    if (!brother) return;
    const start = liderMinisterialStartDateDraft.trim() || undefined;
    const min = (ministerioAsignadoDraft as CincoMinisterios) || undefined;

    stageDatesService.saveStageDates(brother.id, {
      liderMinisterialFechaInicio: start,
      ministerioAsignado: min,
    });

    setEditingStage(null);
    setProfileToastType('success');
    setProfileToastMessage('Etapa Líder Ministerial guardada correctamente.');
    setShowToast(true);
  };

  const handleSaveTalents = () => {
    if (!brother) return;
    setIsSavingTalents(true);
    talentsService.saveTalents(brother.id, talentsText);
    setIsSavingTalents(false);
    setIsEditingTalents(false);
    setProfileToastType('success');
    setProfileToastMessage('Talentos y dones actualizados correctamente.');
    setShowToast(true);
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!brother || isSavingProfile) {
      return;
    }

    setIsSavingProfile(true);

    try {
      const formData = new FormData(event.currentTarget);
      const nombres = String(formData.get('nombres') ?? '').trim();
      const apellidos = String(formData.get('apellidos') ?? '').trim();
      const telefono = String(formData.get('telefono') ?? '').trim();
      const fechaNacimiento = String(formData.get('fecha_nacimiento') ?? '').trim();

      // Resolver Líder de Célula
      let finalLiderName = brother.acompanamiento.liderCelulaName;
      let finalLiderId: string | undefined;
      let finalLiderIsMatrimonio = false;
      let finalLiderMatrimonioId: string | undefined;

      if (editLiderChoice === 'custom') {
        finalLiderName = editLiderCustom.trim() || undefined;
      } else if (editLiderChoice.startsWith('mat:')) {
        const m = marriages.find((item) => item.id === editLiderChoice.replace('mat:', ''));
        if (m) {
          finalLiderName = `${m.spouse1Name} & ${m.spouse2Name}`;
          finalLiderId = m.id;
          finalLiderIsMatrimonio = true;
          finalLiderMatrimonioId = m.id;
        }
      } else if (editLiderChoice.startsWith('bro:')) {
        const b = availableBrothers.find((item) => item.id === editLiderChoice.replace('bro:', ''));
        if (b) {
          finalLiderName = b.name;
          finalLiderId = b.id;
        }
      }

      // Resolver Hermano Mayor / Matrimonio
      let finalHermanoMayorName = brother.acompanamiento.acompananteName;
      let finalHermanoMayorId: string | undefined;
      let finalHermanoMayorIsMatrimonio = false;
      let finalHermanoMayorMatrimonioId: string | undefined;

      if (editHermanoMayorChoice === 'custom') {
        finalHermanoMayorName = editHermanoMayorCustom.trim() || undefined;
      } else if (editHermanoMayorChoice.startsWith('mat:')) {
        const m = marriages.find((item) => item.id === editHermanoMayorChoice.replace('mat:', ''));
        if (m) {
          finalHermanoMayorName = `${m.spouse1Name} & ${m.spouse2Name}`;
          finalHermanoMayorId = m.id;
          finalHermanoMayorIsMatrimonio = true;
          finalHermanoMayorMatrimonioId = m.id;
        }
      } else if (editHermanoMayorChoice.startsWith('bro:')) {
        const b = availableBrothers.find((item) => item.id === editHermanoMayorChoice.replace('bro:', ''));
        if (b) {
          finalHermanoMayorName = b.name;
          finalHermanoMayorId = b.id;
        }
      }

      // Guardar acompañamiento persistente
      accompanimentService.saveAccompaniment(brother.id, {
        liderCelulaName: finalLiderName,
        liderCelulaId: finalLiderId,
        liderIsMatrimonio: finalLiderIsMatrimonio,
        liderMatrimonioId: finalLiderMatrimonioId,
        acompananteName: finalHermanoMayorName,
        acompananteId: finalHermanoMayorId,
        acompananteIsMatrimonio: finalHermanoMayorIsMatrimonio,
        acompananteMatrimonioId: finalHermanoMayorMatrimonioId,
      });

      if (finalHermanoMayorName) {
        const latestAltar = altarService.setHermanoMayor(brother.id, {
          id: finalHermanoMayorId,
          name: finalHermanoMayorName,
          isMatrimonio: finalHermanoMayorIsMatrimonio,
          matrimonioId: finalHermanoMayorMatrimonioId,
        });
        setAltarData(latestAltar);
      }

      const result = await brothersService.upsertBrotherAsync(
        {
          id: brother.id,
          nombres: nombres || profileNameParts.nombres,
          apellidos: apellidos || profileNameParts.apellidos,
          telefono,
          fechaNacimiento,
          estado: brother.procesoActual,
          fechaIngreso: brother.altar?.fechaInicio || altarData.fechaInicio || undefined,
          fotoUrl: profilePhotoUrl,
        },
        {
          id: user.id,
          name: user.name,
        },
      );

      if (!result.ok) {
        setProfileToastType('error');
        setProfileToastMessage(result.error ?? 'No se pudo guardar la ficha del hermano.');
        setShowToast(true);
        return;
      }

      const refreshedBrother = await brothersService.findByIdAsync(brother.id);
      if (refreshedBrother) {
        setBrother(applyAccompaniment(refreshedBrother));
      } else {
        setBrother((prev) =>
          prev
            ? {
                ...prev,
                name: `${nombres || profileNameParts.nombres} ${apellidos || profileNameParts.apellidos}`.trim(),
                telefono,
                fechaNacimiento,
                acompanamiento: {
                  ...prev.acompanamiento,
                  liderCelulaName: finalLiderName,
                  acompananteName: finalHermanoMayorName,
                },
              }
            : prev
        );
      }

      setIsEditModalOpen(false);
      setProfileToastType('success');
      setProfileToastMessage('Ficha actualizada correctamente.');
      setShowToast(true);
    } catch {
      setProfileToastType('error');
      setProfileToastMessage('No se pudo guardar la ficha.');
      setShowToast(true);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleApplySimulatorState = (patch: Partial<BrotherProfile>) => {
    setBrother((prev) => (prev ? { ...prev, ...patch } : prev));
    if (id) {
      setAltarData(altarService.getAltarInfo(id));
      setGrupoVidaApproval(grupoVidaApprovalService.getApproval(id));
      setLiderCelulaApproval(liderCelulaApprovalService.getApproval(id));
    }
    setProfileToastType('success');
    setProfileToastMessage('Simulador: Datos de etapa actualizados.');
    setShowToast(true);
  };

  const discipleName = normalizeName(brother?.name ?? '');
  const disciplesAltarBrothers = brother
    ? brothersService.list().filter((entry) => {
        const info = altarService.getAltarInfo(entry.id);
        if (info.hermanoMayorId === brother.id || (info.hermanoMayorName && normalizeName(info.hermanoMayorName) === discipleName)) {
          return true;
        }
        return (entry.altar?.realizadoPor ?? []).some((responsable) => normalizeName(responsable) === discipleName);
      })
    : [];

  const getAltarTrackingStatus = (entry: (typeof disciplesAltarBrothers)[number]): AltarTrackingStatus => {
    const info = altarService.getAltarInfo(entry.id);
    return computeAltarStatus({
      isInterrumpido: info.isInterrumpido || Boolean(entry.altar?.interrumpido),
      fechaInicio: info.fechaInicio || entry.altar?.fechaInicio,
      fechaFin: info.fechaFin || entry.altar?.fechaFin,
    });
  };

  const inProcessCount = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'EN_PROCESO').length;
  const finalized = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'FINALIZADO').length;
  const interrupted = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'INTERRUMPIDO').length;
  const sinAltarCount = disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'SIN_ALTAR').length;
  const altarTrackingSummary = {
    opened: disciplesAltarBrothers.length,
    enProceso: inProcessCount,
    finalized,
    interrupted,
    sinAltar: sinAltarCount,
  };

  const minAltaresConfig = discipleshipConfigService.getMinAltaresForGrupoVida();
  const grupoVidaMembers = useMemo(
    () => disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'FINALIZADO'),
    [disciplesAltarBrothers]
  );
  const hasReachedThreshold = altarTrackingSummary.finalized >= minAltaresConfig;
  const isGrupoVidaApproved = grupoVidaApproval.isAprobado;
  const canApproveGrupoVida = [Role.APOSTOL, Role.SUPERADMIN, Role.LIDER_CELULA, Role.PASTOR].includes(currentUserRole);

  const handleApproveGrupoVida = () => {
    if (!brother) return;
    const actorRole = currentUserRole;
    const actorName = user?.name || (actorRole === Role.APOSTOL ? 'Apóstol' : actorRole === Role.LIDER_CELULA ? 'Líder de Célula' : 'Pastor');
    const updated = grupoVidaApprovalService.approveGrupoVida(
      brother.id,
      {
        id: user?.id,
        name: actorName,
        role: actorRole,
      },
      grupoVidaNombreDraft.trim() || undefined
    );
    setGrupoVidaApproval(updated);

    // Congelar estadísticas de Etapa 4 al ser promovido a Hermano Mayor
    const updatedFrozen = stageFrozenStatsService.freezeStage4(brother.id, {
      opened: altarTrackingSummary.opened,
      finalized: altarTrackingSummary.finalized,
      interrupted: altarTrackingSummary.interrupted,
      frozenBy: {
        name: actorName,
        role: actorRole,
      },
    });
    setFrozenStages(updatedFrozen);

    setIsApproveGrupoVidaModalOpen(false);
    setProfileToastType('success');
    setProfileToastMessage('¡Apertura de Grupo de Vida aprobada! Las estadísticas de Etapa 4 se han congelado y el hermano avanza a Etapa 5: Hermano Mayor.');
    setShowToast(true);
  };

  const handleRevokeGrupoVida = () => {
    if (!brother) return;
    const updated = grupoVidaApprovalService.revokeGrupoVida(brother.id);
    setGrupoVidaApproval(updated);
    const updatedFrozen = stageFrozenStatsService.unfreezeStage4(brother.id);
    setFrozenStages(updatedFrozen);
    setProfileToastType('info');
    setProfileToastMessage('Aprobación de Grupo de Vida revocada.');
    setShowToast(true);
  };

  // Discípulos a cargo del hermano mayor / célula
  const myMentoredBrothers = useMemo(() => {
    if (!brother) return [];
    const bName = normalizeName(brother.name);
    return brothersService.list().filter((entry) => {
      if (entry.id === brother.id) return false;
      const info = altarService.getAltarInfo(entry.id);
      const accName = normalizeName(entry.acompanamiento?.acompananteName || '');
      if (info.hermanoMayorId === brother.id || (info.hermanoMayorName && normalizeName(info.hermanoMayorName) === bName)) {
        return true;
      }
      if (accName && (accName === bName || accName.includes(bName))) {
        return true;
      }
      return (entry.altar?.realizadoPor ?? []).some((responsable) => normalizeName(responsable) === bName);
    });
  }, [brother]);

  // Discípulos Conectores: hermanos que ya alcanzaron la etapa 4 (Discípulo Conector)
  const discipulosConectoresList = useMemo(() => {
    return myMentoredBrothers.filter((entry) => {
      const savedDates = stageDatesService.getBrotherStageDates(entry.id);
      return (
        entry.procesoActual === Proceso.DISCIPULO ||
        Boolean(entry.discipulo?.fechaInicio) ||
        Boolean(savedDates?.discipuloFechaInicio)
      );
    });
  }, [myMentoredBrothers]);

  // Altares finalizados que se convirtieron en Discípulos Conectores
  const altaresFinalizadosConectores = useMemo(() => {
    const fromAltars = disciplesAltarBrothers.filter((entry) => {
      const isFinalized = getAltarTrackingStatus(entry) === 'FINALIZADO';
      if (!isFinalized) return false;
      const savedDates = stageDatesService.getBrotherStageDates(entry.id);
      return (
        entry.procesoActual === Proceso.DISCIPULO ||
        Boolean(entry.discipulo?.fechaInicio) ||
        Boolean(savedDates?.discipuloFechaInicio)
      );
    });

    const set = new Set(fromAltars.map((b) => b.id));
    for (const b of discipulosConectoresList) {
      if (!set.has(b.id)) {
        fromAltars.push(b);
        set.add(b.id);
      }
    }
    return fromAltars;
  }, [disciplesAltarBrothers, discipulosConectoresList]);

  // Hermanos Menores: hermanos en proceso de convertirse en discípulos conectores
  const hermanosMenoresList = useMemo(() => {
    return myMentoredBrothers.filter((entry) => {
      const savedDates = stageDatesService.getBrotherStageDates(entry.id);
      const isConector =
        entry.procesoActual === Proceso.DISCIPULO ||
        Boolean(entry.discipulo?.fechaInicio) ||
        Boolean(savedDates?.discipuloFechaInicio);
      return !isConector;
    });
  }, [myMentoredBrothers]);

  const minDiscipulosConfig = discipleshipConfigService.getMinDiscipulosForLiderCelula();
  const hasReachedLiderCelulaThreshold = altaresFinalizadosConectores.length >= minDiscipulosConfig;
  const isLiderCelulaApproved = liderCelulaApproval.isAprobado;
  const canApproveLiderCelula = [Role.APOSTOL, Role.SUPERADMIN, Role.PASTOR, Role.LIDER_RED_CELULAS].includes(currentUserRole);

  // Estadísticas congeladas o activas para Etapa 4
  const stage4Stats = useMemo(() => {
    if (isGrupoVidaApproved) {
      if (frozenStages.stage4) {
        return frozenStages.stage4;
      }
      return {
        opened: altarTrackingSummary.opened,
        finalized: altarTrackingSummary.finalized,
        interrupted: altarTrackingSummary.interrupted,
        frozenAt: grupoVidaApproval.approvedAt || new Date().toISOString(),
      };
    }
    return altarTrackingSummary;
  }, [isGrupoVidaApproved, frozenStages.stage4, altarTrackingSummary, grupoVidaApproval.approvedAt]);

  // Estadísticas congeladas o activas para Etapa 5
  const stage5Stats = useMemo(() => {
    if (isLiderCelulaApproved) {
      if (frozenStages.stage5) {
        return frozenStages.stage5;
      }
      return {
        opened: altarTrackingSummary.opened,
        finalized: altarTrackingSummary.finalized,
        interrupted: altarTrackingSummary.interrupted,
        conectores: altaresFinalizadosConectores.length,
        frozenAt: liderCelulaApproval.fechaAprobacion || new Date().toISOString(),
      };
    }
    return {
      opened: altarTrackingSummary.opened,
      finalized: altarTrackingSummary.finalized,
      interrupted: altarTrackingSummary.interrupted,
      conectores: altaresFinalizadosConectores.length,
    };
  }, [isLiderCelulaApproved, frozenStages.stage5, altarTrackingSummary, altaresFinalizadosConectores.length, liderCelulaApproval.fechaAprobacion]);

  const handleApproveLiderCelula = () => {
    if (!brother) return;
    const actorRole = currentUserRole;
    const actorName = user?.name || (actorRole === Role.APOSTOL ? 'Apóstol' : 'Pastor');
    const updated = liderCelulaApprovalService.approveLiderCelula(
      brother.id,
      {
        id: user?.id,
        name: actorName,
        role: actorRole,
      }
    );
    setLiderCelulaApproval(updated);

    // Congelar estadísticas de Etapa 5 al ser promovido a Líder de Célula
    const updatedFrozen = stageFrozenStatsService.freezeStage5(brother.id, {
      opened: stage5Stats.opened,
      finalized: stage5Stats.finalized,
      interrupted: stage5Stats.interrupted,
      conectores: altaresFinalizadosConectores.length,
      frozenBy: {
        name: actorName,
        role: actorRole,
      },
    });
    setFrozenStages(updatedFrozen);

    setIsApproveLiderCelulaModalOpen(false);
    setProfileToastType('success');
    setProfileToastMessage('¡Pre-aprobación para Líder de Célula concedida! Las estadísticas de Etapa 5 se han congelado y el hermano avanza a Etapa 6.');
    setShowToast(true);
  };

  const handleRevokeLiderCelula = () => {
    if (!brother) return;
    const updated = liderCelulaApprovalService.revokeApproval(brother.id);
    setLiderCelulaApproval(updated);
    const updatedFrozen = stageFrozenStatsService.unfreezeStage5(brother.id);
    setFrozenStages(updatedFrozen);
    setProfileToastType('info');
    setProfileToastMessage('Pre-aprobación de Líder de Célula revocada.');
    setShowToast(true);
  };

  const filteredDisciplesAltarBrothers =
    discipuloAltarsFilter === 'FINALIZADOS'
      ? disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'FINALIZADO')
      : discipuloAltarsFilter === 'INTERRUMPIDOS'
        ? disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'INTERRUMPIDO')
        : discipuloAltarsFilter === 'EN_PROCESO'
          ? disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'EN_PROCESO')
          : discipuloAltarsFilter === 'SIN_ALTAR'
            ? disciplesAltarBrothers.filter((entry) => getAltarTrackingStatus(entry) === 'SIN_ALTAR')
            : discipuloAltarsFilter === 'CONECTORES'
              ? altaresFinalizadosConectores
              : disciplesAltarBrothers;

  const selectedDiscipuloAltarBrother = useMemo(() => {
    if (!selectedDiscipuloAltarBrotherId) return undefined;
    return (
      disciplesAltarBrothers.find((entry) => entry.id === selectedDiscipuloAltarBrotherId) ||
      altaresFinalizadosConectores.find((entry) => entry.id === selectedDiscipuloAltarBrotherId) ||
      brothersService.findById(selectedDiscipuloAltarBrotherId)
    );
  }, [selectedDiscipuloAltarBrotherId, disciplesAltarBrothers, altaresFinalizadosConectores]);

  const selectedBrotherIndex = useMemo(() => {
    if (!selectedDiscipuloAltarBrother) return -1;
    return filteredDisciplesAltarBrothers.findIndex((b) => b.id === selectedDiscipuloAltarBrother.id);
  }, [selectedDiscipuloAltarBrother, filteredDisciplesAltarBrothers]);

  const prevAltarBrother =
    selectedBrotherIndex > 0 ? filteredDisciplesAltarBrothers[selectedBrotherIndex - 1] : null;
  const nextAltarBrother =
    selectedBrotherIndex >= 0 && selectedBrotherIndex < filteredDisciplesAltarBrothers.length - 1
      ? filteredDisciplesAltarBrothers[selectedBrotherIndex + 1]
      : null;

  const selectedAltarInfo = useMemo(() => {
    if (!selectedDiscipuloAltarBrother) return null;
    return altarService.getAltarInfo(selectedDiscipuloAltarBrother.id);
  }, [selectedDiscipuloAltarBrother]);

  const selectedTalentsText = useMemo(() => {
    if (!selectedDiscipuloAltarBrother) return '';
    return talentsService.getTalents(selectedDiscipuloAltarBrother.id);
  }, [selectedDiscipuloAltarBrother]);

  const selectedBrotherProcessSummary = (() => {
    if (!selectedDiscipuloAltarBrother) {
      return [];
    }

    const savedDates = stageDatesService.getBrotherStageDates(selectedDiscipuloAltarBrother.id);
    const altarInfo = selectedAltarInfo || altarService.getAltarInfo(selectedDiscipuloAltarBrother.id);
    const eddiInfo = eddiModuleService.getBrotherEddiTracking(selectedDiscipuloAltarBrother.id);
    const edemInfo = edemModuleService.getBrotherEdemTracking(selectedDiscipuloAltarBrother.id);

    const processEntries = [
      {
        key: Proceso.ALTAR,
        label: 'Etapa 1: Altar',
        startDate: altarInfo.fechaInicio || selectedDiscipuloAltarBrother.altar?.fechaInicio,
        endDate: altarInfo.fechaFin || selectedDiscipuloAltarBrother.altar?.fechaFin,
        observations: selectedDiscipuloAltarBrother.altar?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.GRUPO,
        label: 'Etapa 2: Hermano Menor (Grupo de Vida)',
        startDate: savedDates?.grupoFechaInicio || selectedDiscipuloAltarBrother.grupo?.fechaInicio,
        endDate: savedDates?.grupoFechaFin || selectedDiscipuloAltarBrother.grupo?.fechaFin,
        observations: selectedDiscipuloAltarBrother.grupo?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EXPERIENCIA,
        label: 'Experiencia con Dios',
        startDate: savedDates?.experienciaFechaRealizacion || selectedDiscipuloAltarBrother.experiencia?.fechaRealizacion,
        endDate: savedDates?.experienciaFechaRealizacion || selectedDiscipuloAltarBrother.experiencia?.fechaRealizacion,
        observations: selectedDiscipuloAltarBrother.experiencia?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EDDI,
        label: 'Etapa 3: EDDI Escuela de Discipulados',
        startDate: savedDates?.eddiFechaInicio || selectedDiscipuloAltarBrother.eddi?.fechaInicio,
        endDate: savedDates?.eddiFechaFin || selectedDiscipuloAltarBrother.eddi?.fechaFin,
        observations: selectedDiscipuloAltarBrother.eddi?.observaciones ?? [],
        grades: (eddiInfo.grades && eddiInfo.grades.length > 0) ? eddiInfo.grades : (selectedDiscipuloAltarBrother.eddi?.notasExamenes ?? []),
      },
      {
        key: Proceso.DISCIPULO,
        label: 'Etapa 4: Discípulo Conector',
        startDate: savedDates?.discipuloFechaInicio || selectedDiscipuloAltarBrother.discipulo?.fechaInicio,
        endDate: savedDates?.discipuloFechaFin,
        observations: selectedDiscipuloAltarBrother.discipulo?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EDEM,
        label: 'Etapa 7: EDEM Escuela Ministerial',
        startDate: savedDates?.edemFechaInicio || selectedDiscipuloAltarBrother.edem?.fechaInicio,
        endDate: savedDates?.edemFechaFin || selectedDiscipuloAltarBrother.edem?.fechaFin,
        observations: selectedDiscipuloAltarBrother.edem?.observaciones ?? [],
        grades: (edemInfo.grades && edemInfo.grades.length > 0) ? edemInfo.grades : (selectedDiscipuloAltarBrother.edem?.notasExamenes ?? []),
      },
    ];

    return processEntries.filter((entry) => Boolean(entry.startDate || entry.endDate || (entry.grades && entry.grades.length > 0)));
  })();

  const selectedGrupoVidaMember = useMemo(() => {
    if (!selectedGrupoVidaMemberId) return null;
    return (
      grupoVidaMembers.find((b) => b.id === selectedGrupoVidaMemberId) ||
      brothersService.findById(selectedGrupoVidaMemberId)
    );
  }, [selectedGrupoVidaMemberId, grupoVidaMembers]);

  const selectedGrupoVidaMemberIndex = useMemo(() => {
    if (!selectedGrupoVidaMember) return -1;
    return grupoVidaMembers.findIndex((b) => b.id === selectedGrupoVidaMember.id);
  }, [selectedGrupoVidaMember, grupoVidaMembers]);

  const prevGrupoVidaMember =
    selectedGrupoVidaMemberIndex > 0 ? grupoVidaMembers[selectedGrupoVidaMemberIndex - 1] : null;
  const nextGrupoVidaMember =
    selectedGrupoVidaMemberIndex >= 0 && selectedGrupoVidaMemberIndex < grupoVidaMembers.length - 1
      ? grupoVidaMembers[selectedGrupoVidaMemberIndex + 1]
      : null;

  const selectedGrupoVidaAltarInfo = useMemo(() => {
    if (!selectedGrupoVidaMember) return null;
    return altarService.getAltarInfo(selectedGrupoVidaMember.id);
  }, [selectedGrupoVidaMember]);

  const selectedGrupoVidaTalentsText = useMemo(() => {
    if (!selectedGrupoVidaMember) return '';
    return talentsService.getTalents(selectedGrupoVidaMember.id);
  }, [selectedGrupoVidaMember]);

  const selectedGrupoVidaProcessSummary = useMemo(() => {
    if (!selectedGrupoVidaMember) {
      return [];
    }

    const savedDates = stageDatesService.getBrotherStageDates(selectedGrupoVidaMember.id);
    const altarInfo = selectedGrupoVidaAltarInfo || altarService.getAltarInfo(selectedGrupoVidaMember.id);
    const eddiInfo = eddiModuleService.getBrotherEddiTracking(selectedGrupoVidaMember.id);
    const edemInfo = edemModuleService.getBrotherEdemTracking(selectedGrupoVidaMember.id);

    const processEntries = [
      {
        key: Proceso.ALTAR,
        label: 'Etapa 1: Altar',
        startDate: altarInfo.fechaInicio || selectedGrupoVidaMember.altar?.fechaInicio,
        endDate: altarInfo.fechaFin || selectedGrupoVidaMember.altar?.fechaFin,
        observations: selectedGrupoVidaMember.altar?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.GRUPO,
        label: 'Etapa 2: Hermano Menor (Grupo de Vida)',
        startDate: savedDates?.grupoFechaInicio || selectedGrupoVidaMember.grupo?.fechaInicio,
        endDate: savedDates?.grupoFechaFin || selectedGrupoVidaMember.grupo?.fechaFin,
        observations: selectedGrupoVidaMember.grupo?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EXPERIENCIA,
        label: 'Experiencia con Dios',
        startDate: savedDates?.experienciaFechaRealizacion || selectedGrupoVidaMember.experiencia?.fechaRealizacion,
        endDate: savedDates?.experienciaFechaRealizacion || selectedGrupoVidaMember.experiencia?.fechaRealizacion,
        observations: selectedGrupoVidaMember.experiencia?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EDDI,
        label: 'Etapa 3: EDDI Escuela de Discipulados',
        startDate: savedDates?.eddiFechaInicio || selectedGrupoVidaMember.eddi?.fechaInicio,
        endDate: savedDates?.eddiFechaFin || selectedGrupoVidaMember.eddi?.fechaFin,
        observations: selectedGrupoVidaMember.eddi?.observaciones ?? [],
        grades: (eddiInfo.grades && eddiInfo.grades.length > 0) ? eddiInfo.grades : (selectedGrupoVidaMember.eddi?.notasExamenes ?? []),
      },
      {
        key: Proceso.DISCIPULO,
        label: 'Etapa 4: Discípulo Conector',
        startDate: savedDates?.discipuloFechaInicio || selectedGrupoVidaMember.discipulo?.fechaInicio,
        endDate: savedDates?.discipuloFechaFin,
        observations: selectedGrupoVidaMember.discipulo?.observaciones ?? [],
        grades: [],
      },
      {
        key: Proceso.EDEM,
        label: 'Etapa 7: EDEM Escuela Ministerial',
        startDate: savedDates?.edemFechaInicio || selectedGrupoVidaMember.edem?.fechaInicio,
        endDate: savedDates?.edemFechaFin || selectedGrupoVidaMember.edem?.fechaFin,
        observations: selectedGrupoVidaMember.edem?.observaciones ?? [],
        grades: (edemInfo.grades && edemInfo.grades.length > 0) ? edemInfo.grades : (selectedGrupoVidaMember.edem?.notasExamenes ?? []),
      },
    ];

    return processEntries.filter((entry) => Boolean(entry.startDate || entry.endDate || (entry.grades && entry.grades.length > 0)));
  }, [selectedGrupoVidaMember, selectedGrupoVidaAltarInfo]);

  const openObservationComposer = (process: Proceso) => {
    setObservationComposerByProcess(() => ({
      [Proceso.ALTAR]: process === Proceso.ALTAR,
      [Proceso.GRUPO]: process === Proceso.GRUPO,
      [Proceso.EXPERIENCIA]: process === Proceso.EXPERIENCIA,
      [Proceso.EDDI]: process === Proceso.EDDI,
      [Proceso.DISCIPULO]: process === Proceso.DISCIPULO,
      [Proceso.EDEM]: process === Proceso.EDEM,
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

  const visibleObservations = observationsOwnerId === id ? observations : EMPTY_OBSERVATIONS;

  const observationsByProcess: Record<Proceso, Observation[]> = {
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
    [Proceso.EDEM]: visibleObservations
      .filter((obs) => obs.process === Proceso.EDEM)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  };

  const stage2Observations = useMemo(() => {
    const grupoObs = observationsByProcess[Proceso.GRUPO] || [];
    const expObs = observationsByProcess[Proceso.EXPERIENCIA] || [];
    if (expObs.length === 0) return grupoObs;
    return [...grupoObs, ...expObs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [observationsByProcess]);

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
      setProfileToastType('success');
      setProfileToastMessage('Observación guardada correctamente.');
      setShowToast(true);
    } catch {
      setProfileToastType('error');
      setProfileToastMessage('No se pudo guardar la observación. Revisá permisos de Supabase.');
      setShowToast(true);
      return;
    } finally {
      observationSavingLockRef.current[process] = false;
      setObservationSavingByProcess((previous) => ({
        ...previous,
        [process]: false,
      }));
    }
  };

  const startEditObservation = (entry: Observation) => {
    setEditingObservationId(entry.id);
    setObservationEditDraftById((previous) => ({
      ...previous,
      [entry.id]: entry.text,
    }));
  };

  const cancelEditObservation = () => {
    setEditingObservationId(null);
  };

  const updateObservationEditDraft = (entryId: string, value: string) => {
    setObservationEditDraftById((previous) => ({
      ...previous,
      [entryId]: value,
    }));
  };

  const saveObservationEdit = async (entry: Observation) => {
    const nextText = (observationEditDraftById[entry.id] ?? '').trim();
    if (!nextText || mutatingObservationId) {
      return;
    }

    setMutatingObservationId(entry.id);
    try {
      const saved = await updateObservation(entry.id, {
        text: nextText,
        author: entry.author,
        role: entry.role,
        process: entry.process,
      });

      setObservations((previous) =>
        previous.map((current) =>
          current.id === entry.id
            ? {
                ...current,
                ...saved,
                text: saved.text || nextText,
                process: saved.process ?? current.process,
                brotherId: saved.brotherId ?? current.brotherId,
              }
            : current
        )
      );
      setEditingObservationId(null);
      setObservationEditDraftById((previous) => {
        const { [entry.id]: _removed, ...rest } = previous;
        return rest;
      });
      setProfileToastType('success');
      setProfileToastMessage('Observación actualizada correctamente.');
      setShowToast(true);
    } catch {
      setProfileToastType('error');
      setProfileToastMessage('No se pudo actualizar la observación. Revisá permisos de Supabase.');
      setShowToast(true);
    } finally {
      setMutatingObservationId(null);
    }
  };

  const removeObservation = async (entry: Observation) => {
    if (mutatingObservationId) {
      return;
    }

    setMutatingObservationId(entry.id);
    try {
      await deleteObservation(entry.id);
      setObservations((previous) => previous.filter((current) => current.id !== entry.id));
      if (editingObservationId === entry.id) {
        setEditingObservationId(null);
      }
      setProfileToastType('success');
      setProfileToastMessage('Observación eliminada correctamente.');
      setShowToast(true);
    } catch {
      setProfileToastType('error');
      setProfileToastMessage('No se pudo eliminar la observación. Revisá permisos de Supabase.');
      setShowToast(true);
    } finally {
      setMutatingObservationId(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white pb-20 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-8 space-y-10">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 bg-white dark:bg-[#1a1a1a] p-5 sm:p-6 md:p-7 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden mt-3 md:mt-4">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
            <ShieldCheck size={180} className="text-[#c5a059]" />
          </div>

          <button
            onClick={() => navigate('/hermanos')}
            className="absolute top-4 left-4 sm:top-5 sm:left-5 p-2.5 sm:p-3 bg-slate-100 dark:bg-black/40 rounded-xl text-slate-500 dark:text-gray-400 hover:text-[#c5a059] transition-all border border-slate-200 dark:border-white/5 active:scale-95 z-20"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>

          <div className="relative z-10 mt-10 md:mt-0 w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_350px] gap-6 lg:gap-8 items-center">
            {/* Lateral Izquierdo: Identidad y Edición */}
            <div className="min-w-0 flex flex-col items-center md:items-start gap-4">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 w-full">
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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#c5a059]/20 to-transparent flex items-center justify-center text-[#c5a059] font-black text-4xl sm:text-5xl md:text-6xl shadow-[0_0_40px_rgba(197,160,89,0.2)] overflow-hidden border-2 border-[#c5a059]/30 relative transition-transform duration-500 group-hover:scale-[1.02]">
                    {profilePhotoUrl ? (
                      <img src={profilePhotoUrl} alt={brother.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="drop-shadow-lg">{brother.name.charAt(0)}</span>
                    )}

                    <div className="absolute inset-0 pointer-events-none bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 backdrop-blur-md">
                      <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 flex items-center justify-center">
                        <Camera className="text-[#c5a059]" size={18} />
                      </div>
                      <span className="text-[8px] uppercase font-black text-[#c5a059] tracking-widest">Foto</span>
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
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-2">
                    <span className="text-[9px] uppercase tracking-[0.35em] font-black text-[#c5a059]">Ficha Personal</span>
                    <div className="hidden sm:block h-[1px] w-8 bg-[#c5a059]/30" />
                    <span className="bg-[#c5a059] text-black px-3 py-1 rounded-full text-[8px] uppercase tracking-[0.18em] font-black shadow-md">
                      {progression.currentStageBadgeLabel}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#c5a059] uppercase break-words mb-3" style={{ textShadow: '0 4px 16px rgba(197,160,89,0.3)' }}>
                    {brother.name}
                  </h1>

                  {canEditProfile && (
                    <button
                      onClick={() => {
                        initAccompanimentSelectors(brother);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#c5a059]/10 to-[#c5a059]/20 hover:from-[#c5a059] hover:to-[#d4af37] text-[#c5a059] hover:text-black border border-[#c5a059]/40 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                    >
                      <Edit2 size={14} />
                      <span>Editar Ficha</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lateral Derecho: Fichas de información compactas una debajo de otra */}
            <div className="flex flex-col gap-2 w-full">
              {/* 1. Célula */}
              <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-black/50 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="text-[#c5a059]" size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 leading-none mb-0.5">Célula</p>
                  <p className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-gray-100 truncate">{acompanamiento.celulaName || 'Sin asignar'}</p>
                </div>
              </div>

              {/* 2. Líderes */}
              <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-black/50 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="text-[#c5a059]" size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 leading-none mb-0.5">Líderes</p>
                  <p className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-gray-100 break-words leading-tight">{acompanamiento.liderCelulaName || 'No asignados'}</p>
                </div>
              </div>

              {/* 3. Hermano Mayor */}
              <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-black/50 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-[#c5a059]" size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 leading-none mb-0.5">Hermano Mayor</p>
                  <p className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-gray-100 truncate">{acompanamiento.acompananteName || 'No asignado'}</p>
                </div>
              </div>

              {/* 4. Edad */}
              <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-black/50 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="text-[#c5a059]" size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 leading-none mb-0.5">Edad</p>
                  <p className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-gray-100">
                    {brother.edad ? `${brother.edad} años` : 'No registrada'}
                  </p>
                </div>
              </div>

              {/* 5. Contacto */}
              <div className="flex items-center gap-3 bg-[#f8fafc] dark:bg-black/50 px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="text-[#c5a059]" size={15} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[8px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 leading-none mb-0.5">Contacto</p>
                  <p className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-gray-100 truncate">{brother.telefono || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-8 pt-4">
          <section className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-[0.12em] text-slate-900 dark:text-white flex items-center gap-2.5">
                <Music2 size={18} className="text-[#c5a059]" />
                Talentos y dones de servicio
              </h2>

              {canEditProfile && !isEditingTalents && (
                <button
                  type="button"
                  onClick={() => setIsEditingTalents(true)}
                  className="px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Edit2 size={13} />
                  <span>{talentsText.trim() ? 'Editar' : 'Agregar'}</span>
                </button>
              )}
            </div>

            {isEditingTalents ? (
              <div className="space-y-3">
                <textarea
                  value={talentsText}
                  onChange={(e) => setTalentsText(e.target.value)}
                  placeholder="Escribe libremente los talentos musicales, técnicos, manuales, dones espirituales, vocaciones y áreas de servicio de este hermano..."
                  rows={4}
                  className="w-full bg-[#f8fafc] dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] outline-none shadow-inner resize-y transition-all"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTalentsText(talentsService.getTalents(brother.id));
                      setIsEditingTalents(false);
                    }}
                    className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTalents}
                    disabled={isSavingTalents}
                    className="px-5 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-black hover:opacity-95 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Save size={13} />
                    <span>{isSavingTalents ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                </div>
              </div>
            ) : talentsText.trim() ? (
              <div className="bg-[#f8fafc] dark:bg-black/35 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                <p className="text-sm text-slate-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {talentsText}
                </p>
              </div>
            ) : (
              <div
                onClick={() => canEditProfile && setIsEditingTalents(true)}
                className={`rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center ${
                  canEditProfile ? 'cursor-pointer hover:border-[#c5a059]/50 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors' : ''
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                  {canEditProfile
                    ? 'No hay talentos o dones registrados aún. Haz clic aquí o en "Agregar" para escribir los talentos y áreas de servicio.'
                    : 'No tiene talentos o dones registrados.'}
                </p>
              </div>
            )}
          </section>

          <div className="flex items-center gap-6 px-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Línea de Vida</h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#c5a059]/30 to-transparent" />
          </div>

          <div className="flex flex-col gap-6">
            <StageWrapper
              brotherId={id ?? ''}
              number={1}
              title="Altar"
              isCurrent={progression.currentStageNumber === 1}
              isCompleted={progression.isStageCompleted(1)}
              isLocked={progression.isStageLocked(1)}
              lockedReason={progression.stageCompletionDetails[1]?.reasonIfIncomplete}
              isEditing={editingStage === 1}
              isOtherStageEditing={editingStage !== null && editingStage !== 1}
              canEdit={canManageAltar}
              onStartEdit={handleStartEditStage1}
              onCancelEdit={handleCancelEditStage1}
              onSaveEdit={handleSaveStage1}
              rightTitle="Observaciones"
              rightEntries={observationsByProcess[Proceso.ALTAR]}
              rightEmpty="Sin observaciones en esta etapa."
              isComposerOpen={observationComposerByProcess[Proceso.ALTAR]}
              isSavingObservation={observationSavingByProcess[Proceso.ALTAR]}
              draftValue={observationDraftByProcess[Proceso.ALTAR]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.ALTAR)}
              onComposerClose={() => closeObservationComposer(Proceso.ALTAR)}
              onDraftChange={(value) => updateObservationDraft(Proceso.ALTAR, value)}
              onSaveObservation={() => saveObservation(Proceso.ALTAR)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              {editingStage === 1 ? (
                <div className="space-y-4 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fecha Inicio */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha de Inicio
                        </label>
                        {altarStartDateDraft && (
                          <button
                            type="button"
                            onClick={() => setAltarStartDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={altarStartDateDraft}
                        onChange={(e) => setAltarStartDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 block">
                        Activa &quot;En Proceso&quot;
                      </span>
                    </div>

                    {/* Fecha Fin */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha de Fin
                        </label>
                        {altarEndDateDraft && (
                          <button
                            type="button"
                            onClick={() => setAltarEndDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={altarEndDateDraft}
                        onChange={(e) => setAltarEndDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                      />
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 block">
                        Activa &quot;Finalizado&quot;
                      </span>
                    </div>
                  </div>

                  <ApproximateDateHint />

                  {/* Selector de Hermano Mayor */}
                  <div className="space-y-1.5 pt-2 border-t border-[#c5a059]/20">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                      Hermano Mayor o Matrimonio a cargo del Altar
                    </label>
                    <select
                      value={altarHermanoMayorDraft}
                      onChange={(e) => setAltarHermanoMayorDraft(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059]"
                    >
                      <option value="">Sin asignar</option>
                      {marriages.length > 0 && (
                        <optgroup label="Matrimonios">
                          {marriages.map((m) => (
                            <option key={`altar-mat-${m.id}`} value={`mat:${m.id}`}>
                              {m.spouse1Name} & {m.spouse2Name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="👤 HERMANOS INDIVIDUALES">
                        {availableBrothers.map((b) => (
                          <option key={`altar-bro-${b.id}`} value={`bro:${b.id}`}>
                            {b.name} ({b.cellName})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Estado del Altar y Opciones */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#c5a059]/20">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        Estado resultante:
                      </span>
                      {altarData.isInterrumpido ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Altar Interrumpido
                        </span>
                      ) : altarEndDateDraft ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                          Altar Finalizado
                        </span>
                      ) : altarStartDateDraft ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                          Altar En Proceso
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-600 dark:text-gray-400 border border-slate-500/30 shadow-sm">
                          Sin Altar
                        </span>
                      )}
                    </div>

                    {altarData.isInterrumpido ? (
                      <button
                        type="button"
                        onClick={handleResumeAltar}
                        className="px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-black bg-white dark:bg-black text-slate-800 dark:text-gray-100 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shadow-sm shrink-0 active:scale-95"
                      >
                        Reanudar Altar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsInterruptModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-black border border-rose-400/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <AlertTriangle size={13} />
                        <span>Indicar Altar Interrumpido</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start sm:items-end justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
                          Inicio
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">
                          {displayDate(altarData.fechaInicio || brother.altar?.fechaInicio)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
                          Fin
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">
                          {displayDate(altarData.fechaFin || brother.altar?.fechaFin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Panel de Seguimiento del Altar y Hermano Mayor */}
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 p-4 sm:p-5 space-y-4 shadow-sm w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#c5a059]/10 rounded-xl text-[#c5a059]">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 dark:text-gray-500">
                            Hermano Mayor a cargo del Altar
                          </p>
                          <p className="font-bold text-sm text-slate-800 dark:text-gray-100">
                            {hermanoMayorName || 'Sin asignar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {currentAltarStatus === 'INTERRUMPIDO' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Altar Interrumpido
                          </span>
                        ) : currentAltarStatus === 'FINALIZADO' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                            Altar Finalizado
                          </span>
                        ) : currentAltarStatus === 'EN_PROCESO' ? (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-sm">
                            Altar En Proceso
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/15 text-slate-600 dark:text-gray-400 border border-slate-500/30 shadow-sm">
                            Sin Altar
                          </span>
                        )}
                      </div>
                    </div>

                    {altarData.isInterrumpido && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                              Motivo: {altarData.motivoInterrupcion || 'No especificado'}
                            </p>
                          </div>
                          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 pl-6">
                            {altarData.fechaInterrupcion ? `Registrado el ${new Date(altarData.fechaInterrupcion).toLocaleDateString()}` : ''}
                            {altarData.interrumpidoPor?.name ? ` por ${altarData.interrumpidoPor.name}` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={2}
              title="Hermano Menor"
              isCurrent={progression.currentStageNumber === 2}
              isCompleted={progression.isStageCompleted(2)}
              isLocked={progression.isStageLocked(2)}
              lockedReason={progression.stageCompletionDetails[2]?.reasonIfIncomplete}
              isEditing={editingStage === 2}
              isOtherStageEditing={editingStage !== null && editingStage !== 2}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage2}
              onCancelEdit={handleCancelEditStage2}
              onSaveEdit={handleSaveStage2}
              rightTitle="Observaciones"
              rightEntries={stage2Observations}
              rightEmpty="Sin observaciones añadidas."
              isComposerOpen={observationComposerByProcess[Proceso.GRUPO]}
              isSavingObservation={observationSavingByProcess[Proceso.GRUPO]}
              draftValue={observationDraftByProcess[Proceso.GRUPO]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.GRUPO)}
              onComposerClose={() => closeObservationComposer(Proceso.GRUPO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.GRUPO, value)}
              onSaveObservation={() => saveObservation(Proceso.GRUPO)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              {editingStage === 2 ? (
                <div className="space-y-4 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                  {/* Edición Experiencia Transformadora */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-[#c5a059]" />
                        Experiencia Transformadora (Fecha)
                      </label>
                      {experienciaDateDraft && (
                        <button
                          type="button"
                          onClick={() => setExperienciaDateDraft('')}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                        >
                          Quitar fecha
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={experienciaDateDraft}
                      onChange={(e) => setExperienciaDateDraft(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-slate-400 dark:text-gray-500">Estado:</span>
                      <span
                        className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          experienciaDateDraft
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-white/10'
                        }`}
                      >
                        {experienciaDateDraft ? 'Realizada' : 'Pendiente'}
                      </span>
                    </div>
                    <ApproximateDateHint />
                  </div>

                  {/* Edición Grupo de Vida Fechas */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Users size={13} className="text-[#c5a059]" />
                        Fechas Grupo de Vida
                      </label>
                      {brother.grupo?.interrumpido ? (
                        <button
                          type="button"
                          onClick={handleResumeGrupoVida}
                          className="px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold bg-white dark:bg-black text-slate-800 dark:text-gray-100 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all shadow-sm shrink-0 active:scale-95 flex items-center gap-1"
                        >
                          <RotateCcw size={11} />
                          <span>Reanudar Grupo</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsGrupoInterruptModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold border border-rose-400/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                        >
                          <AlertTriangle size={11} />
                          <span>Indicar Interrumpido</span>
                        </button>
                      )}
                    </div>

                    {brother.grupo?.interrumpido && (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                          Grupo de Vida marcado como interrumpido (el hermano dejó de asistir).
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">Inicio</span>
                          {grupoStartDateDraft && (
                            <button
                              type="button"
                              onClick={() => setGrupoStartDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={grupoStartDateDraft}
                          onChange={(e) => setGrupoStartDateDraft(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold">Fin (Inicio EDDI)</span>
                          {grupoEndDateDraft && (
                            <button
                              type="button"
                              onClick={() => setGrupoEndDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={grupoEndDateDraft}
                          onChange={(e) => setGrupoEndDateDraft(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <ApproximateDateHint />
                  </div>

                  {/* Edición Responsables */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-wider text-[#c5a059] flex items-center gap-1.5">
                      <UserCheck size={13} />
                      Responsables Asignados
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Líder Grupo de Vida */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold block">
                          Líder Grupo de Vida
                        </label>
                        <select
                          value={editLiderChoice}
                          onChange={(e) => setEditLiderChoice(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059]"
                        >
                          <option value="">Sin asignar</option>
                          {marriages.length > 0 && (
                            <optgroup label="Matrimonios">
                              {marriages.map((m) => (
                                <option key={`stage2-glider-mat-${m.id}`} value={`mat:${m.id}`}>
                                  {m.spouse1Name} & {m.spouse2Name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="👤 HERMANOS INDIVIDUALES">
                            {availableBrothers.map((b) => (
                              <option key={`stage2-glider-bro-${b.id}`} value={`bro:${b.id}`}>
                                {b.name} ({b.cellName})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="✏️ PERSONALIZADO">
                            <option value="custom">Escribir nombre manualmente...</option>
                          </optgroup>
                        </select>
                        {editLiderChoice === 'custom' && (
                          <input
                            type="text"
                            placeholder="Nombre del líder o matrimonio..."
                            value={editLiderCustom}
                            onChange={(e) => setEditLiderCustom(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:border-[#c5a059] outline-none mt-1"
                          />
                        )}
                      </div>

                      {/* Hermano Mayor */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 dark:text-gray-400 font-bold block">
                          Hermano Mayor
                        </label>
                        <select
                          value={editHermanoMayorChoice}
                          onChange={(e) => setEditHermanoMayorChoice(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059]"
                        >
                          <option value="">Sin asignar</option>
                          {marriages.length > 0 && (
                            <optgroup label="Matrimonios">
                              {marriages.map((m) => (
                                <option key={`stage2-ghm-mat-${m.id}`} value={`mat:${m.id}`}>
                                  {m.spouse1Name} & {m.spouse2Name}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="👤 HERMANOS INDIVIDUALES">
                            {availableBrothers.map((b) => (
                              <option key={`stage2-ghm-bro-${b.id}`} value={`bro:${b.id}`}>
                                {b.name} ({b.cellName})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="✏️ PERSONALIZADO">
                            <option value="custom">Escribir nombre manualmente...</option>
                          </optgroup>
                        </select>
                        {editHermanoMayorChoice === 'custom' && (
                          <input
                            type="text"
                            placeholder="Nombre del hermano mayor..."
                            value={editHermanoMayorCustom}
                            onChange={(e) => setEditHermanoMayorCustom(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs text-slate-900 dark:text-white focus:border-[#c5a059] outline-none mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Subpanel Experiencia Transformadora */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      brother.experiencia?.fechaRealizacion
                        ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles
                          size={15}
                          className={
                            brother.experiencia?.fechaRealizacion
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-[#c5a059]'
                          }
                        />
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-800 dark:text-gray-200">
                          Experiencia Transformadora
                        </span>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-black tracking-[0.18em] px-2.5 py-1 rounded-full border ${
                          brother.experiencia?.fechaRealizacion
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-black'
                            : 'bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-white/10'
                        }`}
                      >
                        {brother.experiencia?.fechaRealizacion ? 'Realizada' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Calendar size={13} className={brother.experiencia?.fechaRealizacion ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                          Fecha de realización
                        </span>
                        <p
                          className={`text-sm font-bold px-3.5 py-2 rounded-xl inline-flex border shadow-inner ${
                            brother.experiencia?.fechaRealizacion
                              ? 'bg-white dark:bg-black/60 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                              : 'bg-white dark:bg-black/40 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {displayDate(brother.experiencia?.fechaRealizacion)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subpanel Grupo de Vida */}
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      grupoVidaStatus === 'INTERRUMPIDO'
                        ? 'border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm'
                        : grupoVidaStatus === 'FINALIZADO'
                        ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm'
                        : grupoVidaStatus === 'EN_CURSO'
                        ? 'border-[#c5a059]/40 bg-[#c5a059]/5 dark:bg-[#c5a059]/10 shadow-sm'
                        : 'border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Users
                          size={15}
                          className={
                            grupoVidaStatus === 'INTERRUMPIDO'
                              ? 'text-rose-500'
                              : grupoVidaStatus === 'FINALIZADO'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : grupoVidaStatus === 'EN_CURSO'
                              ? 'text-[#c5a059]'
                              : 'text-slate-400'
                          }
                        />
                        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-800 dark:text-gray-200">
                          Grupo de Vida
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] uppercase font-black tracking-[0.18em] px-2.5 py-1 rounded-full border ${
                            grupoVidaStatus === 'INTERRUMPIDO'
                              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-black flex items-center gap-1.5'
                              : grupoVidaStatus === 'FINALIZADO'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-black'
                              : grupoVidaStatus === 'EN_CURSO'
                              ? 'bg-[#c5a059]/20 text-[#a58345] dark:text-[#c5a059] border-[#c5a059]/40 font-black'
                              : 'bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-white/10'
                          }`}
                        >
                          {grupoVidaStatus === 'INTERRUMPIDO' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          )}
                          {grupoVidaStatus === 'INTERRUMPIDO'
                            ? 'Interrumpido'
                            : grupoVidaStatus === 'FINALIZADO'
                            ? 'Finalizado'
                            : grupoVidaStatus === 'EN_CURSO'
                            ? 'En curso'
                            : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    {/* Banner si está interrumpido */}
                    {brother.grupo?.interrumpido && (
                      <div className="mb-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
                            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                              Dejó de asistir: {brother.grupo.motivoInterrupcion || 'Sin motivo especificado'}
                            </p>
                          </div>
                          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 pl-6">
                            {brother.grupo.fechaInterrupcion ? `Registrado el ${new Date(brother.grupo.fechaInterrupcion).toLocaleDateString()}` : ''}
                            {brother.grupo.interrumpidoPor?.name ? ` por ${brother.grupo.interrumpidoPor.name}` : ''}
                          </p>
                        </div>
                        {canEditProfile && (
                          <button
                            type="button"
                            onClick={handleResumeGrupoVida}
                            className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold bg-white dark:bg-black text-slate-800 dark:text-gray-100 border border-rose-300 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all shadow-sm shrink-0 active:scale-95 flex items-center gap-1.5"
                          >
                            <RotateCcw size={12} />
                            Reanudar Grupo
                          </button>
                        )}
                      </div>
                    )}

                    {/* Fechas de Inicio y Fin */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-100 dark:border-white/5 pb-3">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            Inicio
                          </span>
                          <p className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl inline-flex bg-white dark:bg-black/40 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 shadow-inner">
                            {displayDate(resolvedGrupoVidaStartDate)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" />
                            Fin (Inicio EDDI)
                          </span>
                          <p className="text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl inline-flex bg-white dark:bg-black/40 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 shadow-inner">
                            {displayDate(resolvedGrupoVidaEndDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Responsables: Líder de Grupo de Vida y Hermano Mayor */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5">
                        <div className="p-1.5 bg-[#c5a059]/10 text-[#c5a059] rounded-lg shrink-0">
                          <Users size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 truncate">
                            Líder Grupo de Vida
                          </p>
                          <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">
                            {brother.acompanamiento.liderCelulaName || 'Sin asignar'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5">
                        <div className="p-1.5 bg-[#c5a059]/10 text-[#c5a059] rounded-lg shrink-0">
                          <UserCheck size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] uppercase tracking-[0.15em] font-black text-slate-400 dark:text-gray-500 truncate">
                            Hermano Mayor
                          </p>
                          <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate">
                            {brother.acompanamiento.acompananteName || 'Sin asignar'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={3}
              title="EDDI"
              subtitle="escuela de discipulados"
              isCurrent={progression.currentStageNumber === 3}
              isCompleted={progression.isStageCompleted(3)}
              isLocked={progression.isStageLocked(3)}
              lockedReason={progression.stageCompletionDetails[3]?.reasonIfIncomplete}
              isEditing={editingStage === 3}
              isOtherStageEditing={editingStage !== null && editingStage !== 3}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage3}
              onCancelEdit={handleCancelEditStage3}
              onSaveEdit={handleSaveStage3}
              rightTitle="Observaciones EDDI"
              rightEntries={observationsByProcess[Proceso.EDDI]}
              rightEmpty="Sin observaciones del tutor."
              centerClassName="space-y-6"
              isComposerOpen={observationComposerByProcess[Proceso.EDDI]}
              isSavingObservation={observationSavingByProcess[Proceso.EDDI]}
              draftValue={observationDraftByProcess[Proceso.EDDI]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.EDDI)}
              onComposerClose={() => closeObservationComposer(Proceso.EDDI)}
              onDraftChange={(value) => updateObservationDraft(Proceso.EDDI, value)}
              onSaveObservation={() => saveObservation(Proceso.EDDI)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              {editingStage === 3 ? (
                <div className="space-y-4 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha Inicio EDDI
                        </label>
                        {eddiStartDateDraft && (
                          <button
                            type="button"
                            onClick={() => setEddiStartDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={eddiStartDateDraft}
                        onChange={(e) => setEddiStartDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha Fin EDDI
                        </label>
                        {eddiEndDateDraft && (
                          <button
                            type="button"
                            onClick={() => setEddiEndDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={eddiEndDateDraft}
                        onChange={(e) => setEddiEndDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <ApproximateDateHint />
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    • Las notas de materias y exámenes se gestionan y actualizan desde el módulo de EDDI.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">Fecha Inicio</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">{displayDate(eddiTracking.stageDates.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">Fecha Fin</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">{displayDate(eddiTracking.stageDates.endDate)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-2">
                  <BookOpen size={14} /> Tabla de Notas EDDI
                </span>

                {eddiTracking.grades.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 w-full max-h-[260px] [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="min-w-[620px] text-xs sm:text-sm">
                      <thead className="bg-slate-100 dark:bg-black/70 sticky top-0 z-[1]">
                        <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
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
                            <tr key={grade.id} className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black/20">
                              <td className="px-4 py-3 text-slate-700 dark:text-gray-200 font-semibold">{grade.materia}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{grade.modulo || '-'}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{grade.fecha || '-'}</td>
                              <td className="px-4 py-3 text-slate-900 dark:text-white font-black">{grade.nota}</td>
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
                  <p className="text-xs text-slate-500 dark:text-gray-600 font-bold uppercase tracking-widest bg-slate-100 dark:bg-black/30 w-fit px-4 py-2 rounded-lg">
                    Aún no hay calificaciones cargadas
                  </p>
                )}
              </div>
            </StageWrapper>

            <StageWrapper
              brotherId={id ?? ''}
              number={4}
              title="Discípulo Conector"
              isCurrent={progression.currentStageNumber === 4}
              isCompleted={progression.isStageCompleted(4)}
              isLocked={progression.isStageLocked(4)}
              lockedReason={progression.stageCompletionDetails[4]?.reasonIfIncomplete}
              isEditing={editingStage === 4}
              isOtherStageEditing={editingStage !== null && editingStage !== 4}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage4}
              onCancelEdit={handleCancelEditStage4}
              onSaveEdit={handleSaveStage4}
              rightTitle="Observaciones Discípulo Conector"
              rightEntries={observationsByProcess[Proceso.DISCIPULO]}
              rightEmpty="El proceso culminante espera."
              isComposerOpen={observationComposerByProcess[Proceso.DISCIPULO]}
              isSavingObservation={observationSavingByProcess[Proceso.DISCIPULO]}
              draftValue={observationDraftByProcess[Proceso.DISCIPULO]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.DISCIPULO)}
              onComposerClose={() => closeObservationComposer(Proceso.DISCIPULO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.DISCIPULO, value)}
              onSaveObservation={() => saveObservation(Proceso.DISCIPULO)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              <div className="space-y-3.5">
                {/* Subpanel Asignaciones y Célula */}
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black tracking-[0.15em] text-[#c5a059] flex items-center gap-1.5">
                      <Building2 size={14} /> Célula y Acompañamiento
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Célula</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                        {brother.acompanamiento.celulaName || 'Sin asignar'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Líder de Célula</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                        {brother.acompanamiento.liderCelulaName || 'Sin asignar'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Hermano Mayor</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                        {brother.acompanamiento.acompananteName || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fechas de Etapa 4 y Estado de Grupo de Vida */}
                {editingStage === 4 ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Award size={13} className="text-[#c5a059]" /> Fecha Inicio
                          </label>
                          {discipuloStartDateDraft && (
                            <button
                              type="button"
                              onClick={() => setDiscipuloStartDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={discipuloStartDateDraft}
                          onChange={(e) => setDiscipuloStartDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Award size={13} className="text-[#c5a059]" /> Fecha Fin
                          </label>
                          {discipuloEndDateDraft && (
                            <button
                              type="button"
                              onClick={() => setDiscipuloEndDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={discipuloEndDateDraft}
                          onChange={(e) => setDiscipuloEndDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <ApproximateDateHint />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Award size={13} /> Fecha Inicio
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(brother.discipulo?.fechaInicio || stageDatesService.getBrotherStageDates(brother.id)?.discipuloFechaInicio)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Award size={13} /> Fecha Fin
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(stageDatesService.getBrotherStageDates(brother.id)?.discipuloFechaFin)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aprobación compacta de Grupo de Vida si califica */}
                {hasReachedThreshold && !isGrupoVidaApproved && canApproveGrupoVida && (
                  <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Flame size={15} className="text-amber-500 shrink-0" />
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        {altarTrackingSummary.finalized} altares finalizados · Cumple requisitos para Grupo de Vida
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGrupoVidaNombreDraft(`Grupo de Vida de ${brother.name}`);
                        setIsApproveGrupoVidaModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-black bg-amber-500 hover:bg-amber-400 text-black shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <CheckCircle2 size={13} />
                      Aprobar Grupo de Vida
                    </button>
                  </div>
                )}

                {/* Si ya está promovido a Hermano Mayor */}
                {isGrupoVidaApproved && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Promovido a Etapa 5: Hermano Mayor
                      </span>
                    </div>
                    {canApproveGrupoVida && (
                      <button
                        type="button"
                        onClick={handleRevokeGrupoVida}
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                      >
                        Revocar
                      </button>
                    )}
                  </div>
                )}

                {/* Seguimiento de Altares Intacto (congelado si fue promovido) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">
                        Seguimiento de altares
                      </span>
                      {isGrupoVidaApproved && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-white/10">
                          Congelado al graduar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAltarModalSourceStage(4);
                          setDiscipuloAltarsFilter('TODOS');
                          setSelectedDiscipuloAltarBrotherId(null);
                          setIsDiscipuloAltarsModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
                      >
                        Ver
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(4);
                        setDiscipuloAltarsFilter('TODOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-[#c5a059]/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares abiertos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-[#a58345] dark:text-[#c5a059] mt-auto">{stage4Stats.opened}</p>
                    </div>
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(4);
                        setDiscipuloAltarsFilter('FINALIZADOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-emerald-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares finalizados</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-auto">{stage4Stats.finalized}</p>
                    </div>
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(4);
                        setDiscipuloAltarsFilter('INTERRUMPIDOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-rose-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares interrumpidos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 mt-auto">{stage4Stats.interrupted}</p>
                    </div>
                  </div>
                </div>
              </div>
            </StageWrapper>

            {/* Etapa 5: Hermano Mayor (SIEMPRE VISIBLE) */}
            <StageWrapper
              brotherId={id ?? ''}
              number={5}
              title="Hermano Mayor"
              isCurrent={progression.currentStageNumber === 5}
              isCompleted={progression.isStageCompleted(5)}
              isLocked={progression.isStageLocked(5)}
              lockedReason={progression.stageCompletionDetails[5]?.reasonIfIncomplete}
              isEditing={editingStage === 5}
              isOtherStageEditing={editingStage !== null && editingStage !== 5}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage5}
              onCancelEdit={handleCancelEditStage5}
              onSaveEdit={handleSaveStage5}
              rightTitle="Observaciones Hermano Mayor"
              rightEntries={observationsByProcess[Proceso.DISCIPULO]}
              rightEmpty="Sin observaciones de etapa Hermano Mayor."
              isComposerOpen={observationComposerByProcess[Proceso.DISCIPULO]}
              isSavingObservation={observationSavingByProcess[Proceso.DISCIPULO]}
              draftValue={observationDraftByProcess[Proceso.DISCIPULO]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.DISCIPULO)}
              onComposerClose={() => closeObservationComposer(Proceso.DISCIPULO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.DISCIPULO, value)}
              onSaveObservation={() => saveObservation(Proceso.DISCIPULO)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              <div className="space-y-3.5">
                {editingStage === 5 ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Crown size={13} className="text-[#c5a059]" /> Fecha Inicio Hermano Mayor
                          </label>
                          {hermanoMayorStartDateDraft && (
                            <button
                              type="button"
                              onClick={() => setHermanoMayorStartDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={hermanoMayorStartDateDraft}
                          onChange={(e) => setHermanoMayorStartDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Crown size={13} className="text-[#c5a059]" /> Fecha Fin Hermano Mayor
                          </label>
                          {hermanoMayorEndDateDraft && (
                            <button
                              type="button"
                              onClick={() => setHermanoMayorEndDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={hermanoMayorEndDateDraft}
                          onChange={(e) => setHermanoMayorEndDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <ApproximateDateHint />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Crown size={13} /> Fecha Inicio
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(
                            stageDatesService.getBrotherStageDates(brother.id)?.hermanoMayorFechaInicio ||
                            grupoVidaApproval.approvedAt?.slice(0, 10)
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Crown size={13} /> Fecha Fin
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(stageDatesService.getBrotherStageDates(brother.id)?.hermanoMayorFechaFin)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1.5 ${
                        isGrupoVidaApproved
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-white/10'
                      }`}>
                        <CheckCircle2 size={13} /> {isGrupoVidaApproved ? 'Grupo de Vida Activo' : 'Pendiente de apertura'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Subpanel Datos de Célula, Líder y Grupo de Vida */}
                {(isGrupoVidaApproved || grupoVidaMembers.length > 0) && (
                  <div className="p-3 rounded-2xl bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-black tracking-[0.15em] text-[#c5a059] flex items-center gap-1.5">
                        <Users size={14} /> {grupoVidaApproval.grupoVidaNombre || `Grupo de Vida de ${brother.name}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGrupoVidaMemberId(null);
                          setIsGrupoVidaMembersModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black bg-[#c5a059] text-black hover:bg-[#d4af37] shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Users size={12} />
                        Ver Integrantes ({grupoVidaMembers.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Célula Madre</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                          {brother.acompanamiento.celulaName || 'Sin asignar'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Líder de Célula</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                          {brother.acompanamiento.liderCelulaName || 'Sin asignar'}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Aprobado Por</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                          {grupoVidaApproval.approvedBy?.name || 'Apóstol'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pre-aprobación compacta de Líder de Célula si califica en Etapa 5 */}
                {hasReachedLiderCelulaThreshold && !isLiderCelulaApproved && canApproveLiderCelula && (
                  <div className="p-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield size={15} className="text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        {altaresFinalizadosConectores.length} discípulos conectores formados · Cumple requisitos para Líder de Célula
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsApproveLiderCelulaModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <CheckCircle2 size={13} />
                      Pre-aprobar como Líder de Célula
                    </button>
                  </div>
                )}

                {/* Seguimiento de Altares con Indicador de Discípulos Conectores (congelado si fue promovido a Etapa 6) */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">
                        Seguimiento de altares
                      </span>
                      {isLiderCelulaApproved && (
                        <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-white/10">
                          Congelado al promover
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAltarModalSourceStage(5);
                          setDiscipuloAltarsFilter('TODOS');
                          setSelectedDiscipuloAltarBrotherId(null);
                          setIsDiscipuloAltarsModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-colors"
                      >
                        Ver
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(5);
                        setDiscipuloAltarsFilter('TODOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-[#c5a059]/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares abiertos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-[#a58345] dark:text-[#c5a059] mt-auto">{stage5Stats.opened}</p>
                    </div>
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(5);
                        setDiscipuloAltarsFilter('FINALIZADOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-emerald-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares finalizados</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-auto">{stage5Stats.finalized}</p>
                    </div>
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(5);
                        setDiscipuloAltarsFilter('INTERRUMPIDOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-rose-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares interrumpidos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 mt-auto">{stage5Stats.interrupted}</p>
                    </div>
                    <div
                      onClick={() => {
                        setAltarModalSourceStage(5);
                        setDiscipuloAltarsFilter('CONECTORES');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 dark:bg-[#c5a059]/5 p-3 cursor-pointer hover:border-[#c5a059] transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-[#a58345] dark:text-[#c5a059] break-normal">
                          Discípulos Conectores
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between mt-auto">
                        <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                          {stage5Stats.conectores ?? altaresFinalizadosConectores.length}
                        </p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                          {stage5Stats.conectores ?? altaresFinalizadosConectores.length}/{minDiscipulosConfig}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </StageWrapper>

            {/* Etapa 6: Líder de Célula */}
            <StageWrapper
              brotherId={id ?? ''}
              number={6}
              title="Líder de Célula"
              isCurrent={progression.currentStageNumber === 6}
              isCompleted={progression.isStageCompleted(6)}
              isLocked={progression.isStageLocked(6)}
              lockedReason={progression.stageCompletionDetails[6]?.reasonIfIncomplete}
              isEditing={editingStage === 6}
              isOtherStageEditing={editingStage !== null && editingStage !== 6}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage6}
              onCancelEdit={handleCancelEditStage6}
              onSaveEdit={handleSaveStage6}
              rightTitle="Observaciones Líder de Célula"
              rightEntries={observationsByProcess[Proceso.DISCIPULO]}
              rightEmpty="Sin observaciones de etapa Líder de Célula."
              isComposerOpen={observationComposerByProcess[Proceso.DISCIPULO]}
              isSavingObservation={observationSavingByProcess[Proceso.DISCIPULO]}
              draftValue={observationDraftByProcess[Proceso.DISCIPULO]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.DISCIPULO)}
              onComposerClose={() => closeObservationComposer(Proceso.DISCIPULO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.DISCIPULO, value)}
              onSaveObservation={() => saveObservation(Proceso.DISCIPULO)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              <div className="space-y-3.5">
                {editingStage === 6 ? (
                  <div className="space-y-3 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Shield size={13} className="text-[#c5a059]" /> Fecha Inicio Líder de Célula
                          </label>
                          {liderCelulaStartDateDraft && (
                            <button
                              type="button"
                              onClick={() => setLiderCelulaStartDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={liderCelulaStartDateDraft}
                          onChange={(e) => setLiderCelulaStartDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                            <Shield size={13} className="text-[#c5a059]" /> Fecha Fin Líder de Célula
                          </label>
                          {liderCelulaEndDateDraft && (
                            <button
                              type="button"
                              onClick={() => setLiderCelulaEndDateDraft('')}
                              className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                            >
                              Quitar
                            </button>
                          )}
                        </div>
                        <input
                          type="date"
                          value={liderCelulaEndDateDraft}
                          onChange={(e) => setLiderCelulaEndDateDraft(e.target.value)}
                          className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <ApproximateDateHint />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Shield size={13} /> Fecha Inicio
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(
                            stageDatesService.getBrotherStageDates(brother.id)?.liderCelulaFechaInicio ||
                            liderCelulaApproval.fechaAprobacion?.slice(0, 10)
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Shield size={13} /> Fecha Fin
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(stageDatesService.getBrotherStageDates(brother.id)?.liderCelulaFechaFin)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider border flex items-center gap-1.5 ${
                        isLiderCelulaApproved
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-200/60 dark:bg-white/10 text-slate-500 dark:text-gray-400 border-slate-300 dark:border-white/10'
                      }`}>
                        <CheckCircle2 size={13} /> {isLiderCelulaApproved ? 'Líder de Célula Habilitado' : 'Pendiente de pre-aprobación'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pre-aprobación compacta si califica */}
                {hasReachedLiderCelulaThreshold && !isLiderCelulaApproved && canApproveLiderCelula && (
                  <div className="p-2.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Shield size={15} className="text-indigo-500 shrink-0" />
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        {altaresFinalizadosConectores.length} discípulos conectores formados · Cumple requisitos para Líder de Célula
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsApproveLiderCelulaModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg text-[10px] uppercase font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <CheckCircle2 size={13} />
                      Pre-aprobar como Líder de Célula
                    </button>
                  </div>
                )}

                {/* Si ya está pre-aprobado */}
                {isLiderCelulaApproved && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Líder de Célula Habilitado & Pre-aprobado por {liderCelulaApproval.aprobadoPor?.name || 'Apóstol'}
                      </span>
                    </div>
                    {canApproveLiderCelula && (
                      <button
                        type="button"
                        onClick={handleRevokeLiderCelula}
                        className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                      >
                        Revocar
                      </button>
                    )}
                  </div>
                )}

                {/* Subpanel Datos de Grupo de Vida en Etapa 6 */}
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-black tracking-[0.15em] text-[#c5a059] flex items-center gap-1.5">
                      <Users size={14} /> {grupoVidaApproval.grupoVidaNombre || `Grupo de Vida de ${brother.name}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGrupoVidaMemberId(null);
                        setIsGrupoVidaMembersModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black bg-[#c5a059] text-black hover:bg-[#d4af37] shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Users size={12} />
                      Ver Grupo de Vida ({grupoVidaMembers.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Célula</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                        {brother.acompanamiento.celulaName || 'Sin asignar'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Líderes de Célula</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                        {brother.acompanamiento.liderCelulaName || brother.name}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                      <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Integrantes Grupo de Vida</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                        {grupoVidaMembers.length} {grupoVidaMembers.length === 1 ? 'hermano' : 'hermanos'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seguimiento de Altares con Indicador de Discípulos Conectores */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059]">
                      Seguimiento de altares
                    </span>
                    <div className="flex items-center gap-2">
                      {hermanosMenoresList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsHermanosMenoresModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-blue-400/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20 transition-colors"
                        >
                          Hermanos menores ({hermanosMenoresList.length})
                        </button>
                      )}
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
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div
                      onClick={() => {
                        setDiscipuloAltarsFilter('TODOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-[#c5a059]/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares abiertos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-[#a58345] dark:text-[#c5a059] mt-auto">{altarTrackingSummary.opened}</p>
                    </div>
                    <div
                      onClick={() => {
                        setDiscipuloAltarsFilter('FINALIZADOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-emerald-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares finalizados</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-auto">{altarTrackingSummary.finalized}</p>
                    </div>
                    <div
                      onClick={() => {
                        setDiscipuloAltarsFilter('INTERRUMPIDOS');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/45 p-3 cursor-pointer hover:border-rose-500/40 transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Altares interrumpidos</p>
                      </div>
                      <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 mt-auto">{altarTrackingSummary.interrupted}</p>
                    </div>
                    <div
                      onClick={() => {
                        setDiscipuloAltarsFilter('CONECTORES');
                        setSelectedDiscipuloAltarBrotherId(null);
                        setIsDiscipuloAltarsModalOpen(true);
                      }}
                      className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 dark:bg-[#c5a059]/5 p-3 cursor-pointer hover:border-[#c5a059] transition-colors flex flex-col justify-between min-h-[86px]"
                    >
                      <div className="min-h-[28px] flex items-start">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-[#a58345] dark:text-[#c5a059] break-normal">
                          Discípulos Conectores
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between mt-auto">
                        <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
                          {altaresFinalizadosConectores.length}
                        </p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 shrink-0">
                          {altaresFinalizadosConectores.length}/{minDiscipulosConfig}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </StageWrapper>

            {/* Etapa 7: EDEM (Escuela de Entrenamiento Ministerial) */}
            <StageWrapper
              brotherId={id ?? ''}
              number={7}
              title="EDEM"
              subtitle="escuela de entrenamiento ministerial"
              isCurrent={progression.currentStageNumber === 7}
              isCompleted={progression.isStageCompleted(7)}
              isLocked={progression.isStageLocked(7)}
              lockedReason={progression.stageCompletionDetails[7]?.reasonIfIncomplete}
              isEditing={editingStage === 7}
              isOtherStageEditing={editingStage !== null && editingStage !== 7}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage7}
              onCancelEdit={handleCancelEditStage7}
              onSaveEdit={handleSaveStage7}
              rightTitle="Observaciones EDEM"
              rightEntries={observationsByProcess[Proceso.EDEM]}
              rightEmpty="Sin observaciones del tutor de EDEM."
              centerClassName="space-y-6"
              isComposerOpen={observationComposerByProcess[Proceso.EDEM]}
              isSavingObservation={observationSavingByProcess[Proceso.EDEM]}
              draftValue={observationDraftByProcess[Proceso.EDEM]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.EDEM)}
              onComposerClose={() => closeObservationComposer(Proceso.EDEM)}
              onDraftChange={(value) => updateObservationDraft(Proceso.EDEM, value)}
              onSaveObservation={() => saveObservation(Proceso.EDEM)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              {editingStage === 7 ? (
                <div className="space-y-4 p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha Inicio EDEM
                        </label>
                        {edemStartDateDraft && (
                          <button
                            type="button"
                            onClick={() => setEdemStartDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={edemStartDateDraft}
                        onChange={(e) => setEdemStartDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-purple-500 [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400">
                          Fecha Fin EDEM
                        </label>
                        {edemEndDateDraft && (
                          <button
                            type="button"
                            onClick={() => setEdemEndDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={edemEndDateDraft}
                        onChange={(e) => setEdemEndDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-purple-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <ApproximateDateHint />
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    • Las notas de materias ministeriales y evaluaciones se gestionan desde el módulo de EDEM.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">Fecha Inicio</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">
                      {displayDate(edemTracking.stageDates.startDate || brother.edem?.fechaInicio || stageDatesService.getBrotherStageDates(brother.id)?.edemFechaInicio)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">Fecha Fin</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2.5 rounded-xl inline-flex border border-slate-200 dark:border-white/10 shadow-inner">
                      {displayDate(edemTracking.stageDates.endDate || brother.edem?.fechaFin || stageDatesService.getBrotherStageDates(brother.id)?.edemFechaFin)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <Award size={14} /> Tabla de Notas EDEM
                </span>

                {edemTracking.grades.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 w-full max-h-[260px] [scrollbar-width:thin] [scrollbar-color:#9333ea44_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <table className="min-w-[620px] text-xs sm:text-sm">
                      <thead className="bg-slate-100 dark:bg-black/70 sticky top-0 z-[1]">
                        <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-gray-500">
                          <th className="text-left px-4 py-3">Materia</th>
                          <th className="text-left px-4 py-3">Módulo</th>
                          <th className="text-left px-4 py-3">Fecha</th>
                          <th className="text-left px-4 py-3">Nota</th>
                          <th className="text-left px-4 py-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edemTracking.grades.map((grade) => {
                          const status = grade.resolvedStatus;
                          return (
                            <tr key={grade.id} className="border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black/20">
                              <td className="px-4 py-3 text-slate-700 dark:text-gray-200 font-semibold">{grade.materia}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{grade.modulo || '-'}</td>
                              <td className="px-4 py-3 text-slate-500 dark:text-gray-400">{grade.fecha || '-'}</td>
                              <td className="px-4 py-3 text-slate-900 dark:text-white font-black">{grade.nota}</td>
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
                  <p className="text-xs text-slate-500 dark:text-gray-600 font-bold uppercase tracking-widest bg-slate-100 dark:bg-black/30 w-fit px-4 py-2 rounded-lg">
                    Aún no hay calificaciones cargadas en EDEM
                  </p>
                )}
              </div>
            </StageWrapper>

            {/* Etapa 8: Líder Ministerial */}
            <StageWrapper
              brotherId={id ?? ''}
              number={8}
              title="Líder Ministerial"
              isCurrent={progression.currentStageNumber === 8}
              isCompleted={progression.isStageCompleted(8)}
              isLocked={progression.isStageLocked(8)}
              lockedReason={progression.stageCompletionDetails[8]?.reasonIfIncomplete}
              isEditing={editingStage === 8}
              isOtherStageEditing={editingStage !== null && editingStage !== 8}
              canEdit={canEditProfile}
              onStartEdit={handleStartEditStage8}
              onCancelEdit={handleCancelEditStage8}
              onSaveEdit={handleSaveStage8}
              rightTitle="Observaciones Ministeriales"
              rightEntries={observationsByProcess[Proceso.DISCIPULO]}
              rightEmpty="Sin observaciones de etapa Líder Ministerial."
              isComposerOpen={observationComposerByProcess[Proceso.DISCIPULO]}
              isSavingObservation={observationSavingByProcess[Proceso.DISCIPULO]}
              draftValue={observationDraftByProcess[Proceso.DISCIPULO]}
              editingObservationId={editingObservationId}
              editDraftValue={editingObservationId ? observationEditDraftById[editingObservationId] ?? '' : ''}
              mutatingObservationId={mutatingObservationId}
              onComposerOpen={() => openObservationComposer(Proceso.DISCIPULO)}
              onComposerClose={() => closeObservationComposer(Proceso.DISCIPULO)}
              onDraftChange={(value) => updateObservationDraft(Proceso.DISCIPULO, value)}
              onSaveObservation={() => saveObservation(Proceso.DISCIPULO)}
              onEditObservationStart={startEditObservation}
              onEditObservationCancel={cancelEditObservation}
              onEditDraftChange={updateObservationEditDraft}
              onUpdateObservation={saveObservationEdit}
              onDeleteObservation={removeObservation}
            >
              <div className="space-y-5">
                {editingStage === 8 ? (
                  <div className="space-y-4 p-4 rounded-2xl bg-[#c5a059]/5 dark:bg-[#c5a059]/10 border border-[#c5a059]/30">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                          <Compass size={13} className="text-[#c5a059]" /> Fecha de Ordenación / Conversión en Ministro
                        </label>
                        {liderMinisterialStartDateDraft && (
                          <button
                            type="button"
                            onClick={() => setLiderMinisterialStartDateDraft('')}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold hover:underline"
                          >
                            Quitar fecha
                          </button>
                        )}
                      </div>
                      <input
                        type="date"
                        value={liderMinisterialStartDateDraft}
                        onChange={(e) => setLiderMinisterialStartDateDraft(e.target.value)}
                        className="w-full bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-gray-100 outline-none focus:border-[#c5a059] [color-scheme:dark]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Crown size={13} className="text-[#c5a059]" /> Asignación de los 5 Ministerios (Efesios 4:11)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(['Pastor', 'Evangelista', 'Profeta', 'Maestro', 'Apóstol'] as CincoMinisterios[]).map((min) => (
                          <button
                            key={`draft-min-${min}`}
                            type="button"
                            onClick={() => setMinisterioAsignadoDraft(ministerioAsignadoDraft === min ? '' : min)}
                            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                              ministerioAsignadoDraft === min
                                ? 'border-[#c5a059] bg-[#c5a059]/20 text-[#a58345] dark:text-[#c5a059] font-black shadow-sm ring-1 ring-[#c5a059]'
                                : 'border-slate-200 dark:border-white/10 bg-white dark:bg-black/40 text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40'
                            }`}
                          >
                            <Crown size={15} className={ministerioAsignadoDraft === min ? 'text-[#c5a059]' : 'text-slate-400'} />
                            <span className="text-xs font-bold">{min}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <ApproximateDateHint />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] flex items-center gap-1.5">
                          <Compass size={13} /> Fecha de Conversión en Ministro
                        </span>
                        <p className="text-sm font-bold text-slate-800 dark:text-gray-200 bg-white dark:bg-black/55 px-4 py-2 rounded-xl inline-flex border border-slate-200 dark:border-[#c5a059]/25 shadow-inner">
                          {displayDate(stageDatesService.getBrotherStageDates(brother.id)?.liderMinisterialFechaInicio)}
                        </p>
                      </div>

                      {stageDatesService.getBrotherStageDates(brother.id)?.ministerioAsignado && (
                        <div className="flex items-center gap-2">
                          <span className="px-3.5 py-1.5 rounded-full text-xs uppercase font-black tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                            <Crown size={14} /> Ministro: {stageDatesService.getBrotherStageDates(brother.id)?.ministerioAsignado}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Subpanel de Los 5 Ministerios */}
                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/30 border border-slate-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-[0.15em] text-[#c5a059] flex items-center gap-1.5">
                          <Crown size={14} /> Los 5 Ministerios Congregacionales
                        </span>
                        {stageDatesService.getBrotherStageDates(brother.id)?.ministerioAsignado ? (
                          <span className="text-[10px] font-black text-purple-600 dark:text-purple-300">
                            Ministerio activo: {stageDatesService.getBrotherStageDates(brother.id)?.ministerioAsignado}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            Sin ministerio asignado
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                        {(['Pastor', 'Evangelista', 'Profeta', 'Maestro', 'Apóstol'] as CincoMinisterios[]).map((min) => {
                          const isCurrentMin = stageDatesService.getBrotherStageDates(brother.id)?.ministerioAsignado === min;
                          return (
                            <div
                              key={`stage7-min-${min}`}
                              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                                isCurrentMin
                                  ? 'border-[#c5a059] bg-gradient-to-b from-[#c5a059]/20 to-[#c5a059]/10 text-slate-900 dark:text-white font-black shadow-md ring-2 ring-[#c5a059]'
                                  : 'border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/30 text-slate-500 dark:text-gray-400 opacity-60'
                              }`}
                            >
                              <Crown size={16} className={isCurrentMin ? 'text-[#c5a059]' : 'text-slate-400'} />
                              <span className="text-xs font-black">{min}</span>
                              {isCurrentMin && (
                                <span className="text-[8px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-[#c5a059] text-black mt-0.5">
                                  Activo
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
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
            : `Seguimiento de Altares y Discípulos · ${brother.name}`
        }
      >
        {selectedDiscipuloAltarBrother ? (
          <div className="space-y-4 [transform:translateZ(0)] [backface-visibility:hidden]">
            {/* Barra superior de navegación entre altares */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedDiscipuloAltarBrotherId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-200 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Volver a la lista de altares</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">
                  Altar {selectedBrotherIndex >= 0 ? selectedBrotherIndex + 1 : 1} de {filteredDisciplesAltarBrothers.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!prevAltarBrother}
                    onClick={() => prevAltarBrother && setSelectedDiscipuloAltarBrotherId(prevAltarBrother.id)}
                    title={prevAltarBrother ? `Ver altar anterior (${prevAltarBrother.name})` : 'No hay altar anterior'}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={!nextAltarBrother}
                    onClick={() => nextAltarBrother && setSelectedDiscipuloAltarBrotherId(nextAltarBrother.id)}
                    title={nextAltarBrother ? `Ver altar siguiente (${nextAltarBrother.name})` : 'No hay altar siguiente'}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.open(`/hermanos/${selectedDiscipuloAltarBrother.id}`, '_blank')}
                  title="Abrir ficha completa del hermano en una nueva ventana"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-black border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all active:scale-95 shadow-sm ml-1"
                >
                  <ExternalLink size={13} />
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </div>

            {/* Tarjeta Principal de Identidad */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#c5a059]/40 bg-slate-100 dark:bg-black/50 flex items-center justify-center text-2xl sm:text-3xl font-black text-[#c5a059] shrink-0 shadow-inner">
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
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Ficha del Hermano</span>
                  <span className="bg-[#c5a059] text-black px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                    {processBadgeLabelMap[selectedDiscipuloAltarBrother.procesoActual] || 'Altar'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight break-words">
                  {selectedDiscipuloAltarBrother.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Célula: <span className="font-bold text-slate-700 dark:text-gray-200">{selectedDiscipuloAltarBrother.acompanamiento?.celulaName || 'Sin asignar'}</span>
                  {selectedDiscipuloAltarBrother.acompanamiento?.liderCelulaName && (
                    <span> · Líder: <span className="font-semibold text-slate-700 dark:text-gray-200">{selectedDiscipuloAltarBrother.acompanamiento.liderCelulaName}</span></span>
                  )}
                </p>
              </div>
              <div className="self-start sm:self-center shrink-0 flex items-center gap-2">
                <span
                  className={`text-[10px] px-3 py-1.5 rounded-full border font-black tracking-wider inline-flex items-center gap-1.5 shadow-sm ${altarTrackingStatusStyle[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {altarTrackingStatusLabel[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}
                </span>
                <button
                  type="button"
                  onClick={() => window.open(`/hermanos/${selectedDiscipuloAltarBrother.id}`, '_blank')}
                  title="Abrir ficha completa en una nueva ventana"
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-all active:scale-95"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>

            {/* Alerta de Interrupción si está interrumpido */}
            {(selectedAltarInfo?.isInterrumpido || selectedDiscipuloAltarBrother.altar?.interrumpido) && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900/50 flex items-start gap-3">
                <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                <div className="text-xs space-y-1 min-w-0 flex-1">
                  <p className="font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide text-[10px]">
                    Altar Interrumpido
                  </p>
                  <p className="text-slate-800 dark:text-gray-200 font-medium">
                    Motivo: <span className="font-bold">{selectedAltarInfo?.motivoInterrupcion || selectedDiscipuloAltarBrother.altar?.motivoInterrupcion || 'Sin motivo registrado'}</span>
                  </p>
                  {(selectedAltarInfo?.fechaInterrupcion || selectedDiscipuloAltarBrother.altar?.fechaInterrupcion) && (
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">
                      Fecha: {displayDate(selectedAltarInfo?.fechaInterrupcion || selectedDiscipuloAltarBrother.altar?.fechaInterrupcion)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Datos Personales y Espirituales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#c5a059]" /> Célula
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedDiscipuloAltarBrother.acompanamiento?.celulaName || 'Sin asignar'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Users size={12} className="text-[#c5a059]" /> Líder de Célula
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedDiscipuloAltarBrother.acompanamiento?.liderCelulaName || 'No asignado'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#c5a059]" /> Hermano Mayor
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedDiscipuloAltarBrother.acompanamiento?.acompananteName || selectedAltarInfo?.hermanoMayorName || 'No asignado'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Phone size={12} className="text-[#c5a059]" /> Teléfono / Contacto
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedDiscipuloAltarBrother.telefono || 'No registrado'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#c5a059]" /> Edad / Nacimiento
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedDiscipuloAltarBrother.edad ? `${selectedDiscipuloAltarBrother.edad} años` : ''}
                  {selectedDiscipuloAltarBrother.fechaNacimiento ? ` (${displayDate(selectedDiscipuloAltarBrother.fechaNacimiento)})` : (!selectedDiscipuloAltarBrother.edad ? 'No registrada' : '')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#c5a059]" /> Fecha de Ingreso
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {displayDate(selectedDiscipuloAltarBrother.fechaIngreso || selectedAltarInfo?.fechaInicio || selectedDiscipuloAltarBrother.altar?.fechaInicio)}
                </p>
              </div>
            </div>

            {/* Detalle específico del Altar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] flex items-center gap-1.5">
                  <Flame size={13} /> Información del Altar
                </span>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-black uppercase tracking-wider ${altarTrackingStatusStyle[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}`}>
                  {altarTrackingStatusLabel[getAltarTrackingStatus(selectedDiscipuloAltarBrother)]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Inicio del Altar</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 mt-0.5">
                    {displayDate(selectedAltarInfo?.fechaInicio || selectedDiscipuloAltarBrother.altar?.fechaInicio)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Fin del Altar</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 mt-0.5">
                    {displayDate(selectedAltarInfo?.fechaFin || selectedDiscipuloAltarBrother.altar?.fechaFin)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Realizado por</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate mt-0.5">
                    {(selectedDiscipuloAltarBrother.altar?.realizadoPor ?? []).join(', ') || selectedAltarInfo?.hermanoMayorName || selectedDiscipuloAltarBrother.acompanamiento?.acompananteName || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Talentos y Dones (si existen) */}
            {selectedTalentsText && (
              <div className="p-4 rounded-2xl bg-white dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] flex items-center gap-1.5">
                  <Music2 size={13} /> Talentos y Dones de Servicio
                </span>
                <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{selectedTalentsText}</p>
              </div>
            )}

            {/* Procesos y Etapas Realizadas */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/35 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Procesos y Etapas Realizadas</p>
              {selectedBrotherProcessSummary.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">Este hermano aún no tiene etapas completadas o registradas.</p>
              ) : (
                <div className="space-y-3">
                  {selectedBrotherProcessSummary.map((processEntry) => (
                    <article key={processEntry.key} className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/35 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-gray-500">{processEntry.label}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-white/15 rounded-md px-2 py-1 bg-white dark:bg-black/30">
                            Inicio: {displayDate(processEntry.startDate)}
                          </span>
                          {processEntry.endDate && (
                            <span className="text-[10px] font-black text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-white/15 rounded-md px-2 py-1 bg-white dark:bg-black/30">
                              Fin: {displayDate(processEntry.endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {processEntry.observations.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-gray-500">Sin observaciones en este proceso.</p>
                        ) : (
                          processEntry.observations.map((observation, index) => (
                            <div
                              key={`${processEntry.key}-${index}`}
                              className={`rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/45 p-2.5 min-h-[72px] ${
                                index === 0 ? '' : 'mt-2'
                              }`}
                            >
                              <p className="text-xs text-slate-700 dark:text-gray-300">{observation.text}</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-2">{observation.author.name}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {(processEntry.key === Proceso.EDDI || processEntry.key === Proceso.EDEM) && processEntry.grades.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-gray-500">Materias y calificaciones</p>
                          <div className="space-y-2">
                            {processEntry.grades.map((grade) => (
                              <div key={grade.id} className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/45 px-3 py-2 flex items-center justify-between gap-3">
                                <span className="text-xs text-slate-700 dark:text-gray-300">{grade.materia}</span>
                                <span className="text-xs font-black text-[#a58345] dark:text-[#c5a059]">{grade.nota}</span>
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

            {/* Barra inferior de navegación */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedDiscipuloAltarBrotherId(null)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-200 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Volver a la lista de altares</span>
              </button>

              {nextAltarBrother && (
                <button
                  type="button"
                  onClick={() => setSelectedDiscipuloAltarBrotherId(nextAltarBrother.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-[#c5a059] text-black hover:bg-[#d4af37] transition-all shadow-md active:scale-95 ml-auto"
                >
                  <span>Siguiente Altar ({nextAltarBrother.name})</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`grid grid-cols-2 sm:grid-cols-2 ${altarModalSourceStage === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5'} gap-2 sm:gap-2.5`}>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('TODOS')}
                className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between min-h-[86px] ${
                  discipuloAltarsFilter === 'TODOS'
                    ? 'border-[#c5a059] bg-[#c5a059]/10'
                    : 'border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/40 hover:border-[#c5a059]/40'
                }`}
              >
                <div className="min-h-[28px] flex items-start">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Total Altares</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#a58345] dark:text-[#c5a059] mt-auto">{altarTrackingSummary.opened}</p>
              </button>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('EN_PROCESO')}
                className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between min-h-[86px] ${
                  discipuloAltarsFilter === 'EN_PROCESO'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/40 hover:border-amber-500/40'
                }`}
              >
                <div className="min-h-[28px] flex items-start">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">En Proceso</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-auto">{altarTrackingSummary.enProceso}</p>
              </button>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('FINALIZADOS')}
                className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between min-h-[86px] ${
                  discipuloAltarsFilter === 'FINALIZADOS'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/40 hover:border-emerald-500/40'
                }`}
              >
                <div className="min-h-[28px] flex items-start">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Finalizados</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-auto">{altarTrackingSummary.finalized}</p>
              </button>
              <button
                type="button"
                onClick={() => setDiscipuloAltarsFilter('INTERRUMPIDOS')}
                className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between min-h-[86px] ${
                  discipuloAltarsFilter === 'INTERRUMPIDOS'
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/40 hover:border-rose-500/40'
                }`}
              >
                <div className="min-h-[28px] flex items-start">
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Interrumpidos</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-rose-700 dark:text-rose-300 mt-auto">{altarTrackingSummary.interrupted}</p>
              </button>
              {altarModalSourceStage !== 4 && (
                <button
                  type="button"
                  onClick={() => setDiscipuloAltarsFilter('CONECTORES')}
                  className={`rounded-xl border p-3 text-left transition-all flex flex-col justify-between min-h-[86px] ${
                    discipuloAltarsFilter === 'CONECTORES'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/40 hover:border-purple-500/40'
                  }`}
                >
                  <div className="min-h-[28px] flex items-start">
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider leading-tight font-black text-slate-500 dark:text-gray-400 break-normal">Discípulos Conectores</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-auto">{altaresFinalizadosConectores.length}</p>
                </button>
              )}
            </div>

            {filteredDisciplesAltarBrothers.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {discipuloAltarsFilter === 'TODOS'
                  ? 'No hay hermanos registrados en altares abiertos por este discípulo.'
                  : discipuloAltarsFilter === 'CONECTORES'
                    ? 'Aún no hay hermanos que hayan alcanzado la etapa de Discípulo Conector.'
                    : 'No hay hermanos para el filtro seleccionado.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredDisciplesAltarBrothers.map((entry) => {
                  const status = getAltarTrackingStatus(entry);
                  const isConector = discipuloAltarsFilter === 'CONECTORES' || Boolean(
                    entry.procesoActual === Proceso.DISCIPULO ||
                    stageDatesService.getBrotherStageDates(entry.id)?.discipuloFechaInicio
                  );
                  return (
                    <article
                      key={entry.id}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/35 p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-[#c5a059]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/60 border border-[#c5a059]/30 flex items-center justify-center text-sm font-black text-[#c5a059] shrink-0">
                          {entry.fotoUrl ? (
                            <img src={entry.fotoUrl} alt={entry.name} className="w-full h-full object-cover" />
                          ) : (
                            entry.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white truncate">{entry.name}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 truncate">
                            Célula: {entry.acompanamiento?.celulaName || 'Sin asignar'}
                            {discipuloAltarsFilter === 'CONECTORES' ? (
                              <span> · Proceso actual: {processBadgeLabelMap[entry.procesoActual] || 'Discípulo Conector'}</span>
                            ) : (
                              <span> · Inicio: {displayDate(entry.altar?.fechaInicio)} · Fin: {displayDate(entry.altar?.fechaFin)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                        {discipuloAltarsFilter === 'CONECTORES' ? (
                          <span className="text-[10px] px-2.5 py-1 rounded-md border font-black tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30">
                            Discípulo Conector
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-md border font-black tracking-wider ${altarTrackingStatusStyle[status]}`}
                          >
                            {altarTrackingStatusLabel[status]}
                          </span>
                        )}
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
            onSubmit={handleProfileSubmit}
            className="space-y-8"
          >
            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Edit2 size={18} /> Datos personales
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Nombre</label>
                  <input
                    type="text"
                    name="nombres"
                    defaultValue={profileNameParts.nombres}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Apellido</label>
                  <input
                    type="text"
                    name="apellidos"
                    defaultValue={profileNameParts.apellidos}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Fecha de nacimiento</label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    defaultValue={brother.fechaNacimiento ?? ''}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">Número de teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    defaultValue={brother.telefono ?? ''}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <h4 className="text-[#c5a059] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Users size={18} /> Red y Estructura
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Líder de Célula */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">
                    Líder de Célula (Matrimonio o Hermano)
                  </label>
                  <select
                    value={editLiderChoice}
                    onChange={(e) => setEditLiderChoice(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors"
                  >
                    <option value="">-- Sin asignar --</option>
                    {marriages.length > 0 && (
                      <optgroup label="Matrimonios">
                        {marriages.map((m) => (
                          <option key={`lider-mat-${m.id}`} value={`mat:${m.id}`}>
                            {m.spouse1Name} & {m.spouse2Name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="👤 HERMANOS INDIVIDUALES">
                      {availableBrothers.map((b) => (
                        <option key={`lider-bro-${b.id}`} value={`bro:${b.id}`}>
                          {b.name} ({b.cellName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✏️ PERSONALIZADO">
                      <option value="custom">Escribir nombre manualmente...</option>
                    </optgroup>
                  </select>
                  {editLiderChoice === 'custom' && (
                    <input
                      type="text"
                      placeholder="Nombre del líder o matrimonio..."
                      value={editLiderCustom}
                      onChange={(e) => setEditLiderCustom(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-3 text-xs text-white focus:border-[#c5a059] outline-none mt-1 shadow-inner"
                    />
                  )}
                </div>

                {/* Hermano Mayor */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-2">
                    Hermano Mayor (Matrimonio o Hermano)
                  </label>
                  <select
                    value={editHermanoMayorChoice}
                    onChange={(e) => setEditHermanoMayorChoice(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-4 text-sm text-white focus:border-[#c5a059] outline-none shadow-inner transition-colors"
                  >
                    <option value="">-- Sin asignar --</option>
                    {marriages.length > 0 && (
                      <optgroup label="Matrimonios">
                        {marriages.map((m) => (
                          <option key={`hm-mat-${m.id}`} value={`mat:${m.id}`}>
                            {m.spouse1Name} & {m.spouse2Name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="👤 HERMANOS INDIVIDUALES">
                      {availableBrothers.map((b) => (
                        <option key={`hm-bro-${b.id}`} value={`bro:${b.id}`}>
                          {b.name} ({b.cellName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✏️ PERSONALIZADO">
                      <option value="custom">Escribir nombre manualmente...</option>
                    </optgroup>
                  </select>
                  {editHermanoMayorChoice === 'custom' && (
                    <input
                      type="text"
                      placeholder="Nombre del hermano mayor o matrimonio..."
                      value={editHermanoMayorCustom}
                      onChange={(e) => setEditHermanoMayorCustom(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-[1.2rem] p-3 text-xs text-white focus:border-[#c5a059] outline-none mt-1 shadow-inner"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="bg-gradient-to-r from-[#c5a059] to-[#d4b375] text-black font-black uppercase tracking-[0.15em] px-6 py-3 text-sm rounded-[1.1rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                {isSavingProfile ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal para confirmar interrupción del Altar */}
      <Modal
        isOpen={isInterruptModalOpen}
        onClose={() => {
          setIsInterruptModalOpen(false);
          setInterruptReasonDraft('');
        }}
        title="Indicar Altar Interrumpido"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-rose-800 dark:text-rose-300">
              <p className="font-bold mb-1">¿Deseas marcar este altar como interrumpido?</p>
              <p>Esta acción registrará que el proceso de altar con {brother.name} se interrumpió.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold ml-1">
              Motivo de la interrupción (opcional)
            </label>
            <textarea
              value={interruptReasonDraft}
              onChange={(e) => setInterruptReasonDraft(e.target.value)}
              placeholder="Ej: Cambio de domicilio, no responde a llamadas o visitas, decisión personal..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsInterruptModalOpen(false);
                setInterruptReasonDraft('');
              }}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmInterruption}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
            >
              Confirmar Interrupción
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para confirmar interrupción de Grupo de Vida */}
      <Modal
        isOpen={isGrupoInterruptModalOpen}
        onClose={() => {
          setIsGrupoInterruptModalOpen(false);
          setGrupoInterruptReasonDraft('');
        }}
        title="Indicar Interrupción de Grupo de Vida"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <div className="text-xs text-rose-800 dark:text-rose-300">
              <p className="font-bold mb-1">¿Deseas indicar que el hermano menor dejó de asistir a Grupo de Vida?</p>
              <p>Esta acción marcará el Grupo de Vida de {brother.name} como interrumpido.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold ml-1">
              Motivo de la interrupción (opcional)
            </label>
            <textarea
              value={grupoInterruptReasonDraft}
              onChange={(e) => setGrupoInterruptReasonDraft(e.target.value)}
              placeholder="Ej: Dejó de asistir por motivos laborales, cambio de horario, problemas familiares, mudanza..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-400 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsGrupoInterruptModalOpen(false);
                setGrupoInterruptReasonDraft('');
              }}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmGrupoInterruption}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 transition-all"
            >
              Confirmar Interrupción
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para Aprobar Apertura de Grupo de Vida */}
      <Modal
        isOpen={isApproveGrupoVidaModalOpen}
        onClose={() => setIsApproveGrupoVidaModalOpen(false)}
        title="Aprobar Apertura de Grupo de Vida"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <Flame className="text-amber-500 shrink-0 mt-0.5" size={22} />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-black uppercase tracking-wider">
                Habilitación de Grupo de Vida & Promoción a Hermano Mayor
              </p>
              <p>
                El discípulo <strong>{brother.name}</strong> ha finalizado con éxito{' '}
                <strong>{altarTrackingSummary.finalized} altares</strong> (mínimo requerido: {minAltaresConfig}).
              </p>
              <p className="text-[11px] opacity-90">
                Al aprobar, estas <strong>{grupoVidaMembers.length} personas</strong> pasarán formalmente a conformar su Grupo de Vida y el hermano avanzará a la <strong>Etapa 5: Hermano Mayor</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold ml-1">
              Nombre asignado al Grupo de Vida
            </label>
            <input
              type="text"
              value={grupoVidaNombreDraft}
              onChange={(e) => setGrupoVidaNombreDraft(e.target.value)}
              placeholder={`Grupo de Vida de ${brother.name}`}
              className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-gray-400 font-medium">Aprobado por:</span>
            <span className="font-bold text-slate-800 dark:text-gray-200">
              {user?.name || 'Líder / Apóstol'} ({currentUserRole})
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsApproveGrupoVidaModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApproveGrupoVida}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black bg-amber-500 hover:bg-amber-400 text-black shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Confirmar Aprobación
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal para Ver Integrantes del Grupo de Vida */}
      <Modal
        isOpen={isGrupoVidaMembersModalOpen}
        onClose={() => {
          setIsGrupoVidaMembersModalOpen(false);
          setSelectedGrupoVidaMemberId(null);
        }}
        title={
          selectedGrupoVidaMember
            ? `Ficha de ${selectedGrupoVidaMember.name}`
            : `Integrantes de Grupo de Vida (${grupoVidaMembers.length})`
        }
      >
        {selectedGrupoVidaMember ? (
          <div className="space-y-4 [transform:translateZ(0)] [backface-visibility:hidden]">
            {/* Barra superior de navegación entre integrantes */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedGrupoVidaMemberId(null)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-200 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Volver a la lista de integrantes</span>
              </button>

              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400">
                  Integrante {selectedGrupoVidaMemberIndex >= 0 ? selectedGrupoVidaMemberIndex + 1 : 1} de {grupoVidaMembers.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!prevGrupoVidaMember}
                    onClick={() => prevGrupoVidaMember && setSelectedGrupoVidaMemberId(prevGrupoVidaMember.id)}
                    title={prevGrupoVidaMember ? `Ver integrante anterior (${prevGrupoVidaMember.name})` : 'No hay integrante anterior'}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={!nextGrupoVidaMember}
                    onClick={() => nextGrupoVidaMember && setSelectedGrupoVidaMemberId(nextGrupoVidaMember.id)}
                    title={nextGrupoVidaMember ? `Ver integrante siguiente (${nextGrupoVidaMember.name})` : 'No hay integrante siguiente'}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsGrupoVidaMembersModalOpen(false);
                    navigate(`/hermanos/${selectedGrupoVidaMember.id}`);
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                    });
                  }}
                  title="Abrir ficha completa del hermano"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-black border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all active:scale-95 shadow-sm ml-1"
                >
                  <ExternalLink size={13} />
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </div>

            {/* Tarjeta Principal de Identidad */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#c5a059]/40 bg-slate-100 dark:bg-black/50 flex items-center justify-center text-2xl sm:text-3xl font-black text-[#c5a059] shrink-0 shadow-inner">
                {selectedGrupoVidaMember.fotoUrl ? (
                  <img
                    src={selectedGrupoVidaMember.fotoUrl}
                    alt={selectedGrupoVidaMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  selectedGrupoVidaMember.name.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Integrante de Grupo de Vida</span>
                  <span className="bg-[#c5a059] text-black px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-black">
                    {processBadgeLabelMap[selectedGrupoVidaMember.procesoActual] || 'Altar'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight break-words">
                  {selectedGrupoVidaMember.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Célula: <span className="font-bold text-slate-700 dark:text-gray-200">{selectedGrupoVidaMember.acompanamiento?.celulaName || 'Sin asignar'}</span>
                  {selectedGrupoVidaMember.acompanamiento?.liderCelulaName && (
                    <span> · Líder: <span className="font-semibold text-slate-700 dark:text-gray-200">{selectedGrupoVidaMember.acompanamiento.liderCelulaName}</span></span>
                  )}
                </p>
              </div>
              <div className="self-start sm:self-center shrink-0 flex items-center gap-2">
                <span
                  className={`text-[10px] px-3 py-1.5 rounded-full border font-black tracking-wider inline-flex items-center gap-1.5 shadow-sm ${altarTrackingStatusStyle[getAltarTrackingStatus(selectedGrupoVidaMember)]}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {altarTrackingStatusLabel[getAltarTrackingStatus(selectedGrupoVidaMember)]}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsGrupoVidaMembersModalOpen(false);
                    navigate(`/hermanos/${selectedGrupoVidaMember.id}`);
                    requestAnimationFrame(() => {
                      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                    });
                  }}
                  title="Abrir ficha completa"
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-all active:scale-95"
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>

            {/* Datos Personales y Espirituales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#c5a059]" /> Célula
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedGrupoVidaMember.acompanamiento?.celulaName || 'Sin asignar'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Users size={12} className="text-[#c5a059]" /> Líder de Célula
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedGrupoVidaMember.acompanamiento?.liderCelulaName || 'No asignado'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#c5a059]" /> Hermano Mayor
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedGrupoVidaMember.acompanamiento?.acompananteName || selectedGrupoVidaAltarInfo?.hermanoMayorName || brother.name}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Phone size={12} className="text-[#c5a059]" /> Teléfono / Contacto
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedGrupoVidaMember.telefono || 'No registrado'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#c5a059]" /> Edad / Nacimiento
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {selectedGrupoVidaMember.edad ? `${selectedGrupoVidaMember.edad} años` : ''}
                  {selectedGrupoVidaMember.fechaNacimiento ? ` (${displayDate(selectedGrupoVidaMember.fechaNacimiento)})` : (!selectedGrupoVidaMember.edad ? 'No registrada' : '')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 dark:text-gray-500 flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#c5a059]" /> Fecha de Ingreso
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate">
                  {displayDate(selectedGrupoVidaMember.fechaIngreso || selectedGrupoVidaAltarInfo?.fechaInicio || selectedGrupoVidaMember.altar?.fechaInicio)}
                </p>
              </div>
            </div>

            {/* Detalle específico del Altar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] flex items-center gap-1.5">
                  <Flame size={13} /> Información del Altar
                </span>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full border font-black uppercase tracking-wider ${altarTrackingStatusStyle[getAltarTrackingStatus(selectedGrupoVidaMember)]}`}>
                  {altarTrackingStatusLabel[getAltarTrackingStatus(selectedGrupoVidaMember)]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Inicio del Altar</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 mt-0.5">
                    {displayDate(selectedGrupoVidaAltarInfo?.fechaInicio || selectedGrupoVidaMember.altar?.fechaInicio)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Fin del Altar</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 mt-0.5">
                    {displayDate(selectedGrupoVidaAltarInfo?.fechaFin || selectedGrupoVidaMember.altar?.fechaFin)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/45 border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-gray-500">Realizado por</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-100 truncate mt-0.5">
                    {(selectedGrupoVidaMember.altar?.realizadoPor ?? []).join(', ') || selectedGrupoVidaAltarInfo?.hermanoMayorName || brother.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Talentos y Dones (si existen) */}
            {selectedGrupoVidaTalentsText && (
              <div className="p-4 rounded-2xl bg-white dark:bg-black/35 border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059] flex items-center gap-1.5">
                  <Music2 size={13} /> Talentos y Dones de Servicio
                </span>
                <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{selectedGrupoVidaTalentsText}</p>
              </div>
            )}

            {/* Procesos y Etapas Realizadas */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/35 p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Procesos y Etapas Realizadas</p>
              {selectedGrupoVidaProcessSummary.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-gray-400">Este hermano aún no tiene etapas completadas o registradas.</p>
              ) : (
                <div className="space-y-3">
                  {selectedGrupoVidaProcessSummary.map((processEntry) => (
                    <article key={processEntry.key} className="rounded-xl border border-slate-200 dark:border-white/10 bg-[#f8fafc] dark:bg-black/35 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-gray-500">{processEntry.label}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-white/15 rounded-md px-2 py-1 bg-white dark:bg-black/30">
                            Inicio: {displayDate(processEntry.startDate)}
                          </span>
                          {processEntry.endDate && (
                            <span className="text-[10px] font-black text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-white/15 rounded-md px-2 py-1 bg-white dark:bg-black/30">
                              Fin: {displayDate(processEntry.endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {processEntry.observations.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-gray-500">Sin observaciones en este proceso.</p>
                        ) : (
                          processEntry.observations.map((observation, index) => (
                            <div
                              key={`${processEntry.key}-${index}`}
                              className={`rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/45 p-2.5 min-h-[72px] ${
                                index === 0 ? '' : 'mt-2'
                              }`}
                            >
                              <p className="text-xs text-slate-700 dark:text-gray-300">{observation.text}</p>
                              <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-2">{observation.author.name}</p>
                            </div>
                          ))
                        )}
                      </div>
                      {(processEntry.key === Proceso.EDDI || processEntry.key === Proceso.EDEM) && processEntry.grades.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.16em] font-black text-slate-500 dark:text-gray-500">Materias y calificaciones</p>
                          <div className="space-y-2">
                            {processEntry.grades.map((grade) => (
                              <div key={grade.id} className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/45 px-3 py-2 flex items-center justify-between gap-3">
                                <span className="text-xs text-slate-700 dark:text-gray-300">{grade.materia}</span>
                                <span className="text-xs font-black text-[#a58345] dark:text-[#c5a059]">{grade.nota}</span>
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

            {/* Barra inferior de navegación */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setSelectedGrupoVidaMemberId(null)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-200 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Volver a la lista de integrantes</span>
              </button>

              {nextGrupoVidaMember && (
                <button
                  type="button"
                  onClick={() => setSelectedGrupoVidaMemberId(nextGrupoVidaMember.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-[#c5a059] text-black hover:bg-[#d4af37] transition-all shadow-md active:scale-95 ml-auto"
                >
                  <span>Siguiente Integrante ({nextGrupoVidaMember.name})</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-300 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800 dark:text-gray-200">
                  {grupoVidaApproval.grupoVidaNombre || `Grupo de Vida de ${brother.name}`}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                  Hermanos que finalizaron su altar con {brother.name} y forman parte de su grupo de vida.
                </p>
              </div>
              <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shrink-0 ${
                isGrupoVidaApproved
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
              }`}>
                {isGrupoVidaApproved ? 'Habilitado' : 'Pendiente de aprobación'}
              </span>
            </div>

            {grupoVidaMembers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-gray-500 text-xs">
                Aún no hay hermanos con altar finalizado asociados a este discípulo.
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent]">
                {grupoVidaMembers.map((member) => (
                  <div
                    key={`gv-member-${member.id}`}
                    onClick={() => setSelectedGrupoVidaMemberId(member.id)}
                    className="p-3 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#c5a059]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/60 border border-[#c5a059]/30 flex items-center justify-center text-sm font-black text-[#c5a059] shrink-0">
                        {member.fotoUrl ? (
                          <img src={member.fotoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 dark:text-gray-200 truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                          Célula: {member.acompanamiento.celulaName || 'Sin asignar'} · Finalizó: {displayDate(member.altar?.fechaFin)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGrupoVidaMemberId(member.id);
                      }}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold text-[#c5a059] border border-[#c5a059]/30 hover:bg-[#c5a059] hover:text-black transition-colors shrink-0"
                    >
                      Ver ficha
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsGrupoVidaMembersModalOpen(false);
                  setSelectedGrupoVidaMemberId(null);
                }}
                className="px-4 py-2 rounded-xl text-[10px] uppercase font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para Pre-Aprobación de Líder de Célula */}
      <Modal
        isOpen={isApproveLiderCelulaModalOpen}
        onClose={() => setIsApproveLiderCelulaModalOpen(false)}
        title="Pre-Aprobación para Líder de Célula"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-700 dark:text-gray-300 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
              <Shield size={16} />
              <span>Confirmación de Pre-Aprobación Ministerial</span>
            </div>
            <p>
              El hermano <strong>{brother.name}</strong> ha alcanzado <strong>{altaresFinalizadosConectores.length} Discípulos Conectores</strong> (mínimo configurado: {minDiscipulosConfig}).
            </p>
            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              Al otorgar la pre-aprobación como Líder de Célula o Apóstol, se certifica que este hermano cumple con los requisitos doctrinales y de liderazgo celular para ser promovido a <strong>Líder de Célula</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-gray-400 font-medium">Pre-aprobado por:</span>
            <span className="font-bold text-slate-800 dark:text-gray-200">
              {user?.name || 'Líder / Apóstol'} ({currentUserRole})
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setIsApproveLiderCelulaModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApproveLiderCelula}
              className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              Confirmar Pre-aprobación
            </button>
          </div>
        </div>
      </Modal>


      {/* Modal para Ver Lista de Hermanos Menores (en proceso) */}
      <Modal
        isOpen={isHermanosMenoresModalOpen}
        onClose={() => setIsHermanosMenoresModalOpen(false)}
        title={`Hermanos Menores en Proceso (${hermanosMenoresList.length})`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-gray-300 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-800 dark:text-gray-200">
                Hermanos Menores en formación
              </p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Acompañados por {brother.name} en proceso hacia convertirse en Discípulos Conectores (Etapas 2 y 3).
              </p>
            </div>
            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shrink-0 bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30">
              {hermanosMenoresList.length} en proceso
            </span>
          </div>

          {hermanosMenoresList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-gray-500 text-xs">
              No hay hermanos menores en proceso acompañados por este hermano actualmente.
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent]">
              {hermanosMenoresList.map((member) => (
                <div
                  key={`menor-member-${member.id}`}
                  className="p-3 rounded-xl bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-black/60 border border-blue-400/30 flex items-center justify-center text-sm font-black text-blue-500 shrink-0">
                      {member.fotoUrl ? (
                        <img src={member.fotoUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 dark:text-gray-200 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">
                        Célula: {member.acompanamiento?.celulaName || 'Sin asignar'} · Estado: {processBadgeLabelMap[member.procesoActual] || 'Hermano Menor'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsHermanosMenoresModalOpen(false);
                      navigate(`/hermanos/${member.id}`);
                      requestAnimationFrame(() => {
                        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                      });
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold text-blue-500 border border-blue-400/30 hover:bg-blue-500 hover:text-white transition-colors shrink-0"
                  >
                    Ver ficha
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsHermanosMenoresModalOpen(false)}
              className="px-4 py-2 rounded-xl text-[10px] uppercase font-bold border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>



      {brother && (
        <StageSimulatorModal brother={brother} onApplySimulatorState={handleApplySimulatorState} />
      )}

      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message={profileToastMessage} type={profileToastType} />
      <Toast isVisible={showPhotoToast} onClose={() => setShowPhotoToast(false)} message="Foto actualizada en vista previa web." />
    </div>
  );
};


