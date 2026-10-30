import React from 'react';
import { X, Phone, MessageCircle, Calendar, User, Users, Heart, FileText, CheckCircle2, Clock, Send, Sparkles } from 'lucide-react';
import { FichaBienvenida } from '../types';

interface FichaDetalleModalProps {
  ficha: FichaBienvenida | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDerivar: (ficha: FichaBienvenida) => void;
}

export const FichaDetalleModal: React.FC<FichaDetalleModalProps> = ({
  ficha,
  isOpen,
  onClose,
  onOpenDerivar,
}) => {
  if (!isOpen || !ficha) return null;

  // Limpiar número telefónico para enlace de WhatsApp
  const cleanPhone = ficha.telefono.replace(/\D/g, '');
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera idéntica a la cartilla original */}
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
              <span>Plataforma Pastoral CMV</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white drop-shadow-sm">
              FICHA DE BIENVENIDA
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Cristo Manantial de Vida · Queremos conocerte y acompañarte
            </p>
          </div>
        </div>

        {/* Estado actual de la derivación */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-gray-400">
              Estado:
            </span>
            {ficha.estadoDerivacion === 'derivado' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 size={13} />
                Derivado a {ficha.derivadoA?.nombre} ({ficha.derivadoA?.rol})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider animate-pulse">
                <Clock size={13} />
                Pendiente de derivación
              </span>
            )}
          </div>

          {ficha.fechaDerivacion && (
            <span className="text-[11px] text-slate-400 dark:text-gray-500 font-medium">
              Derivado el: {new Date(ficha.fechaDerivacion).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Cuerpo de la ficha en formato de tabla o recuadros como el original */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="border border-slate-300 dark:border-white/15 rounded-2xl overflow-hidden divide-y divide-slate-300 dark:divide-white/15 shadow-sm">
            {/* Fila 1: Nombre y Apellido + Edad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 dark:divide-white/15">
              <div className="sm:col-span-2 p-3 sm:p-4 bg-white dark:bg-black/30">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                  Nombre y apellido:
                </p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {ficha.nombreCompleto}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                  Edad actual:
                </p>
                <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  {ficha.edad ? `${ficha.edad} años` : '-'}
                </p>
                {ficha.fechaNacimiento && (
                  <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold mt-0.5">
                    Nacimiento: {ficha.fechaNacimiento}
                  </p>
                )}
              </div>
            </div>

            {/* Fila 2: Teléfono + Fecha de Llegada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 dark:divide-white/15">
              <div className="p-3 sm:p-4 bg-white dark:bg-black/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                    Teléfono:
                  </p>
                  <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                    {ficha.telefono}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </a>
                  )}
                  <a
                    href={`tel:${ficha.telefono}`}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-200 transition-colors"
                    title="Llamar"
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                  Fecha de llegada (Registro):
                </p>
                <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {ficha.fecha}
                </p>
              </div>
            </div>

            {/* Fila 3: Célula que lo/la recibe */}
            <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                Célula que lo/la recibe:
              </p>
              <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {ficha.celulaRecibe}
              </p>
            </div>

            {/* Fila 4: ¿Cómo llegó a la iglesia? */}
            <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400">
                ¿Cómo llegó a la iglesia?
              </p>
              <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-gray-100 mt-0.5">
                {ficha.comoLlego || '-'}
              </p>
            </div>

            {/* Fila 5: ¿Desea que lo/la contactemos? */}
            <div className="p-3 sm:p-4 bg-white dark:bg-black/30 flex items-center justify-between">
              <span className="text-xs uppercase font-black tracking-wider text-slate-700 dark:text-gray-300">
                ¿Desea que lo/la contactemos?
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    ficha.deseaContacto
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                  }`}
                >
                  Sí {ficha.deseaContacto ? '■' : '□'}
                </span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                    !ficha.deseaContacto
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                  }`}
                >
                  No {!ficha.deseaContacto ? '■' : '□'}
                </span>
              </div>
            </div>

            {/* Fila 6: Motivo de oración (opcional) */}
            <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <Heart size={12} className="text-rose-500" />
                Motivo de oración (opcional):
              </p>
              <p className="text-sm font-medium text-slate-800 dark:text-gray-200 mt-1 italic">
                {ficha.motivoOracion ? `"${ficha.motivoOracion}"` : 'Sin motivo registrado'}
              </p>
            </div>

            {/* Fila 7: Observaciones */}
            <div className="p-3 sm:p-4 bg-white dark:bg-black/30">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                <FileText size={12} className="text-emerald-500" />
                Observaciones:
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-200 mt-1">
                {ficha.observaciones || 'Sin observaciones'}
              </p>
            </div>
          </div>

          {/* Notas de derivación si ya fue derivado */}
          {ficha.notasDerivacion && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <p className="font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Instrucciones pastorales adjuntas:
              </p>
              <p className="text-slate-700 dark:text-gray-300 mt-1 italic">
                "{ficha.notasDerivacion}"
              </p>
            </div>
          )}

          {/* Pie idéntico a la cartilla física */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium italic">
              Gracias por visitarnos. ¡Esperamos volver a verte!
            </p>
          </div>

          {/* Acciones del Pastor */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDerivar(ficha);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Send size={15} />
              <span>{ficha.estadoDerivacion === 'derivado' ? 'Re-derivar a otro Líder' : 'Derivar a Líder o Pastor'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
