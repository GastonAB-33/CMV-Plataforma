import React from 'react';

export interface SanLuisZone {
  id: string;
  name: string;
  polygon: string;
  streets: string[];
  labelX: number;
  labelY: number;
}

export const SAN_LUIS_ZONES: SanLuisZone[] = [
  {
    id: 'centro',
    name: 'Centro',
    polygon: '360,220 540,220 560,340 350,350',
    streets: ['Av. Illia', 'Calle San Martin', 'Calle Pringles', 'Av. Espana'],
    labelX: 450,
    labelY: 290,
  },
  {
    id: 'norte',
    name: 'Norte',
    polygon: '300,90 580,95 560,220 360,220',
    streets: ['Av. Lafinur', 'Calle Riobamba', 'Calle Junin', 'Av. Santos Ortiz'],
    labelX: 450,
    labelY: 155,
  },
  {
    id: 'sur',
    name: 'Sur',
    polygon: '350,350 560,340 600,520 330,520',
    streets: ['Av. Fuerza Aerea', 'Calle Constitucion', 'Calle H. Yrigoyen', 'Ruta 147'],
    labelX: 470,
    labelY: 430,
  },
  {
    id: 'oeste',
    name: 'Oeste',
    polygon: '180,210 360,220 350,350 170,360',
    streets: ['Av. del Fundador', 'Calle Sarmiento', 'Calle La Pampa', 'Calle Yapeyu'],
    labelX: 265,
    labelY: 285,
  },
  {
    id: 'este',
    name: 'Este',
    polygon: '560,220 730,220 760,360 560,340',
    streets: ['Av. Quinto Centenario', 'Calle Chacabuco', 'Calle Belgrano', 'Calle Pedernera'],
    labelX: 650,
    labelY: 290,
  },
];

interface SanLuisZoneMapProps {
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const SanLuisZoneMap = ({ selectedZoneId, onSelectZone }: SanLuisZoneMapProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f] p-3">
      <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 dark:text-gray-400 mb-2">
        Mapa esquematico - San Luis
      </p>
      <svg viewBox="120 70 680 480" className="w-full h-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#101010]">
        {SAN_LUIS_ZONES.map((zone) => {
          const isActive = selectedZoneId === zone.id;
          return (
            <g key={zone.id}>
              <polygon
                points={zone.polygon}
                fill={isActive ? 'rgba(197,160,89,0.35)' : 'rgba(148,163,184,0.18)'}
                stroke={isActive ? '#c5a059' : 'rgba(148,163,184,0.8)'}
                strokeWidth={2}
                className="cursor-pointer transition-all"
                onClick={() => onSelectZone(zone.id)}
              />
              <text
                x={zone.labelX}
                y={zone.labelY}
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-200 font-black text-[20px] pointer-events-none"
              >
                {zone.name}
              </text>
              <text
                x={zone.labelX}
                y={zone.labelY + 22}
                textAnchor="middle"
                className="fill-slate-500 dark:fill-slate-400 text-[12px] pointer-events-none"
              >
                {zone.streets[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-[11px] text-slate-500 dark:text-gray-500 mt-2">
        Vista referencial para planificar recorridos por zona y calles principales.
      </p>
    </div>
  );
};

