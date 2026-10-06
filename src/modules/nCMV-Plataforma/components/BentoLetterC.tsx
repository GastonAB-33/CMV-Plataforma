import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, ArrowRight } from 'lucide-react';

export const BentoLetterC: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/celulas')}
      role="button"
      tabIndex={0}
      className="relative group cursor-pointer overflow-hidden rounded-3xl bg-slate-900 border border-slate-200/90 dark:border-white/10 shadow-md hover:shadow-2xl hover:-translate-y-1 active:scale-[0.99] transition-all duration-300 flex flex-col justify-between p-4 sm:p-5 min-h-[260px]"
    >
      {/* 1. Fotografía de fondo nítida y visible con alta claridad (sin difuminación opaca) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/cmv-comunidad-c.jpg"
          alt="Comunidad CMV"
          className="w-full h-full object-cover brightness-[0.95] contrast-[1.03] transition-transform duration-700 group-hover:scale-105"
        />
        {/* Velo suave y translúcido que permite ver la foto con total claridad garantizando legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/30" />
      </div>

      {/* 2. Encabezado de la tarjeta con estilo vidrio translúcido */}
      <div className="flex items-center justify-between z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 text-white text-[10.5px] font-black tracking-wider uppercase shadow-xs">
          <Sparkles size={12} className="text-amber-300" />
          <span>Comunidad CMV</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow-md">
          Un Solo Cuerpo
        </span>
      </div>

      {/* 3. Letra C icónica y nítida en el centro */}
      <div className="relative my-auto flex items-center justify-center py-2 z-10">
        <div className="w-40 h-40 sm:w-44 sm:h-44 relative flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
            aria-label="Letra C representativa de Comunidad y Cristo"
          >
            <defs>
              <clipPath id="cmvLetterCWindow">
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
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#00c988" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="cGlassTint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {/* Fotografía de comunidad recortada en la C */}
            <image
              href="/cmv-comunidad-c.jpg"
              x="0"
              y="0"
              width="400"
              height="400"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#cmvLetterCWindow)"
            />

            {/* Capa de resalte de vidrio */}
            <text
              x="50%"
              y="77%"
              textAnchor="middle"
              fontSize="370"
              fontWeight="950"
              fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              fill="url(#cGlassTint)"
              stroke="url(#cBorderGradient)"
              strokeWidth="5"
              className="pointer-events-none"
            >
              C
            </text>
          </svg>
        </div>
      </div>

      {/* 4. Pie con cápsula de vidrio flotante que actúa como botón interactivo */}
      <div className="z-10 pt-1">
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-lg group-hover:border-emerald-500/50 transition-colors">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
              <span>Comunión & Conexión</span>
            </h3>
            <p className="text-[10.5px] text-slate-600 dark:text-gray-300 font-medium">
              Grupos compartiendo fe y amistad
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hidden sm:inline-block">
              Ver Células
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-emerald-500 group-hover:translate-x-0.5 transition-all">
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
