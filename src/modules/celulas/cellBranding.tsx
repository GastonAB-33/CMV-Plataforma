import React from 'react';
import { normalizeCellKey } from '../../services/cellNormalization';

export interface CellBrand {
  key: string;
  displayName: string;
  tagline: string;
  biblicalRef: string;
  theme: {
    primaryClass: string;
    textClass: string;
    bgBadgeClass: string;
    borderBadgeClass: string;
    headerGradient: string;
    glowColor: string;
    accentColor: string;
  };
  Icon: React.FC<{ size?: number; className?: string }>;
}

/**
 * 🌿 VIDA - Hojita / Brote de Vida
 * Color: Esmeralda viva & Verde Menta (#00dfa2 / #10b981)
 */
export const VidaLeafLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Vida"
  >
    <defs>
      <linearGradient id="vida-leaf-grad1" x1="12" y1="52" x2="48" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#047857" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#00dfa2" />
      </linearGradient>
      <linearGradient id="vida-leaf-grad2" x1="20" y1="44" x2="52" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#6ee7b7" />
      </linearGradient>
      <linearGradient id="vida-sun-glow" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0" />
      </linearGradient>
      <filter id="vida-drop-shadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#059669" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Fondo aura suave */}
    <circle cx="32" cy="32" r="28" fill="url(#vida-sun-glow)" />

    {/* Hoja principal con silueta orgánica */}
    <path
      d="M16 48C18 36 24 20 46 14C47.5 28 42 45 28 50C22 52 18 50 16 48Z"
      fill="url(#vida-leaf-grad1)"
      filter="url(#vida-drop-shadow)"
    />

    {/* Brillo interior y textura de hoja */}
    <path
      d="M20 44C23 34 29 22 44 16C43 26 38 39 27 43C23 44.5 21 44.5 20 44Z"
      fill="url(#vida-leaf-grad2)"
      opacity="0.9"
    />

    {/* Nervadura central */}
    <path
      d="M17 49C22 41 31 29 45 15"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeOpacity="0.95"
    />

    {/* Nervaduras secundarias */}
    <path
      d="M26 37C30 36 34 33 36 31"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
    <path
      d="M32 29C35 28 39 25 41 23"
      stroke="#ffffff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />

    {/* Gotita de rocío con brillo */}
    <circle cx="39" cy="22" r="3.2" fill="#ffffff" fillOpacity="0.95" />
    <circle cx="40" cy="21" r="1.2" fill="#34d399" />

    {/* Tallo inferior */}
    <path
      d="M16 48C14 52 11 55 8 57"
      stroke="#047857"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 🏹 SAETAS - Saeta / Flecha en Mano del Valiente
 * Paleta adaptada: Turquesa, Cian & Verde Menta (#00dfa2 / #06b6d4 / #0284c7)
 */
export const SaetasArrowLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Saetas"
  >
    <defs>
      <linearGradient id="saeta-grad-cyan" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0891b2" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="saeta-emerald-trail" x1="14" y1="50" x2="48" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="50%" stopColor="#00dfa2" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
      <filter id="saeta-glow-cyan" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Aura concéntrica - Diana sutil en cian y turquesa */}
    <circle cx="32" cy="32" r="26" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.5" />
    <circle cx="48" cy="16" r="11" fill="#ecfeff" fillOpacity="0.25" />

    {/* Estela de propulsión / movimiento */}
    <path
      d="M10 54C14 50 18 46 22 42"
      stroke="#00dfa2"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeDasharray="2 4"
      strokeOpacity="0.9"
    />
    <path
      d="M14 56C19 51 24 46 27 43"
      stroke="#38bdf8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />

    {/* Cuerpo de la Saeta (Vara) */}
    <line
      x1="16"
      y1="48"
      x2="45"
      y2="19"
      stroke="#0e7490"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
    <line
      x1="17"
      y1="47"
      x2="44"
      y2="20"
      stroke="#22d3ee"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Punta de la Flecha (Punta de diamante veloz) */}
    <path
      d="M52 12L38 19L45 26L52 12Z"
      fill="url(#saeta-emerald-trail)"
      filter="url(#saeta-glow-cyan)"
    />
    <path
      d="M52 12L41 18L44 21L52 12Z"
      fill="#ccfbf1"
    />

    {/* Plumas traseras (Fletching en tonos turquesa/cian) */}
    <path
      d="M14 46L8 47L12 52L14 46Z"
      fill="url(#saeta-emerald-trail)"
    />
    <path
      d="M18 50L17 56L12 52L18 50Z"
      fill="url(#saeta-grad-cyan)"
    />

    {/* Chispa de impacto */}
    <circle cx="52" cy="12" r="2.5" fill="#ffffff" />
    <path d="M52 6V18M46 12H58" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/**
 * 🌟 MARANATHA - Estrella Resplandeciente & Trompeta de Gloria
 * Paleta: Cian Profundo, Turquesa & Zafiro Celeste (#06b6d4 / #0284c7 / #38bdf8)
 */
export const MaranathaStarLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Maranatha"
  >
    <defs>
      <linearGradient id="maranatha-cyan-star" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="40%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="maranatha-glow-cyan" x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <radialGradient id="maranatha-radial" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>
      <filter id="maranatha-shadow-cyan" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0891b2" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Resplandor celestial */}
    <circle cx="32" cy="32" r="26" fill="url(#maranatha-radial)" />

    {/* Rayos celestiales diagonales */}
    <path
      d="M32 6V58M6 32H58"
      stroke="#7dd3fc"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="2 4"
      strokeOpacity="0.7"
    />

    {/* Estrella de 8 puntas - Lucero de la Mañana */}
    <path
      d="M32 10L35.5 25L49 20L39 30.5L52 35L38 37.5L42 51L32 40L22 51L26 37.5L12 35L25 30.5L15 20L28.5 25L32 10Z"
      fill="url(#maranatha-cyan-star)"
      filter="url(#maranatha-shadow-cyan)"
    />

    {/* Centro de la estrella con luz diamantada */}
    <polygon
      points="32,22 36,32 32,42 28,32"
      fill="#ffffff"
      opacity="0.95"
    />
    <polygon
      points="22,32 32,36 42,32 32,28"
      fill="#ffffff"
      opacity="0.95"
    />

    {/* Destello nuclear blanco */}
    <circle cx="32" cy="32" r="3.5" fill="#ffffff" />
    <circle cx="32" cy="32" r="5.5" stroke="#a5f3fc" strokeWidth="1.2" strokeOpacity="0.85" />
  </svg>
);

/**
 * ⛰️ SION - Monte Santo / Fortaleza de Dios
 * Paleta: Azul Zafiro & Turquesa Profundo (#0284c7 / #0f766e / #14b8a6)
 */
export const SionMountainLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Sion"
  >
    <defs>
      <linearGradient id="sion-mount1-teal" x1="16" y1="50" x2="40" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0f766e" />
        <stop offset="60%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
      <linearGradient id="sion-mount2-cyan" x1="28" y1="52" x2="52" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0369a1" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="sion-light-top" x1="26" y1="18" x2="38" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <filter id="sion-shadow-teal" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0d9488" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Disco celestial detrás de la cumbre */}
    <circle cx="32" cy="24" r="14" fill="#ccfbf1" fillOpacity="0.3" />

    {/* Montaña de fondo */}
    <path
      d="M24 50L40 25L54 50H24Z"
      fill="url(#sion-mount2-cyan)"
      opacity="0.9"
    />

    {/* Cumbre iluminada de fondo */}
    <path
      d="M40 25L44 32L37 32L40 25Z"
      fill="#bae6fd"
    />

    {/* Pico principal de Sion (frente) */}
    <path
      d="M10 50L32 16L48 50H10Z"
      fill="url(#sion-mount1-teal)"
      filter="url(#sion-shadow-teal)"
    />

    {/* Resplandor sagrado en la cumbre */}
    <path
      d="M32 16L37 25L32 23L27 25L32 16Z"
      fill="url(#sion-light-top)"
    />

    {/* Línea de cresta / arista */}
    <path
      d="M32 16L31 50"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeOpacity="0.5"
      strokeLinecap="round"
    />

    {/* Corona o arco del santuario en la cima */}
    <circle cx="32" cy="14" r="2.8" fill="#e0f2fe" />
    <path d="M32 8V12M28 14H36" stroke="#e0f2fe" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * 🚩 NISSI - Jehová Nissi (Mi Estandarte de Victoria)
 * Paleta: Verde Esmeralda & Turquesa Triunfante (#00dfa2 / #059669 / #14b8a6)
 */
export const NissiBannerLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Nissi"
  >
    <defs>
      <linearGradient id="nissi-flag-teal" x1="18" y1="16" x2="52" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="50%" stopColor="#00dfa2" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
      <linearGradient id="nissi-cyan-staff" x1="14" y1="10" x2="18" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <filter id="nissi-shadow-emerald" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#059669" floodOpacity="0.4" />
      </filter>
    </defs>

    {/* Ondulación del estandarte ondeando al viento */}
    <path
      d="M17 14C24 11 31 18 39 14C45 11 50 13 52 15L48 35C44 32 37 36 31 32C25 28 20 33 17 31V14Z"
      fill="url(#nissi-flag-teal)"
      filter="url(#nissi-shadow-emerald)"
    />

    {/* Pliegue inferior de sombra con relieve */}
    <path
      d="M17 31C20 33 25 28 31 32C37 36 44 32 48 35L47 38C43 35 37 39 31 35C25 31 20 35 17 33V31Z"
      fill="#047857"
      opacity="0.75"
    />

    {/* Emblema en el estandarte: Cruz de Victoria */}
    <circle cx="34" cy="22" r="5.5" fill="#ffffff" fillOpacity="0.25" />
    <path
      d="M34 17V27M29 22H39"
      stroke="#ffffff"
      strokeWidth="2.2"
      strokeLinecap="round"
    />

    {/* Asta cian del estandarte */}
    <line
      x1="17"
      y1="8"
      x2="17"
      y2="56"
      stroke="url(#nissi-cyan-staff)"
      strokeWidth="3.4"
      strokeLinecap="round"
    />

    {/* Remate superior del asta */}
    <path
      d="M17 7L14 11H20L17 7Z"
      fill="#38bdf8"
    />
    <circle cx="17" cy="7" r="1.8" fill="#e0f2fe" />

    {/* Cordón con borla */}
    <path
      d="M17 16C13 18 11 22 13 25"
      stroke="#2dd4bf"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="1 2"
    />
    <circle cx="13" cy="26" r="2" fill="#00dfa2" />
  </svg>
);

/**
 * ♾️ ALFA Y OMEGA - Principio y Fin / Eternidad Soberana
 * Paleta: Cian Brillante, Turquesa & Azul Profundo (#00dfa2 / #06b6d4 / #0284c7)
 */
export const AlfaOmegaLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Alfa y Omega"
  >
    <defs>
      <linearGradient id="ao-grad-teal" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00dfa2" />
        <stop offset="50%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
      <filter id="ao-shadow-teal" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.45" />
      </filter>
    </defs>

    {/* Círculo de la eternidad exterior */}
    <circle
      cx="32"
      cy="32"
      r="26"
      stroke="url(#ao-grad-teal)"
      strokeWidth="2.2"
      strokeDasharray="4 3"
      strokeOpacity="0.75"
    />

    {/* Resplandor central */}
    <circle cx="32" cy="32" r="20" fill="#ecfeff" fillOpacity="0.3" />

    {/* Letra Alfa (Α) a la izquierda */}
    <path
      d="M17 42L25 18L33 42"
      stroke="url(#ao-grad-teal)"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#ao-shadow-teal)"
    />
    <line
      x1="20"
      y1="34"
      x2="30"
      y2="34"
      stroke="#06b6d4"
      strokeWidth="2.6"
      strokeLinecap="round"
    />

    {/* Letra Omega (Ω) a la derecha */}
    <path
      d="M34 42H39C39 37 40 30 46 30C52 30 53 37 53 42H58"
      stroke="#0284c7"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M39 36C40 27 45 22 50 24C54 26 55 31 54 36"
      stroke="#00dfa2"
      strokeWidth="2.6"
      strokeLinecap="round"
    />

    {/* Punto divino de unión */}
    <circle cx="32" cy="18" r="2.8" fill="#38bdf8" />
  </svg>
);

/**
 * 👑 RED APOSTÓLICA - Cobertura & Raíz Apostólica
 * Paleta adaptada: Esmeralda Real, Turquesa Luminoso & Cian Imperial (#00dfa2 / #06b6d4 / #0284c7)
 */
export const RedApostolicaLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 76,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Red Apostólica"
  >
    <defs>
      <linearGradient id="apostol-cyan-crown" x1="16" y1="12" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#a5f3fc" />
        <stop offset="35%" stopColor="#22d3ee" />
        <stop offset="70%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
      <linearGradient id="apostol-emerald-mantle" x1="16" y1="16" x2="48" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00dfa2" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
      <filter id="apostol-shadow-cyan" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#06b6d4" floodOpacity="0.5" />
      </filter>
    </defs>

    {/* Círculo sagrado del manto apostólico */}
    <circle cx="32" cy="32" r="27" fill="url(#apostol-emerald-mantle)" opacity="0.15" />
    <circle cx="32" cy="32" r="26" stroke="#22d3ee" strokeWidth="1.6" strokeDasharray="3 3" opacity="0.6" />

    {/* Corona Apostólica de 5 puntas (5 ministerios) en cian & turquesa */}
    <path
      d="M14 38L18 20L27 28L32 14L37 28L46 20L50 38H14Z"
      fill="url(#apostol-cyan-crown)"
      filter="url(#apostol-shadow-cyan)"
    />

    {/* Base de la corona con joyas turquesa/esmeralda */}
    <rect x="14" y="38" width="36" height="5.5" rx="2.75" fill="#0e7490" />
    <circle cx="20" cy="40.75" r="1.8" fill="#a5f3fc" />
    <circle cx="28" cy="40.75" r="1.8" fill="#00dfa2" />
    <circle cx="36" cy="40.75" r="1.8" fill="#a5f3fc" />
    <circle cx="44" cy="40.75" r="1.8" fill="#00dfa2" />

    {/* Gemas en los vértices de la corona */}
    <circle cx="32" cy="14" r="3" fill="#ffffff" />
    <circle cx="18" cy="20" r="2.4" fill="#a5f3fc" />
    <circle cx="46" cy="20" r="2.4" fill="#a5f3fc" />

    {/* Raíces y derivaciones que se extienden a las células (Cobertura que deriva líderes) */}
    <path
      d="M32 44V54M32 49C26 51 20 54 16 57M32 49C38 51 44 54 48 57"
      stroke="#00dfa2"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle cx="16" cy="57" r="2.4" fill="#22d3ee" />
    <circle cx="32" cy="54" r="2.4" fill="#22d3ee" />
    <circle cx="48" cy="57" r="2.4" fill="#22d3ee" />
  </svg>
);

/**
 * 🔥 DEFAULT - Flama / Comunidad Espiritual
 */
export const DefaultCellLogo: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Logo Célula Genérica"
  >
    <defs>
      <linearGradient id="default-flame-teal" x1="16" y1="52" x2="48" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="50%" stopColor="#00dfa2" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="26" fill="#00dfa2" fillOpacity="0.12" />
    <path
      d="M32 10C35 22 46 26 46 36C46 45 39 52 32 52C25 52 18 45 18 36C18 27 28 20 32 10Z"
      fill="url(#default-flame-teal)"
    />
    <path
      d="M32 26C34 32 38 35 38 40C38 44 35 47 32 47C29 47 26 44 26 40C26 35 30 31 32 26Z"
      fill="#ffffff"
      fillOpacity="0.9"
    />
  </svg>
);

/**
 * Catálogo maestro de identidades de células adaptado a la paleta de verdes, turquesas y cian
 */
export const CELL_BRANDS: Record<string, CellBrand> = {
  vida: {
    key: 'vida',
    displayName: 'Vida',
    tagline: 'Árbol de Vida • Crecimiento & Fruto Espiritual',
    biblicalRef: 'Salmo 1:3',
    theme: {
      primaryClass: 'text-emerald-500 dark:text-emerald-400',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      bgBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderBadgeClass: 'border-emerald-200 dark:border-emerald-800/50',
      headerGradient: 'from-emerald-500/15 via-teal-500/8 to-transparent',
      glowColor: 'shadow-emerald-500/25',
      accentColor: '#10b981',
    },
    Icon: VidaLeafLogo,
  },
  saetas: {
    key: 'saetas',
    displayName: 'Saetas',
    tagline: 'En Manos del Valiente • Dirección & Alcance',
    biblicalRef: 'Salmo 127:4',
    theme: {
      primaryClass: 'text-cyan-600 dark:text-cyan-400',
      textClass: 'text-cyan-700 dark:text-cyan-300',
      bgBadgeClass: 'bg-cyan-50 dark:bg-cyan-950/60',
      borderBadgeClass: 'border-cyan-200 dark:border-cyan-800/50',
      headerGradient: 'from-cyan-500/15 via-teal-500/8 to-transparent',
      glowColor: 'shadow-cyan-500/25',
      accentColor: '#06b6d4',
    },
    Icon: SaetasArrowLogo,
  },
  maranatha: {
    key: 'maranatha',
    displayName: 'Maranatha',
    tagline: '¡El Señor Viene! • Esperanza & Resplandor Celestial',
    biblicalRef: '1 Corintios 16:22',
    theme: {
      primaryClass: 'text-sky-600 dark:text-sky-400',
      textClass: 'text-sky-700 dark:text-sky-300',
      bgBadgeClass: 'bg-sky-50 dark:bg-sky-950/60',
      borderBadgeClass: 'border-sky-200 dark:border-sky-800/50',
      headerGradient: 'from-sky-500/15 via-cyan-500/8 to-transparent',
      glowColor: 'shadow-sky-500/25',
      accentColor: '#0284c7',
    },
    Icon: MaranathaStarLogo,
  },
  sion: {
    key: 'sion',
    displayName: 'Sion',
    tagline: 'Monte Santo • Fortaleza & Morada de Gloria',
    biblicalRef: 'Salmo 132:13',
    theme: {
      primaryClass: 'text-teal-600 dark:text-teal-400',
      textClass: 'text-teal-700 dark:text-teal-300',
      bgBadgeClass: 'bg-teal-50 dark:bg-teal-950/60',
      borderBadgeClass: 'border-teal-200 dark:border-teal-800/50',
      headerGradient: 'from-teal-500/15 via-emerald-500/8 to-transparent',
      glowColor: 'shadow-teal-500/25',
      accentColor: '#14b8a6',
    },
    Icon: SionMountainLogo,
  },
  nissi: {
    key: 'nissi',
    displayName: 'Nissi',
    tagline: 'Nuestro Estandarte • Victoria & Adoración',
    biblicalRef: 'Éxodo 17:15',
    theme: {
      primaryClass: 'text-emerald-600 dark:text-emerald-400',
      textClass: 'text-emerald-700 dark:text-emerald-300',
      bgBadgeClass: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderBadgeClass: 'border-emerald-200 dark:border-emerald-800/50',
      headerGradient: 'from-emerald-500/15 via-cyan-500/8 to-transparent',
      glowColor: 'shadow-emerald-500/25',
      accentColor: '#059669',
    },
    Icon: NissiBannerLogo,
  },
  'alfa-omega': {
    key: 'alfa-omega',
    displayName: 'Alfa y Omega',
    tagline: 'Principio y Fin • Eternidad & Soberanía',
    biblicalRef: 'Apocalipsis 22:13',
    theme: {
      primaryClass: 'text-cyan-600 dark:text-cyan-400',
      textClass: 'text-cyan-700 dark:text-cyan-300',
      bgBadgeClass: 'bg-cyan-50 dark:bg-cyan-950/60',
      borderBadgeClass: 'border-cyan-200 dark:border-cyan-800/50',
      headerGradient: 'from-cyan-500/15 via-teal-500/8 to-transparent',
      glowColor: 'shadow-cyan-500/25',
      accentColor: '#06b6d4',
    },
    Icon: AlfaOmegaLogo,
  },
  'red-apostolica': {
    key: 'red-apostolica',
    displayName: 'Red Apostólica',
    tagline: 'Cobertura Apostólica • Raíz & Liderazgo de Células',
    biblicalRef: 'Efesios 4:11-12',
    theme: {
      primaryClass: 'text-cyan-400 dark:text-cyan-300',
      textClass: 'text-cyan-300 dark:text-cyan-200',
      bgBadgeClass: 'bg-cyan-950/60 dark:bg-cyan-950/80',
      borderBadgeClass: 'border-cyan-400/40 dark:border-cyan-400/50',
      headerGradient: 'from-cyan-500/20 via-emerald-500/10 to-transparent',
      glowColor: 'shadow-cyan-500/30',
      accentColor: '#06b6d4',
    },
    Icon: RedApostolicaLogo,
  },
};

/**
 * Resuelve la identidad visual de la célula a partir de cualquier variante ortográfica
 */
export const getCellBranding = (cellName?: string | null): CellBrand => {
  const norm = normalizeCellKey(cellName ?? '');

  if (norm.includes('apostol') || norm.includes('redapostolica')) {
    return CELL_BRANDS['red-apostolica'];
  }
  if (norm.includes('vida')) {
    return CELL_BRANDS.vida;
  }
  if (norm.includes('saeta') || norm.includes('zaeta')) {
    return CELL_BRANDS.saetas;
  }
  if (norm.includes('maranata') || norm.includes('maranatha')) {
    return CELL_BRANDS.maranatha;
  }
  if (norm.includes('sion') || norm.includes('zion')) {
    return CELL_BRANDS.sion;
  }
  if (norm.includes('nissi') || norm.includes('nisi')) {
    return CELL_BRANDS.nissi;
  }
  if (
    norm.includes('alfa') ||
    norm.includes('alpha') ||
    norm.includes('omega') ||
    norm.includes('ao')
  ) {
    return CELL_BRANDS['alfa-omega'];
  }

  // Fallback con título dinámico
  const fallbackName = (cellName ?? 'Célula').trim();
  return {
    key: `custom-${norm || 'celula'}`,
    displayName: fallbackName,
    tagline: 'Comunidad de Vida • Fraternidad & Crecimiento',
    biblicalRef: 'Hechos 2:46',
    theme: {
      primaryClass: 'text-teal-600 dark:text-teal-400',
      textClass: 'text-teal-700 dark:text-teal-300',
      bgBadgeClass: 'bg-teal-50 dark:bg-teal-950/60',
      borderBadgeClass: 'border-teal-200 dark:border-teal-800/50',
      headerGradient: 'from-teal-500/15 via-emerald-500/8 to-transparent',
      glowColor: 'shadow-teal-500/25',
      accentColor: '#14b8a6',
    },
    Icon: DefaultCellLogo,
  };
};

/**
 * Identifica si un nombre corresponde a la Red Apostólica
 */
export const isRedApostolicaName = (cellName?: string | null): boolean => {
  const norm = normalizeCellKey(cellName ?? '');
  return norm.includes('apostol') || norm.includes('redapostolica');
};

/**
 * Componente de insignia / avatar de logo de Célula con tamaños ampliados
 */
interface CellLogoBadgeProps {
  cellName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showGlow?: boolean;
}

export const CellLogoBadge: React.FC<CellLogoBadgeProps> = ({
  cellName,
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const brand = getCellBranding(cellName);
  const IconComponent = brand.Icon;

  const sizeDimensions = {
    sm: { box: 'w-9 h-9 rounded-xl', icon: 22 },
    md: { box: 'w-12 h-12 rounded-2xl', icon: 32 },
    lg: { box: 'w-16 h-16 rounded-2xl', icon: 44 },
    xl: { box: 'w-20 h-20 rounded-3xl', icon: 58 },
    '2xl': { box: 'w-24 h-24 rounded-3xl', icon: 72 },
  }[size];

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-white dark:bg-[#0b1726] border border-cyan-500/20 dark:border-cyan-400/30 shadow-md transition-all duration-300 ${sizeDimensions.box} ${
        showGlow ? `${brand.theme.glowColor}` : ''
      } ${className}`}
      title={`${brand.displayName} - ${brand.tagline}`}
    >
      <div className="absolute inset-0 rounded-inherit opacity-25 bg-gradient-to-br from-[#00dfa2] to-[#06b6d4] pointer-events-none" />
      <IconComponent size={sizeDimensions.icon} />
    </div>
  );
};
