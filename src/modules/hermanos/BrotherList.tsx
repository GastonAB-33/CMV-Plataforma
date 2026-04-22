import React, { useMemo, useState } from 'react';
import { Search, ChevronRight, UserPlus, Filter, CheckCircle, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { brothersService } from '../../services/brothersService';
import { Proceso } from '../../types';
import { STAGE_COLORS } from '../../theme/stages';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';

const STAGES = ['Todas', Proceso.ALTAR, Proceso.GRUPO, Proceso.EXPERIENCIA, Proceso.EDDI, Proceso.DISCIPULO] as const;

type StageFilter = (typeof STAGES)[number];

export const BrotherList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<StageFilter>('Todas');
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const brothers = useMemo(() => brothersService.listForListing(), []);

  const handleSaveBrother = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setShowToast(true);
  };

  const filteredBrothers = brothers.filter((brother) => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === 'Todas' || brother.procesoActual === selectedStage;

    let matchesQuickFilter = true;
    if (quickFilter === 'nuevos') {
      matchesQuickFilter = parseInt(brother.id, 10) % 2 !== 0;
    } else if (quickFilter === 'procesando') {
      matchesQuickFilter = [Proceso.ALTAR, Proceso.GRUPO].includes(brother.procesoActual);
    } else if (quickFilter === 'eddi') {
      matchesQuickFilter = brother.procesoActual === Proceso.EDDI;
    } else if (quickFilter === 'discipulos') {
      matchesQuickFilter = brother.procesoActual === Proceso.DISCIPULO;
    }

    return matchesSearch && matchesStage && matchesQuickFilter;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
            Hermanos
            <Sparkles className="text-[#c5a059] opacity-50" size={24} />
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-gray-500">Seguimiento y gestion espiritual de la congregacion.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto justify-center bg-[#c5a059] text-black px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-[1.02] transition-all shadow-[0_15px_30px_rgba(197,160,89,0.2)] active:scale-95"
        >
          <UserPlus size={20} />
          <span>NUEVO HERMANO</span>
        </button>
      </header>

      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500 group-focus-within:text-[#c5a059] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 focus:border-[#c5a059]/50 rounded-[1.2rem] md:rounded-[1.5rem] py-4 md:py-5 pl-12 md:pl-14 pr-4 text-slate-900 dark:text-white focus:outline-none transition-all shadow-inner text-base md:text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar md:pb-0">
            {STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-5 md:px-8 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] text-[11px] md:text-sm font-black whitespace-nowrap transition-all border uppercase tracking-wider md:tracking-widest ${
                  selectedStage === stage
                    ? 'bg-[#c5a059] text-black border-[#c5a059]'
                    : 'bg-white dark:bg-[#1a1a1a] text-slate-500 dark:text-gray-500 border-slate-200 dark:border-white/5 hover:border-[#c5a059]/30'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 p-1">
          <span className="text-[10px] text-slate-600 dark:text-gray-600 font-bold uppercase tracking-[0.2em] mr-2">Filtros rapidos:</span>
          {[
            { id: 'nuevos', label: 'Recien llegados', icon: <Sparkles size={14} /> },
            { id: 'procesando', label: 'En proceso', icon: <Filter size={14} /> },
            { id: 'eddi', label: 'EDDI', icon: <Info size={14} /> },
            { id: 'discipulos', label: 'Discipulos', icon: <CheckCircle size={14} /> },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setQuickFilter(quickFilter === f.id ? null : f.id)}
              className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border ${
                quickFilter === f.id
                  ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/50'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-500 border-transparent hover:bg-white/10'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
          {quickFilter && (
            <button onClick={() => setQuickFilter(null)} className="text-[10px] text-[#c5a059] hover:underline flex items-center gap-1 font-black">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {filteredBrothers.length > 0 && (
        <>
          <div className="md:hidden space-y-3">
            {filteredBrothers.map((brother) => (
              <article
                key={brother.id}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] p-4 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/hermanos/${brother.id}`)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a059]/20 to-transparent flex items-center justify-center text-[#c5a059] font-black text-xl border border-slate-200 dark:border-white/10 shrink-0">
                      {brother.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <BrotherNameTrigger
                        name={brother.name}
                        className="font-bold text-slate-900 dark:text-white text-base leading-tight"
                        fallbackClassName="font-bold text-slate-900 dark:text-white text-base leading-tight"
                      />
                      <p className="text-[10px] text-slate-500 dark:text-gray-500 font-black tracking-widest mt-1 uppercase">Miembro activo</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Celula: <span className="font-semibold text-slate-700 dark:text-gray-200">{brother.cellName}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Responsable:{' '}
                      <BrotherNameTrigger
                        name={brother.acompananteName || 'No asig.'}
                        className="font-semibold text-slate-700 dark:text-gray-200"
                        fallbackClassName="font-semibold text-slate-700 dark:text-gray-200"
                      />
                    </p>
                    <div>
                      <span className={`inline-flex px-4 py-1.5 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black border ${STAGE_COLORS[brother.procesoActual]}`}>
                        {brother.procesoActual}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-black text-[#c5a059]">
                    Ver ficha
                    <ChevronRight size={16} />
                  </div>
                </button>
              </article>
            ))}
          </div>

          <div className="hidden md:block bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl relative">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-black/40 text-slate-500 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-200 dark:border-white/5">
                    <th className="px-10 py-8">Lider / Hermano</th>
                    <th className="px-10 py-8">Ubicacion / Celula</th>
                    <th className="px-10 py-8">Etapa espiritual</th>
                    <th className="px-10 py-8">Responsable</th>
                    <th className="px-10 py-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {filteredBrothers.map((brother) => (
                    <tr key={brother.id} onClick={() => navigate(`/hermanos/${brother.id}`)} className="hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all cursor-pointer group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-[#c5a059]/20 to-transparent flex items-center justify-center text-[#c5a059] font-black text-2xl border border-slate-200 dark:border-white/5 group-hover:border-[#c5a059]/30 transition-all shadow-lg">
                            {brother.name.charAt(0)}
                          </div>
                          <div>
                            <BrotherNameTrigger
                              name={brother.name}
                              className="font-bold text-slate-900 dark:text-white text-xl leading-tight group-hover:text-[#c5a059] transition-colors"
                              fallbackClassName="font-bold text-slate-900 dark:text-white text-xl leading-tight"
                            />
                            <p className="text-[10px] text-slate-600 dark:text-gray-600 font-black tracking-widest mt-1 uppercase">Miembro activo</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-slate-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-gray-300">{brother.cellName}</span>
                          <span className="text-[10px] uppercase text-slate-600 dark:text-gray-600 tracking-tighter">Zona Norte - CMV</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-6 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black border transition-all duration-500 ${STAGE_COLORS[brother.procesoActual]}`}>
                          {brother.procesoActual}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#c5a059] shadow-[0_0_10px_#c5a059]" />
                          <BrotherNameTrigger
                            name={brother.acompananteName || 'No asig.'}
                            className="text-slate-500 dark:text-gray-400 text-sm font-black uppercase tracking-widest hover:text-[#c5a059] transition-colors"
                            fallbackClassName="text-slate-500 dark:text-gray-400 text-sm font-black uppercase tracking-widest"
                          />
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 dark:text-gray-500 group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                          <ChevronRight size={22} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {filteredBrothers.length === 0 && (
        <div className="p-10 md:p-32 text-center animate-in fade-in zoom-in-95 duration-500 bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-200 dark:border-white/5 shadow-inner">
            <Search className="text-[#c5a059]/50" size={40} />
          </div>
          <h3 className="text-slate-900 dark:text-white font-black text-2xl mb-3 uppercase tracking-tight">Cero resultados</h3>
          <p className="text-slate-500 dark:text-gray-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">No encontramos a nadie con ese criterio en el sistema de seguimiento.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStage('Todas');
              setQuickFilter(null);
            }}
            className="mt-8 text-[#c5a059] text-sm font-black uppercase tracking-widest hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Incorporacion de Hermano">
        <form onSubmit={handleSaveBrother} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Nombre completo</label>
              <input
                type="text"
                placeholder="Ej: David Livingstone"
                required
                className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-[1.2rem] p-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-all"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Fecha de ingreso</label>
              <input type="date" required className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-[1.2rem] p-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-all" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Celula asignada</label>
              <select className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-[1.2rem] p-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-all appearance-none">
                <option>Vida</option>
                <option>Nissi</option>
                <option>Zaeta</option>
                <option>Sion</option>
                <option>Maranata</option>
                <option>Alpha y Omega</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Etapa inicial</label>
              <select className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-[1.2rem] p-5 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-all appearance-none">
                <option>Altar</option>
                <option>Grupo</option>
                <option>Experiencia</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/5">
            <button
              type="submit"
              className="w-full py-5 bg-[#c5a059] text-black font-black rounded-[1.5rem] hover:bg-[#d4b375] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl uppercase tracking-widest"
            >
              Confirmar alta en el sistema
            </button>
          </div>
        </form>
      </Modal>

      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Alta de hermano procesada correctamente." />
    </div>
  );
};
