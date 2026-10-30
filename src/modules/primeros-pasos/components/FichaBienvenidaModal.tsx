import React, { useState, useEffect } from 'react';
import { X, Check, Heart, Phone, Users, User, HelpCircle, FileText, Sparkles, Cake, CalendarDays } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { primerosPasosService } from '../services/primerosPasosService';
import { FichaBienvenida } from '../types';

interface FichaBienvenidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ficha: FichaBienvenida) => void;
}

const DEFAULT_CELLS = ['Vida', 'Saetas', 'Nissi', 'Sion', 'Maranata', 'Alpha y Omega'];

/**
 * Calcula la edad exacta actual a partir de una fecha de nacimiento (YYYY-MM-DD).
 */
export const calculateAgeFromBirthDate = (birthDateString?: string): number | null => {
  if (!birthDateString) return null;
  const birth = new Date(`${birthDateString}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

export const FichaBienvenidaModal: React.FC<FichaBienvenidaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Célula detectada automáticamente por el usuario logueado
  const detectedUserCell = user.primaryCell || user.coveredCells?.[0] || 'Vida';

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [celulaRecibe, setCelulaRecibe] = useState<string>(detectedUserCell);
  const [allowChangeCell, setAllowChangeCell] = useState(false);
  const [comoLlego, setComoLlego] = useState('');
  const [deseaContacto, setDeseaContacto] = useState<boolean>(true);
  const [motivoOracion, setMotivoOracion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sincronizar célula detectada al abrir modal
  useEffect(() => {
    if (isOpen) {
      setCelulaRecibe(detectedUserCell);
      setAllowChangeCell(false);
    }
  }, [isOpen, detectedUserCell]);

  if (!isOpen) return null;

  // Cálculo en tiempo real de la edad según fecha de nacimiento
  const edadCalculada = calculateAgeFromBirthDate(fechaNacimiento);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!nombreCompleto.trim()) {
      setErrorMsg('Por favor ingresá el nombre y apellido.');
      return;
    }

    if (!telefono.trim()) {
      setErrorMsg('Por favor ingresá un teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const actor = {
        id: user.id,
        nombre: user.name || 'Pastor/Líder CMV',
      };

      // Fecha automática del día del registro (inamovible)
      const fechaHoy = new Date().toISOString().split('T')[0];

      const nuevaFicha = await primerosPasosService.createFicha(
        {
          nombreCompleto: nombreCompleto.trim(),
          edad: edadCalculada !== null ? edadCalculada : '',
          fechaNacimiento: fechaNacimiento || undefined,
          telefono: telefono.trim(),
          fecha: fechaHoy, // Asignada automáticamente de la fecha del día
          celulaRecibe: celulaRecibe.trim() || detectedUserCell,
          comoLlego: comoLlego.trim() || 'Invitación congregacional',
          deseaContacto,
          motivoOracion: motivoOracion.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
        },
        actor
      );

      // Limpiar formulario y notificar éxito
      setNombreCompleto('');
      setFechaNacimiento('');
      setTelefono('');
      setComoLlego('');
      setMotivoOracion('');
      setObservaciones('');
      setDeseaContacto(true);
      onSuccess(nuevaFicha);
      onClose();
    } catch {
      setErrorMsg('Ocurrió un error al guardar la ficha. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera idéntica a la ficha física */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-[#059669] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>

          <div className="text-center space-y-1 pr-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] uppercase font-black tracking-widest text-emerald-100">
              <Sparkles size={12} className="text-amber-300" />
              <span>Primeros Pasos CMV</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              FICHA DE BIENVENIDA
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Cristo Manantial de Vida · Queremos conocerte y acompañarte
            </p>
          </div>
        </div>

        {/* Formulario que replica la ficha sin la fecha y con edad por fecha de nacimiento */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Fila 1: Nombre y Apellido */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <User size={13} className="text-emerald-600 dark:text-emerald-400" />
              Nombre y apellido *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Arce Ariel"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Fila 2: Fecha de Nacimiento con Cálculo Automático de Edad + Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fecha de Nacimiento y Edad Calculada */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Cake size={13} className="text-emerald-600 dark:text-emerald-400" />
                  Fecha de nacimiento
                </label>
                {edadCalculada !== null && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Edad: {edadCalculada} años
                  </span>
                )}
              </div>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                {edadCalculada !== null
                  ? `Edad calculada automáticamente: ${edadCalculada} años.`
                  : 'Ingresá la fecha y el sistema calculará la edad actual.'}
              </p>
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                <Phone size={13} className="text-emerald-600 dark:text-emerald-400" />
                Teléfono *
              </label>
              <input
                type="tel"
                required
                placeholder="Ej: 2665 042033"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                Se usará para WhatsApp y contacto pastoral.
              </p>
            </div>
          </div>

          {/* Fila 3: Célula que lo/la recibe (Detectada automáticamente por el usuario) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Célula que lo/la recibe
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500">
                Detectada por tu usuario
              </span>
            </div>

            {!allowChangeCell ? (
              <div className="flex items-center justify-between bg-white dark:bg-black/40 p-2.5 px-3.5 rounded-xl border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    Célula {celulaRecibe}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">
                    (Usuario: {user.name})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowChangeCell(true)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={celulaRecibe}
                  onChange={(e) => setCelulaRecibe(e.target.value)}
                  className="flex-1 bg-white dark:bg-black/60 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  {DEFAULT_CELLS.map((cell) => (
                    <option key={cell} value={cell}>
                      Célula {cell}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setAllowChangeCell(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Fijar
                </button>
              </div>
            )}
          </div>

          {/* Fila 4: ¿Cómo llegó a la iglesia? */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
              ¿Cómo llegó a la iglesia?
            </label>
            <input
              type="text"
              placeholder="Ej: Llegó por Jorge Zapata / Invitación de familiar / Redes"
              value={comoLlego}
              onChange={(e) => setComoLlego(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Fila 5: ¿Desea que lo/la contactemos? (Sí / No) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-gray-200">
              ¿Desea que lo/la contactemos?
            </span>
            <div className="flex items-center gap-4">
              <label
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                  deseaContacto
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-emerald-500'
                }`}
              >
                <input
                  type="radio"
                  name="deseaContacto"
                  checked={deseaContacto === true}
                  onChange={() => setDeseaContacto(true)}
                  className="sr-only"
                />
                <span className="w-4 h-4 rounded flex items-center justify-center border border-current">
                  {deseaContacto && <Check size={12} strokeWidth={3} />}
                </span>
                <span>Sí</span>
              </label>

              <label
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                  !deseaContacto
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-white/10 hover:border-rose-500'
                }`}
              >
                <input
                  type="radio"
                  name="deseaContacto"
                  checked={deseaContacto === false}
                  onChange={() => setDeseaContacto(false)}
                  className="sr-only"
                />
                <span className="w-4 h-4 rounded flex items-center justify-center border border-current">
                  {!deseaContacto && <Check size={12} strokeWidth={3} />}
                </span>
                <span>No</span>
              </label>
            </div>
          </div>

          {/* Fila 6: Motivo de oración (opcional) */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <Heart size={13} className="text-rose-500" />
              Motivo de oración (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Oren por su familia y trabajo..."
              value={motivoOracion}
              onChange={(e) => setMotivoOracion(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Fila 7: Observaciones */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileText size={13} className="text-emerald-600 dark:text-emerald-400" />
              Observaciones
            </label>
            <textarea
              rows={2}
              placeholder="Ej: MARANATHA."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Pie del formulario idéntico al pie impreso */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 dark:text-gray-400 font-semibold italic">
              Gracias por visitarnos. ¡Esperamos volver a verte!
            </p>
          </div>

          {/* Botones de acción */}
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
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Check size={16} />
              <span>{isSubmitting ? 'Guardando Ficha...' : 'Guardar Ficha de Bienvenida'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
