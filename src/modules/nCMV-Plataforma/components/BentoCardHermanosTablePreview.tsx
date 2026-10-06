import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UserPlus,
  Search,
  ChevronRight,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface PreviewBrother {
  id: string;
  name: string;
  role: string;
  cell: string;
  zone: string;
  stage: 'ALTAR' | 'GRUPO' | 'EXPERIENCIA' | 'EDDI' | 'DISCÍPULO';
  responsible: string;
  avatarUrl: string;
}

const SAMPLE_PREVIEW_BROTHERS: PreviewBrother[] = [
  {
    id: 'p-1',
    name: 'Agustina Flores',
    role: 'Miembro Activo',
    cell: 'Zona Norte',
    zone: 'ZONA NORTE - CMV',
    stage: 'ALTAR',
    responsible: 'NO ASIG.',
    avatarUrl: '/avatars/female-1.png',
  },
  {
    id: 'p-2',
    name: 'Alma Melina',
    role: 'Miembro Activo',
    cell: 'Alfa y Omega',
    zone: 'ZONA NORTE - CMV',
    stage: 'ALTAR',
    responsible: 'NO ASIG.',
    avatarUrl: '/avatars/female-2.png',
  },
  {
    id: 'p-3',
    name: 'Ana Marta Rodríguez',
    role: 'Miembro Activo',
    cell: 'Soeta',
    zone: 'ZONA NORTE - CMV',
    stage: 'ALTAR',
    responsible: 'NO ASIG.',
    avatarUrl: '/avatars/female-3.png',
  },
  {
    id: 'p-4',
    name: 'Carlos Benítez',
    role: 'Líder de Célula',
    cell: 'Vida',
    zone: 'ZONA NORTE - CMV',
    stage: 'EDDI',
    responsible: 'Pr. Guillermo',
    avatarUrl: '/avatars/male-1.png',
  },
];

const STAGES = ['TODAS', 'ALTAR', 'GRUPO', 'EXPERIENCIA', 'EDDI', 'DISCÍPULO'] as const;
type SelectedStage = (typeof STAGES)[number];

interface BentoCardHermanosTablePreviewProps {
  onOpenNewBrother?: () => void;
}

export const BentoCardHermanosTablePreview: React.FC<BentoCardHermanosTablePreviewProps> = ({
  onOpenNewBrother,
}) => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<SelectedStage>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrothers = SAMPLE_PREVIEW_BROTHERS.filter((b) => {
    const matchesStage = selectedStage === 'TODAS' || b.stage === selectedStage;
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cell.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0c1322] border border-cyan-500/25 dark:border-cyan-400/20 p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/15 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between text-white col-span-1 md:col-span-2">
      {/* Resplandor decorativo de fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#00dfa2]/5 via-transparent to-transparent pointer-events-none" />

      {/* 1. Encabezado idéntico al recuadro de la imagen de referencia */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-1.5 shadow-2xs">
            <Sparkles size={12} className="text-[#00dfa2]" />
            <span>PLATAFORMA PASTORAL CMV</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
            Hermanos
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Seguimiento y gestión espiritual de la congregación.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewBrother}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00dfa2] to-[#0ea5e9] hover:from-[#05b383] hover:to-[#0284c7] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus size={14} />
          <span>NUEVO HERMANO</span>
        </button>
      </div>

      {/* 2. Barra de búsqueda y filtros de etapas (Pills) */}
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
        {/* Buscador interactivo */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#070d17] border border-cyan-500/20 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Pestañas de etapas exactamente como en la imagen */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {STAGES.map((stage) => {
            const isActive = selectedStage === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00dfa2] to-[#0ea5e9] text-slate-950 shadow-sm'
                    : 'bg-black/40 text-slate-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tabla en vivo de Hermanos idéntica al diseño de referencia */}
      <div className="relative z-10 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-2.5 px-3">LÍDER / HERMANO</th>
              <th className="py-2.5 px-3">UBICACIÓN / CÉLULA</th>
              <th className="py-2.5 px-3 text-center">ETAPA ESPIRITUAL</th>
              <th className="py-2.5 px-3">RESPONSABLE</th>
              <th className="py-2.5 px-3 text-right">ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filteredBrothers.map((brother) => (
              <tr
                key={brother.id}
                onClick={() => navigate('/hermanos')}
                className="group hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                {/* Avatar y Nombre */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={brother.avatarUrl}
                      alt={brother.name}
                      className="w-8 h-8 rounded-full object-cover border border-cyan-400/30 group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Fallback icon si falla la imagen
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                        {brother.name}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {brother.role}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Célula y Zona */}
                <td className="py-2.5 px-3">
                  <p className="font-bold text-slate-200">{brother.cell}</p>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">
                    {brother.zone}
                  </span>
                </td>

                {/* Etapa Espiritual */}
                <td className="py-2.5 px-3 text-center">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/60 border border-cyan-500/30 text-cyan-300 font-black text-[9.5px] uppercase tracking-wider">
                    {brother.stage}
                  </span>
                </td>

                {/* Responsable */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-300">
                      {brother.responsible}
                    </span>
                  </div>
                </td>

                {/* Botón de flecha */}
                <td className="py-2.5 px-3 text-right">
                  <button
                    type="button"
                    aria-label={`Ver ficha de ${brother.name}`}
                    className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 inline-flex items-center justify-center text-slate-400 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Pie de la tarjeta con enlace al padrón completo */}
      <div className="relative z-10 pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-[11px] font-bold">
          <Users size={13} className="text-cyan-400" />
          <span>Mostrando vista previa en tiempo real del padrón</span>
        </span>
        <button
          type="button"
          onClick={() => navigate('/hermanos')}
          className="text-[11px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-wider inline-flex items-center gap-1 group/link"
        >
          <span>Abrir Padrón Completo</span>
          <ChevronRight size={13} className="group-hover/link:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
