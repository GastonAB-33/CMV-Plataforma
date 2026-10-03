import React, { useState } from 'react';
import { Sparkles, ArrowRight, Heart, BookOpen } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

export const BentoCardCulture: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center pt-1 sm:pt-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto min-w-[280px] sm:min-w-[360px] p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1e38] to-[#04332f] text-white border border-cyan-500/30 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99] transition-all flex items-center justify-between gap-4 group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white transition-all shadow-inner">
            <Sparkles size={22} className="text-cyan-300 group-hover:text-white" />
          </div>
          <div className="text-left min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              Cultura Congregacional
            </span>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white leading-tight mt-0.5">
              Identidad y Misión CMV
            </h3>
            <p className="text-xs text-slate-300 font-medium line-clamp-1">
              Visión de células, discipulado y ADN pastoral.
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors shrink-0">
            <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Identidad y Misión CMV"
        >
          <div className="space-y-4 text-slate-800 dark:text-gray-200">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0c1e38] to-[#04332f] text-white border border-cyan-500/30">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                <span>Cristo Manantial de Vida</span>
              </h3>
              <p className="text-xs sm:text-sm mt-1.5 text-slate-200 leading-relaxed">
                Somos una congregación comprometida con el evangelismo relacional, el cuidado pastoral a través de grupos de vida, la formación continua y el servicio abnegado a la comunidad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <p className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart size={14} />
                  <span>Grupos de Vida</span>
                </p>
                <p className="text-slate-600 dark:text-gray-400 mt-1 leading-snug">
                  Células familiares donde se experimenta la fe, comunión, atención y oración constante.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <p className="font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>Escuela de Discipulado</span>
                </p>
                <p className="text-slate-600 dark:text-gray-400 mt-1 leading-snug">
                  Crecimiento en la Palabra con cimientos doctrinales sólidos para cada miembro.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-xs font-black uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
