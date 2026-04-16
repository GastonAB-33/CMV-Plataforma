import { useMemo, useState } from 'react';
import { CheckCircle2, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { seguimientoModuleService } from './services/seguimientoModuleService';

const STAGES = seguimientoModuleService.getStageOrder();

export const SeguimientoPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState('Todas');

  const rows = useMemo(() => seguimientoModuleService.listMatrixRows(), []);
  const cells = useMemo(() => ['Todas', ...seguimientoModuleService.listCells()], []);

  const filteredBrothers = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.brotherName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCell = selectedCell === 'Todas' || row.cellName === selectedCell;
      return matchesSearch && matchesCell;
    });
  }, [rows, searchTerm, selectedCell]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Seguimiento Global</h1>
        <p className="text-slate-500 dark:text-gray-500 max-w-2xl">
          Visualización estratégica del progreso espiritual. Identifica a quienes necesitan un impulso extra en su camino.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500 group-focus-within:text-[#c5a059] transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 focus:border-[#c5a059]/50 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none transition-all"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-500" size={18} />
          <select
            className="w-full bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 focus:border-[#c5a059]/50 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer font-bold"
            value={selectedCell}
            onChange={(event) => setSelectedCell(event.target.value)}
          >
            {cells.map((cell) => (
              <option key={cell} value={cell} className="bg-white dark:bg-[#1a1a1a]">
                {cell}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-black/20 text-slate-500 dark:text-gray-500 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-6 sticky left-0 bg-white dark:bg-[#1a1a1a] z-10 border-r border-slate-200 dark:border-white/5">Hermanos / Células</th>
                {STAGES.map((stage) => (
                  <th key={stage} className="px-8 py-6 text-center">
                    {stage}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredBrothers.map((brother) => (
                <tr key={brother.brotherId} className="hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6 sticky left-0 bg-white dark:bg-[#1a1a1a] z-10 border-r border-slate-200 dark:border-white/5 cursor-pointer" onClick={() => navigate(`/hermanos/${brother.brotherId}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#c5a059] font-black group-hover:bg-[#c5a059]/10 transition-colors">
                        {brother.brotherName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#c5a059] transition-colors">{brother.brotherName}</p>
                        <p className="text-[10px] text-slate-600 dark:text-gray-600 font-bold uppercase">{brother.cellName}</p>
                      </div>
                    </div>
                  </td>

                  {STAGES.map((stage) => {
                    const status = brother.stageStatusByProcess[stage];
                    return (
                      <td key={`${brother.brotherId}-${stage}`} className="px-8 py-6 text-center">
                        <div className="flex justify-center items-center h-full">
                          {status === 'completed' && (
                            <div className="w-8 h-8 rounded-full bg-[#c5a059]/20 flex items-center justify-center text-[#c5a059] border border-[#c5a059]/30">
                              <CheckCircle2 size={18} />
                            </div>
                          )}
                          {status === 'in-progress' && (
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full border-2 border-[#c5a059] animate-pulse shadow-[0_0_15px_rgba(197,160,89,0.3)]" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#c5a059]" />
                              </div>
                            </div>
                          )}
                          {status === 'pending' && <div className="w-2 h-2 rounded-full bg-white/10" />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBrothers.length === 0 && <div className="p-20 text-center text-slate-500 dark:text-gray-500">No se encontraron hermanos para esta selección.</div>}
      </div>

      <footer className="flex gap-8 justify-center py-4 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#c5a059]" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-[#c5a059] animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">En Proceso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400">Pendiente</span>
        </div>
      </footer>
    </div>
  );
};

