import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { addObservation, getObservations, Observation as ProcessObservation } from '../../services/observationsService';
import { serviceObservationsService, ServiceObservation } from '../../services/serviceObservationsService';
import { canEditManagedModule } from '../../lib/moduleAccess';
import { BrotherProfile } from '../../modules/hermanos/types';
import { Proceso, Role, User } from '../../types';
import { worshipTalentService } from '../../services/worshipTalentService';
import { multimediaTalentService } from '../../services/multimediaTalentService';
import { misericordiaTalentService } from '../../services/misericordiaTalentService';

type ObservationSection = 'general' | 'eddi' | 'servicio';

interface BrotherQuickProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  brother: BrotherProfile;
  currentUser: User;
}

const leadershipRoles = new Set<Role>([
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
  Role.HERMANO_MAYOR,
]);

const formatDateTime = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(parsed);
};

const processLabel: Record<Proceso, string> = {
  [Proceso.ALTAR]: 'Altar',
  [Proceso.GRUPO]: 'Grupo',
  [Proceso.EXPERIENCIA]: 'Experiencia',
  [Proceso.EDDI]: 'EDDI',
  [Proceso.DISCIPULO]: 'Discipulado',
};

export const BrotherQuickProfileModal = ({ isOpen, onClose, brother, currentUser }: BrotherQuickProfileModalProps) => {
  const [section, setSection] = useState<ObservationSection>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState('');
  const [processRows, setProcessRows] = useState<ProcessObservation[]>([]);
  const [serviceRows, setServiceRows] = useState<ServiceObservation[]>([]);

  const isCellResponsibleByName = useMemo(() => {
    const responsables = [
      brother.acompanamiento.acompananteName,
      brother.acompanamiento.liderCelulaName,
      brother.acompanamiento.pastorName,
      brother.acompanamiento.apostolName,
    ].filter(Boolean);
    return responsables.some((name) => (name ?? '').toLowerCase() === currentUser.name.toLowerCase());
  }, [brother, currentUser.name]);

  const canWriteGeneral = useMemo(
    () => leadershipRoles.has(currentUser.role) && isCellResponsibleByName,
    [currentUser.role, isCellResponsibleByName]
  );
  const canWriteEddi = useMemo(
    () => canWriteGeneral || canEditManagedModule(currentUser, 'escuela_eddi'),
    [canWriteGeneral, currentUser]
  );
  const canWriteService = useMemo(
    () =>
      canWriteGeneral ||
      canEditManagedModule(currentUser, 'ministerio_adoracion') ||
      canEditManagedModule(currentUser, 'ministerio_multimedia') ||
      canEditManagedModule(currentUser, 'ministerio_misericordia'),
    [canWriteGeneral, currentUser]
  );

  const hasWorshipSection = useMemo(() => {
    const worshipTags = worshipTalentService.getTagsForBrother(brother.id);
    const multimediaTags = multimediaTalentService.getProfile(brother.id)?.tags ?? [];
    const isActiveInMultimedia = Boolean(multimediaTalentService.getProfile(brother.id)?.isActiveInMultimedia);
    const misericordiaTags = misericordiaTalentService.getProfile(brother.id)?.tags ?? [];
    const isActiveInMisericordia = Boolean(misericordiaTalentService.getProfile(brother.id)?.isActiveInMisericordia);
    return (
      worshipTags.length > 0 ||
      worshipTalentService.isBrotherActiveMember(brother.id) ||
      multimediaTags.length > 0 ||
      isActiveInMultimedia ||
      misericordiaTags.length > 0 ||
      isActiveInMisericordia
    );
  }, [brother.id]);

  const visibleProcessRows = useMemo(() => {
    if (section === 'eddi') {
      return processRows.filter((row) => row.process === Proceso.EDDI);
    }
    return processRows.filter((row) => row.process !== Proceso.EDDI);
  }, [processRows, section]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let mounted = true;
    setLoading(true);
    setDraft('');
    setSection('general');

    const load = async () => {
      try {
        const processData = await getObservations(brother.id);
        if (!mounted) {
          return;
        }
        setProcessRows(processData);
      } catch {
        if (mounted) {
          setProcessRows([]);
        }
      } finally {
        if (mounted) {
          setServiceRows(serviceObservationsService.listByBrother(brother.id));
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [brother.id, isOpen]);

  const canWriteCurrentSection =
    section === 'general' ? canWriteGeneral : section === 'eddi' ? canWriteEddi : canWriteService;

  const handleSave = async () => {
    if (!draft.trim() || !canWriteCurrentSection) {
      return;
    }

    setSaving(true);
    try {
      if (section === 'servicio') {
        const row = serviceObservationsService.add({
          brotherId: brother.id,
          text: draft.trim(),
          author: currentUser.name,
          authorRole: currentUser.role,
        });
        setServiceRows((previous) => [row, ...previous]);
      } else {
        const targetProcess = section === 'eddi' ? Proceso.EDDI : brother.procesoActual;
        const actorRoleForObservation = (
          currentUser.role === Role.LIDER_CELULA || currentUser.role === Role.LIDER_RED_CELULAS ? 'Líder' : 'Pastor'
        ) as ProcessObservation['role'];
        const saved = await addObservation(brother.id, {
          id: `temp-${Date.now()}`,
          brotherId: brother.id,
          text: draft.trim(),
          author: currentUser.name,
          role: actorRoleForObservation,
          createdAt: new Date().toISOString(),
          process: targetProcess,
        });
        setProcessRows((previous) => [saved, ...previous]);
      }
      setDraft('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha de ${brother.name}`}>
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
          <p className="font-black text-slate-900 dark:text-white">{brother.name}</p>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
            Celula: {brother.acompanamiento.celulaName} - Proceso actual: {processLabel[brother.procesoActual]}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSection('general')}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
              section === 'general'
                ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setSection('eddi')}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
              section === 'eddi'
                ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
            }`}
          >
            EDDI
          </button>
          {hasWorshipSection && (
            <button
              type="button"
              onClick={() => setSection('servicio')}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                section === 'servicio'
                  ? 'border-[#c5a059]/40 bg-[#c5a059]/15 text-[#c5a059]'
                  : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-gray-400'
              }`}
            >
              Servicio
            </button>
          )}
        </div>

        <div className="space-y-3">
          {canWriteCurrentSection ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Escribi una observacion..."
                className="w-full min-h-[110px] resize-none p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#0f0f0f]"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-[#c5a059] text-black disabled:opacity-60"
              >
                Guardar observacion
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-400">Solo lectura para esta seccion.</p>
          )}

          {loading ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">Cargando observaciones...</p>
          ) : section === 'servicio' ? (
            serviceRows.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">Sin observaciones de servicio.</p>
            ) : (
              serviceRows.map((row) => (
                <article key={row.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                  <p className="text-sm text-slate-800 dark:text-gray-200">{row.text}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-2">
                    {row.author} - {formatDateTime(row.createdAt)}
                  </p>
                </article>
              ))
            )
          ) : visibleProcessRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">Sin observaciones en esta seccion.</p>
          ) : (
            visibleProcessRows.map((row) => (
              <article key={row.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="text-sm text-slate-800 dark:text-gray-200">{row.text}</p>
                <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-2">
                  {row.author} - {processLabel[row.process]} - {formatDateTime(row.createdAt)}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
