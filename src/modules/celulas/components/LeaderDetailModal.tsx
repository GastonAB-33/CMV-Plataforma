import React, { useEffect } from 'react';
import {
  X,
  Crown,
  Users,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Phone,
  BookOpen,
} from 'lucide-react';
import { CellLogoBadge, getCellBranding } from '../cellBranding';
import { getAvatarForBrother } from '../../../services/avatarService';
import { BrotherProfile } from '../../hermanos/types';
import { CellGroupView } from './CellDirectoryCard';

export interface LeaderDetailData {
  id: string;
  name: string;
  fotoUrl?: string;
  role?: string;
  celulaName?: string;
  gruposDeVida?: string;
  totalIntegrantes?: number;
  ministerios?: { title: string; role: string; desc: string }[];
  telefono?: string;
}

interface LeaderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leader: LeaderDetailData | null;
  onNavigateBrother: (id: string) => void;
}

export const LeaderDetailModal: React.FC<LeaderDetailModalProps> = ({
  isOpen,
  onClose,
  leader,
  onNavigateBrother,
}) => {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !leader) return null;

  const brand = getCellBranding(leader.celulaName || 'Vida');
  const CellIcon = brand.Icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="leader-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-[#031522] via-[#062030] to-[#041a27] text-white border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/25 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luces y auras de relieve traseras */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00dfa2]/15 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        {/* Encabezado superior con botón de cerrar */}
        <div className="relative z-10 flex items-center justify-between gap-3 border-b border-cyan-400/20 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-200 text-xs font-black uppercase tracking-wider">
            <Crown size={14} className="text-cyan-300 animate-pulse" />
            <span>Perfil de Liderazgo • CMV</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="w-10 h-10 rounded-2xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Identidad del Líder (Avatar + Nombre + Título) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative shrink-0">
            <img
              src={getAvatarForBrother(leader.name, leader.fotoUrl)}
              alt={leader.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-cyan-400 shadow-xl shadow-cyan-500/30"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-cyan-950 border border-cyan-400 text-[#00dfa2] shadow-md">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-cyan-200 text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-[#00dfa2]" />
              <span>{leader.role || 'Líder Responsable'}</span>
            </div>

            <h3
              id="leader-modal-title"
              className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
            >
              {leader.name}
            </h3>

            {leader.telefono && (
              <p className="text-xs sm:text-sm text-cyan-200/80 font-semibold flex items-center justify-center sm:justify-start gap-1.5">
                <Phone size={13} className="text-cyan-400" />
                <span>{leader.telefono}</span>
              </p>
            )}
          </div>
        </div>

        {/* Sección: Célula Asignada */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 space-y-2.5 shadow-md">
          <div className="flex items-center justify-between text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
            <div className="flex items-center gap-2">
              <CellIcon size={20} />
              <span>Célula Asignada</span>
            </div>
            <span className="text-xs text-emerald-400 font-extrabold">
              {leader.totalIntegrantes ? `${leader.totalIntegrantes} hermanos` : 'Activa'}
            </span>
          </div>

          <div className="flex items-center gap-3.5 pt-1">
            <CellLogoBadge cellName={leader.celulaName || 'Vida'} size="md" showGlow={false} />
            <div>
              <p className="text-lg sm:text-xl font-black text-white">
                {brand.displayName}
              </p>
              <p className="text-xs text-slate-300 font-medium">
                {brand.tagline} • <span className="text-cyan-300 font-bold">{brand.biblicalRef}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Grupos de Vida a Cargo */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 space-y-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
            <Users size={18} className="text-[#00dfa2]" />
            <span>Grupos de Vida a Cargo</span>
          </div>
          <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
            {leader.gruposDeVida || `Supervisión de discípulos y reuniones de hogar en Célula ${brand.displayName}.`}
          </p>
        </div>

        {/* Sección: Ministerios que tenga a Cargo */}
        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-cyan-300">
            <GraduationCap size={18} className="text-cyan-400" />
            <span>Ministerios & Áreas a Cargo</span>
          </div>

          <div className="space-y-2.5">
            {leader.ministerios && leader.ministerios.length > 0 ? (
              leader.ministerios.map((min, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-white/5 border border-cyan-400/20 hover:border-cyan-400/40 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-white flex items-center gap-2">
                      <BookOpen size={14} className="text-[#00dfa2]" />
                      {min.title}
                    </span>
                    <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-200">
                      {min.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium pl-5">
                    {min.desc}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-white/5 border border-cyan-400/20 text-xs sm:text-sm text-slate-200">
                Liderazgo de Célula y Acompañamiento Discipular continuo en la congregación.
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción inferiores */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateBrother(leader.id);
            }}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00dfa2] to-[#06b6d4] hover:from-[#00c992] hover:to-[#0284c7] text-[#031522] text-sm sm:text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <ExternalLink size={18} />
            <span>Acceder a Ficha Personal</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white text-sm font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Resuelve metadatos enriquecidos de un líder para mostrar en el modal emergente.
 * Maneja casos específicos como el Pastor Ema Calivar (Célula Saetas + Escuela Discipular EDDI).
 */
export const resolveLeaderDetailData = (
  leader: { id: string; name: string; fotoUrl?: string; role?: string },
  allCellGroups: CellGroupView[],
  fullBrothers: BrotherProfile[]
): LeaderDetailData => {
  const cleanName = (leader.name || '').trim().toLowerCase();

  // Buscar coincidencia en fullBrothers
  const brother = fullBrothers.find(
    (b) => b.id === leader.id || b.name.toLowerCase() === cleanName
  );

  // Buscar células donde figura como líder
  const assignedCells = allCellGroups.filter((c) =>
    c.leaders.some((l) => l.id === leader.id || l.name.toLowerCase() === cleanName)
  );

  const primaryCellName =
    assignedCells[0]?.nombre ||
    brother?.acompanamiento?.celulaName ||
    'Vida';

  const cellGroup = allCellGroups.find((c) =>
    c.nombre.toLowerCase().includes(primaryCellName.toLowerCase())
  );
  const totalIntegrantes = cellGroup?.totalMembers ?? 0;

  // CASO ESPECÍFICO: Pastor Ema Calivar / Emanuel Calivar Chanampa
  if (
    cleanName.includes('calivar') ||
    cleanName.includes('emanuel') ||
    cleanName.includes('ema calivar')
  ) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: 'Pastor / Líder de Célula',
      celulaName: 'Saetas',
      totalIntegrantes: totalIntegrantes || 13,
      gruposDeVida:
        'Líder responsable de la Célula Saetas con supervisión y pastoreo directo de los Grupos de Vida familiares y de jóvenes.',
      ministerios: [
        {
          title: 'Escuela Discipular EDDI',
          role: 'Director / A Cargo',
          desc: 'Coordinación pedagógica, seguimiento discipular y evaluación de las etapas de crecimiento integral.',
        },
        {
          title: 'Célula Saetas',
          role: 'Líder Pastoral',
          desc: 'Reuniones de vida familiar, formación de discípulos y multiplicación de grupos.',
        },
        {
          title: 'Pastoreo & Consejo CMV',
          role: 'Pastor',
          desc: 'Atención pastoral de miembros, familias y acompañamiento en procesos discipulares.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Apóstol Andrés Castro
  if (cleanName.includes('castro') || cleanName.includes('andres')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: 'Apóstol',
      celulaName: 'Red Apostólica',
      totalIntegrantes: totalIntegrantes || 7,
      gruposDeVida:
        'Cobertura Apostólica General sobre la red de células, pastores y líderes de grupos de vida.',
      ministerios: [
        {
          title: 'Cobertura Apostólica Principal',
          role: 'Apóstol Principal',
          desc: 'Gobierno espiritual, visión ministerial y pastoreo de los líderes de la congregación.',
        },
        {
          title: 'Red de Células y Grupos Vida',
          role: 'Supervisión Apostólica',
          desc: 'Envío de líderes y sustento doctrinal de las células de vida.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Apóstol Elena Villegas
  if (cleanName.includes('villegas') || cleanName.includes('elena')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: 'Apóstol',
      celulaName: 'Red Apostólica',
      totalIntegrantes: totalIntegrantes || 7,
      gruposDeVida:
        'Supervisión y cobertura del Altar Familiar y los grupos de oración comunitaria.',
      ministerios: [
        {
          title: 'Ministerio de Intercesión',
          role: 'Responsable',
          desc: 'Vigilias, cadenas de oración y cobertura espiritual de la iglesia.',
        },
        {
          title: 'Mujeres de Fe CMV',
          role: 'Liderazgo Pastoral',
          desc: 'Acompañamiento discipular y edificación de las mujeres de la congregación.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Marcos Guajardo
  if (cleanName.includes('guajardo') || cleanName.includes('marcos')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: leader.role || 'Líder de Célula',
      celulaName: 'Vida',
      totalIntegrantes: totalIntegrantes || 18,
      gruposDeVida: 'Grupos de Vida Célula Vida • Pastoreo de familias y nuevos creyentes.',
      ministerios: [
        {
          title: 'Célula Vida',
          role: 'Líder Responsable',
          desc: 'Coordinación semanal de reuniones en hogares y discipulado inicial.',
        },
        {
          title: 'Evangelismo & Integración',
          role: 'Coordinador',
          desc: 'Recepción y seguimiento fraterno de nuevos convertidos.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Matias Arellano
  if (cleanName.includes('arellano') || cleanName.includes('matias')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: leader.role || 'Líder de Célula',
      celulaName: 'Maranatha',
      totalIntegrantes: totalIntegrantes || 11,
      gruposDeVida: 'Grupos de Vida Maranatha • Comunión fraternal y consolidación bíblica.',
      ministerios: [
        {
          title: 'Célula Maranatha',
          role: 'Líder Responsable',
          desc: 'Pastoreo celular y acompañamiento en los hogares.',
        },
        {
          title: 'Escuela de Ministerios EDEM',
          role: 'Formador',
          desc: 'Capacitación en liderazgo y servicio congregacional.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Marilu Araguna
  if (cleanName.includes('araguna') || cleanName.includes('marilu')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: leader.role || 'Líder de Célula',
      celulaName: 'Sion',
      totalIntegrantes: totalIntegrantes || 7,
      gruposDeVida: 'Grupos de Vida Célula Sion • Formación espiritual en hogares.',
      ministerios: [
        {
          title: 'Célula Sion',
          role: 'Líder Responsable',
          desc: 'Supervisión de reuniones de vida y oración familiar.',
        },
        {
          title: 'Alabanza & Adoración',
          role: 'Servicio Ministerial',
          desc: 'Edificación del ministerio musical y tiempos de comunión.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO: Yamila Llaver
  if (cleanName.includes('llaver') || cleanName.includes('yamila')) {
    return {
      id: leader.id,
      name: leader.name,
      fotoUrl: leader.fotoUrl || brother?.fotoUrl,
      role: leader.role || 'Líder de Célula',
      celulaName: 'Nissi',
      totalIntegrantes: totalIntegrantes || 1,
      gruposDeVida: 'Grupos de Vida Célula Nissi • Acompañamiento y crecimiento.',
      ministerios: [
        {
          title: 'Célula Nissi',
          role: 'Líder Responsable',
          desc: 'Pastoreo de grupo familiar y discipulado personal.',
        },
        {
          title: 'Misericordia & Niñez',
          role: 'Coordinación',
          desc: 'Asistencia solidaria y atención integral de las familias.',
        },
      ],
      telefono: brother?.telefono,
    };
  }

  // CASO GENÉRICO / DINÁMICO
  return {
    id: leader.id,
    name: leader.name,
    fotoUrl: leader.fotoUrl || brother?.fotoUrl,
    role: leader.role || brother?.role || 'Líder Responsable',
    celulaName: primaryCellName,
    totalIntegrantes: totalIntegrantes,
    gruposDeVida: `Supervisión de Grupos de Vida en Célula ${primaryCellName}.`,
    ministerios: [
      {
        title: `Célula ${primaryCellName}`,
        role: leader.role || 'Líder Responsable',
        desc: 'Pastoreo de grupos familiares y acompañamiento de discípulos.',
      },
      {
        title: 'Discipulado & Formación',
        role: 'Liderazgo Activo',
        desc: 'Seguimiento en las etapas del altar familiar y proceso de crecimiento.',
      },
    ],
    telefono: brother?.telefono,
  };
};
