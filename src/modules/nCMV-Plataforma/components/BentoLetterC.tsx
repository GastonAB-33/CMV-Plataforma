import React from 'react';
import { Sparkles, Users } from 'lucide-react';

export const BentoLetterC: React.FC = () => {
  return (
    <div className="relative group overflow-hidden rounded-3xl bg-white dark:bg-[#0c0c0e] border border-slate-200/90 dark:border-white/10 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 min-h-[250px]">
      {/* Fondo sutil con acento geométrico */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-emerald-400/15 via-cyan-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Encabezado de la tarjeta */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-bold tracking-wider uppercase">
          <Sparkles size={12} className="text-amber-500" />
          <span>Comunidad CMV</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-gray-400">
          Un Solo Cuerpo
        </span>
      </div>

      {/* Letra C grande con máscara fotográfica */}
      <div className="relative my-auto flex items-center justify-center py-1">
        <div className="w-40 h-40 sm:w-44 sm:h-44 relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full filter drop-shadow-md"
            aria-label="Letra C representativa de Comunidad y Cristo"
          >
            <defs>
              <clipPath id="cmvLetterCClip">
                <text
                  x="50%"
                  y="77%"
                  textAnchor="middle"
                  fontSize="370"
                  fontWeight="950"
                  fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
                >
                  C
                </text>
              </clipPath>
              <linearGradient id="cBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Sombra de contorno sutil */}
            <text
              x="50%"
              y="77%"
              textAnchor="middle"
              fontSize="370"
              fontWeight="950"
              fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              fill="none"
              stroke="url(#cBorderGradient)"
              strokeWidth="5"
              strokeOpacity="0.3"
              className="dark:stroke-emerald-400/40"
            >
              C
            </text>

            {/* Imagen recortada en la forma de la C */}
            <image
              href="/cmv-fellowship.jpg"
              x="0"
              y="0"
              width="400"
              height="400"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cmvLetterCClip)"
            />
          </svg>
        </div>
      </div>

      {/* Pie con texto institucional */}
      <div className="z-10 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Comunión & Conexión
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">
            Grupos compartiendo fe y amistad
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-2xs">
          <Users size={14} />
        </div>
      </div>
    </div>
  );
};
