import React, { useEffect, useState } from 'react';
import { X, Send, UserCheck, Bell, Shield, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { primerosPasosService } from '../services/primerosPasosService';
import { FichaBienvenida, LíderODerivadoOption } from '../types';

interface DerivarHermanoModalProps {
  ficha: FichaBienvenida | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fichaActualizada: FichaBienvenida, notificationMsg: string) => void;
}

export const DerivarHermanoModal: React.FC<DerivarHermanoModalProps> = ({
  ficha,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [lideres, setLideres] = useState<LíderODerivadoOption[]>([]);
  const [selectedLiderId, setSelectedLiderId] = useState<string>('');
  const [notas, setNotas] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadLideres = async () => {
      setIsLoading(true);
      try {
        const list = await primerosPasosService.listLideresYPastores();
        if (isMounted) {
          setLideres(list);
          if (list.length > 0) {
            setSelectedLiderId(list[0].id);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadLideres();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !ficha) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const destinatario = lideres.find((l) => l.id === selectedLiderId);
    if (!destinatario) {
      setErrorMsg('Por favor seleccioná un pastor o líder destinatario.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const actor = {
        id: user.id,
        nombre: user.name || 'Pastor Principal',
      };

      const result = await primerosPasosService.derivarFicha(ficha.id, {
        destinatario,
        actor,
        notas,
      });

      if (!result.ok || !result.ficha) {
        setErrorMsg(result.error || 'No se pudo completar la derivación.');
        return;
      }

      onSuccess(
        result.ficha,
        result.notificationMessage ||
          `Derivación completada. Notificación OneSignal preparada para ${destinatario.nombre}.`
      );
      onClose();
    } catch {
      setErrorMsg('Ocurrió un error inesperado al derivar. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLider = lideres.find((l) => l.id === selectedLiderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-[#047857] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <UserCheck size={20} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200">
                Derivación Pastoral
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">
                Asignar a Líder o Pastor
              </h3>
            </div>
          </div>
        </div>

        {/* Resumen del nuevo hermano */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
            Nuevo hermano recibido:
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {ficha.nombreCompleto}
            </p>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase">
              Célula {ficha.celulaRecibe}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
            Teléfono: {ficha.telefono} · {ficha.comoLlego}
          </p>
        </div>

        {/* Formulario de derivación */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Selector de Pastor / Líder */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
              Seleccionar Pastor o Líder Destinatario *
            </label>

            {isLoading ? (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-xs text-slate-400 animate-pulse">
                Cargando pastores y líderes disponibles...
              </div>
            ) : (
              <select
                value={selectedLiderId}
                onChange={(e) => setSelectedLiderId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-emerald-500"
              >
                {lideres.map((lider) => (
                  <option key={lider.id} value={lider.id}>
                    {lider.nombre} — {lider.rol} {lider.celula ? `(Célula: ${lider.celula})` : ''}
                  </option>
                ))}
              </select>
            )}

            {selectedLider && (
              <p className="text-[11px] text-slate-500 dark:text-gray-400 pt-0.5">
                Rol: <span className="font-bold text-slate-800 dark:text-gray-200 capitalize">{selectedLider.rol}</span>
                {selectedLider.celula && ` · Célula: ${selectedLider.celula}`}
              </p>
            )}
          </div>

          {/* Nota pastoral adicional */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Instrucción u observación para el líder (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Ej: Contactar esta semana para invitar a la reunión de célula y orar por su familia..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Aviso preparado de OneSignal */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
              <Bell size={16} className="text-emerald-500 animate-bounce" />
              <span>Notificación OneSignal Lista</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
              Al confirmar, el sistema disparará la notificación push de OneSignal para{' '}
              <strong>{selectedLider?.nombre || 'el líder seleccionado'}</strong> indicando que tiene un nuevo hermano para acompañar.
            </p>
          </div>

          {/* Acciones */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{isSubmitting ? 'Derivando...' : 'Confirmar Derivación y Notificar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
