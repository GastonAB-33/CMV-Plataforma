import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  BookOpen,
  Users,
  Calendar,
  MapPin,
  Play,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Compass,
  GraduationCap,
  Award,
  HeartHandshake,
  ChevronRight,
  Cross,
  Sun,
  Tv,
} from 'lucide-react';

interface CulturaCongregacionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalonePage?: boolean;
}

export const CulturaCongregacionalModal: React.FC<CulturaCongregacionalModalProps> = ({
  isOpen,
  onClose,
  isStandalonePage = false,
}) => {
  const [activeSection, setActiveSection] = useState<'cultura' | 'vision' | 'celulas' | 'reuniones' | 'series' | 'proceso'>('cultura');
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevenir scroll en body cuando el modal está abierto
  useEffect(() => {
    if (isOpen && !isStandalonePage) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, isStandalonePage]);

  if (!isOpen) return null;

  const scrollTo = (id: string, sectionKey: typeof activeSection) => {
    setActiveSection(sectionKey);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const seriesData = [
    {
      id: 'V0l-88VdcrI',
      title: 'Contemplando a Cristo',
      subtitle: 'La mirada fija en el Autor de la Fe',
      desc: 'Enfocar nuestro corazón en la persona de Jesús para ser transformados de gloria en gloria por el Espíritu.',
      image: '/cmv-media-V0l-88VdcrI.jpg',
      category: 'Vida Espiritual',
      tagColor: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'G4h89p_2YRM',
      title: 'Una Nueva Fuente',
      subtitle: 'Sanidad del alma y nuevo fluir',
      desc: 'Cuando Dios sana la raíz de nuestra vida, manan aguas limpias que bendicen el hogar y la comunidad.',
      image: '/cmv-media-G4h89p_2YRM.jpg',
      category: 'Restauración',
      tagColor: 'from-amber-500 to-orange-500',
    },
    {
      id: 'rupF-LhFVho',
      title: 'Plantados Junto a Corrientes de Agua',
      subtitle: 'Firmeza, fruto continuo y prosperidad',
      desc: 'Fundamentos para no marchitarse en tiempos de sequía; permanecer arraigados en el río del Espíritu.',
      image: '/cmv-media-rupF-LhFVho.jpg',
      category: 'Fundamento',
      tagColor: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'lTgKn4DnY1I',
      title: 'Rompiendo los Límites',
      subtitle: 'Fe apostólica para ensanchar el territorio',
      desc: 'Derribar estructuras de temor y avanzar con valentía hacia el propósito que Dios diseñó para tu vida.',
      image: '/cmv-media-lTgKn4DnY1I.jpg',
      category: 'Fe Apostólica',
      tagColor: 'from-purple-600 to-pink-500',
    },
    {
      id: 'fPKoFCTQ11Q',
      title: 'La Buena Batalla de Fe',
      subtitle: 'Convicción y firmeza en la Palabra',
      desc: 'Pelear con las armas correctas: la oración perseverante, la verdad bíblica y la unidad de los santos.',
      image: '/cmv-media-fPKoFCTQ11Q.jpg',
      category: 'Doctrina',
      tagColor: 'from-rose-500 to-red-600',
    },
    {
      id: 'wOy42K7ccWM',
      title: 'El Manantial que Purifica',
      subtitle: 'Renovación integral del creyente',
      desc: 'El poder purificador de la gracia de Cristo operando en cada relación y compromiso ministerial.',
      image: '/cmv-media-wOy42K7ccWM.jpg',
      category: 'Consagración',
      tagColor: 'from-cyan-600 to-blue-700',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Altar',
      role: 'Primer Encuentro',
      desc: 'La reconciliación con Dios, arrepentimiento genuino y nacimiento a una nueva vida en Jesús.',
      color: 'border-cyan-500/40 text-cyan-500 dark:text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      icon: Sparkles,
    },
    {
      step: '02',
      title: 'Grupo (Célula)',
      role: 'Pertenencia en Hogares',
      desc: 'La iglesia en las casas: pastoreo de cercanía, comunión semanal, amistad y apoyo en la prueba.',
      color: 'border-emerald-500/40 text-emerald-500 dark:text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      icon: Users,
    },
    {
      step: '03',
      title: 'Experiencia',
      role: 'Sanidad y Libertad',
      desc: 'Retiro de encuentro profundo con el Espíritu Santo para sanar heridas del pasado y recibir plenitud.',
      color: 'border-amber-500/40 text-amber-500 dark:text-amber-400',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      icon: Flame,
    },
    {
      step: '04',
      title: 'Escuela EDDI',
      role: 'Discipulado Bíblico',
      desc: 'Formación doctrinal sistemática, carácter cristiano, estudio de las Escrituras y vida devocional.',
      color: 'border-blue-500/40 text-blue-500 dark:text-blue-400',
      badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      icon: GraduationCap,
    },
    {
      step: '05',
      title: 'Escuela EDEM',
      role: 'Entrenamiento Ministerial',
      desc: 'Preparación de líderes, desarrollo de talentos ministeriales y envío práctico para el servicio.',
      color: 'border-purple-500/40 text-purple-500 dark:text-purple-400',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      icon: Award,
    },
  ];

  return (
    <div
      className={`${
        isStandalonePage
          ? 'min-h-screen bg-[#FDFCFB] dark:bg-[#07090E] text-slate-900 dark:text-white'
          : 'fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex flex-col overflow-y-auto animate-in fade-in duration-300'
      } text-slate-900 dark:text-white selection:bg-cyan-500 selection:text-white`}
    >
      {/* =========================================================
          BARRA DE NAVEGACIÓN SUPERIOR (STICKY)
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0A0D14]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo y título institucional */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero', 'cultura')}>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-inner">
              <img src="/logo-cmv.png" alt="CMV" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
                  CMV Central
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase">
                  San Luis
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none mt-0.5">
                Cultura, Visión & Misión
              </h1>
            </div>
          </div>

          {/* Menú de anclas rápido (desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => scrollTo('cultura', 'cultura')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'cultura'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cultura
            </button>
            <button
              onClick={() => scrollTo('vision', 'vision')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'vision'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Misión & Visión
            </button>
            <button
              onClick={() => scrollTo('celulas', 'celulas')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'celulas'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grupos de Vida
            </button>
            <button
              onClick={() => scrollTo('reuniones', 'reuniones')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'reuniones'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reuniones
            </button>
            <button
              onClick={() => scrollTo('series', 'series')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'series'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Series
            </button>
            <button
              onClick={() => scrollTo('proceso', 'proceso')}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                activeSection === 'proceso'
                  ? 'bg-white dark:bg-cyan-500 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pipeline
            </button>
          </nav>

          {/* Botones de acción derecha */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/cmv_central/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/30 text-pink-600 dark:text-pink-300 text-xs font-extrabold hover:border-pink-500 transition-all"
            >
              <span>@cmv_central</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ventana"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <X size={18} />
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          CONTENEDOR PRINCIPAL EDITORIAL (ESTILO DRIBBLE REFUGE)
      ========================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-16 sm:space-y-24">
        {/* =======================================================
            1. HERO SECTION: "¡SIEMPRE SOS BIENVENIDO!"
        ======================================================= */}
        <section
          id="hero"
          className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-slate-200/90 dark:border-white/15 bg-gradient-to-b from-slate-900 via-[#0a1628] to-[#041a23] text-white shadow-2xl min-h-[520px] sm:min-h-[600px] flex flex-col justify-between p-6 sm:p-12 md:p-16 isolate"
        >
          {/* Fondo fotográfico real con overlay atmosférico */}
          <div className="absolute inset-0 -z-10">
            <img
              src="/church-gathering.jpg"
              alt="Cristo Manantial de Vida Congregación"
              className="w-full h-full object-cover object-center brightness-40 saturate-120"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041a23] via-[#09182b]/80 to-slate-900/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.25),transparent_50%)]" />
          </div>

          {/* Insignia superior */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-black tracking-widest uppercase">
              <Sparkles size={14} className="text-cyan-400" />
              <span>Auditorio Central · Av. España 1565</span>
            </div>

            <div className="text-right text-[11px] font-bold text-slate-300/80">
              San Luis, Argentina · Apóstoles José Hernández & Gabriela Castro
            </div>
          </div>

          {/* Titular Masivo: Estilo BE OUR GUEST */}
          <div className="my-auto py-8 sm:py-12 z-10 max-w-4xl">
            <span className="block text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-cyan-400 mb-2">
              Cristo Manantial de Vida
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.95] text-white font-sans">
              ¡SIEMPRE SOS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 italic font-serif">
                BIENVENIDO!
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-200 font-medium max-w-2xl leading-relaxed">
              Una casa apostólica de sanidad, transformación y paternidad de Reino. Donde fluye el manantial de aguas vivas que restaura a toda tu familia.
            </p>
          </div>

          {/* Botones y Badges Inferiores */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 z-10">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => scrollTo('cultura', 'cultura')}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-wider text-xs shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Nuestra Cultura</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => scrollTo('reuniones', 'reuniones')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-xs border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Calendar size={14} className="text-cyan-400" />
                <span>Reuniones Generales</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Domingos 10:30hs & 20hs · Miércoles Betel 21hs</span>
            </div>
          </div>
        </section>

        {/* =======================================================
            2. NUESTRA CULTURA ("Our Culture" en la referencia)
        ======================================================= */}
        <section id="cultura" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-[11px] font-black tracking-widest uppercase">
              <Sparkles size={12} />
              <span>ADN Espiritual & Identidad</span>
            </span>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Nuestra <span className="text-cyan-600 dark:text-cyan-400 italic font-serif">Cultura</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300 font-medium leading-relaxed">
              En Cristo Manantial de Vida no nos define solo lo que hacemos, sino el corazón con el que lo vivimos: una iglesia viva que abraza al quebrantado, levanta a la familia y entrena líderes con carácter de Reino.
            </p>
          </div>

          {/* Grilla Editorial: Foto cápsula + 3 Pilares con marcadores de color */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center pt-4">
            {/* Tarjeta Visual con Fotografía y titular estilizado (col-span 6) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">
                  Propósito Congregacional
                </span>
                <h4 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  Sanidad, Transformación y Pertenencia.
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Creemos en una comunidad donde nadie es un número. Cada persona que cruza las puertas del auditorio o ingresa a un Grupo de Vida encuentra una familia que lo cobija y un manantial que no se agota.
                </p>
              </div>

              {/* Cápsula de Imagen Curvada con botón de reproducción Betel */}
              <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl group">
                <img
                  src="/cmv-fellowship.jpg"
                  alt="Comunidad CMV Manantial de Vida"
                  className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                        Espacio de Adoración & Betel
                      </p>
                      <p className="text-sm font-bold text-white">
                        Vivir la presencia manifiesta de Dios
                      </p>
                    </div>
                    <a
                      href="https://www.youtube.com/@cmvcentralsl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                      title="Ver prédicas y alabanza"
                    >
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pilares con Viñetas de Color (col-span 6) - Idéntico a la referencia Dribbble */}
            <div className="lg:col-span-6 space-y-4">
              {/* Pilar 1: Azul / Cyan */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-2 border-l-4 border-l-cyan-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                    Adoración Extravagante & Betel
                  </span>
                </div>
                <h5 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Intimidad sin reservas ante el Señor
                </h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  No nos conformamos con una reunión pasiva; provocamos un ambiente de adoración libre y apasionada donde el Espíritu Santo quebranta, sana heridas del alma y desata milagros tangibles.
                </p>
              </div>

              {/* Pilar 2: Amarillo / Dorado */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-2 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Comunión en Grupos de Vida
                  </span>
                </div>
                <h5 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  La iglesia en las casas y en cada barrio
                </h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Nuestra red celular es el corazón relacional de CMV. Mesas compartidas, pastoreo cercano uno a uno, oración constante y contención familiar donde nadie camina en soledad.
                </p>
              </div>

              {/* Pilar 3: Rojo / Coral */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-2 border-l-4 border-l-rose-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                    Misericordia & Servicio con Pasión
                  </span>
                </div>
                <h5 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  El Evangelio demostrado en hechos concretos
                </h5>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Amor que sale de las cuatro paredes: asistencia alimentaria a través de viandas, meriendas para niños vulnerables, apoyo familiar y contención profesional en toda la comunidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            3. MISIÓN & VISIÓN INSTITUCIONAL CMV
        ======================================================= */}
        <section id="vision" className="space-y-6 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
              Rumbo Estratégico
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Misión & <span className="text-cyan-600 dark:text-cyan-400">Visión</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
              Los pilares apostólicos que rigen nuestro caminar congregacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarjeta VISIÓN */}
            <div className="relative p-7 sm:p-10 rounded-[2rem] bg-gradient-to-br from-cyan-950/20 via-white to-slate-50 dark:from-[#081827] dark:via-[#0A101C] dark:to-[#070B13] border border-cyan-500/30 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                <Compass size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
                  Hacia dónde vamos
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Nuestra Visión
                </h4>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                Ser una congregación de avanzada apostólica y celular que levanta generaciones apasionadas por Jesús, transformando la ciudad de San Luis y proyectando el Reino hacia las naciones a través de familias restauradas, células multiplicadoras y líderes con carácter maduro en Cristo.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">#AlcanceProvincial</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">#FamiliasRestauradas</span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">#VisiónCelular</span>
              </div>
            </div>

            {/* Tarjeta MISIÓN */}
            <div className="relative p-7 sm:p-10 rounded-[2rem] bg-gradient-to-br from-emerald-950/20 via-white to-slate-50 dark:from-[#062018] dark:via-[#0A101C] dark:to-[#070B13] border border-emerald-500/30 shadow-lg space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                  Cómo lo logramos
                </span>
                <h4 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Nuestra Misión
                </h4>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed font-medium">
                Alcanzar al necesitado con el Evangelio de la gracia, consolidarlo en el pastoreo de los Grupos de Vida, equiparlo con cimientos bíblicos inquebrantables en la Escuela de Discipulado (EDDI) y entrenarlo ministerialmente en la Escuela EDEM para enviarlo a transformar su entorno.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">#EvangelismoRelacional</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">#DiscipuladoEDDI</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">#LiderazgoEDEM</span>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            4. GRUPOS DE VIDA / CÉLULAS ("Small Groups" en Dribbble)
        ======================================================= */}
        <section
          id="celulas"
          className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 p-8 sm:p-14 md:p-16 text-white isolate shadow-2xl min-h-[380px] sm:min-h-[440px] flex flex-col justify-end scroll-mt-24"
        >
          {/* Fondo de convivencia en living / hogar */}
          <div className="absolute inset-0 -z-10">
            <img
              src="/cmv-fellowship.jpg"
              alt="Grupos de Vida en los hogares"
              className="w-full h-full object-cover object-center brightness-35 saturate-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold uppercase tracking-widest">
              <Users size={14} />
              <span>La Iglesia en las Casas</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
              Grupos de <span className="text-emerald-400 italic font-serif">Vida</span>
            </h3>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              Donde nadie camina solo. Nuestras células se reúnen cada semana en diferentes puntos de San Luis para compartir la mesa, orar por las necesidades reales y forjar lazos eternos de hermandad.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Células en Cada Barrio</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Cuidado Pastoral Cercano</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Amistad y Oración Continua</span>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            5. REUNIONES GENERALES CON LA CRUZ CENTRAL ("Events" en Dribbble)
        ======================================================= */}
        <section
          id="reuniones"
          className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-slate-800 bg-[#070B13] text-white p-8 sm:p-14 md:p-16 shadow-2xl isolate scroll-mt-24"
        >
          {/* Fondo sutil con brillo radial */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)]" />

          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
              Celebraciones Congregacionales
            </span>
            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Nuestras <span className="text-cyan-400">Reuniones</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Encuentros donde todo el cuerpo de Cristo se reúne en unidad para alabar y escuchar la Palabra.
            </p>
          </div>

          {/* Composición de 3 columnas: Domingos | Cruz Gigante Luminosa | Miércoles Betel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Columna Izquierda: DOMINGOS (col-span 4) */}
            <div className="md:col-span-4 text-center md:text-right space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-widest border border-cyan-400/30">
                Fin de Semana
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white">
                DOMINGOS
              </div>
              <div className="text-xl font-black text-cyan-400">
                10:30 hs & 20:00 hs
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reunión General de Celebración, Bautismos, Alabanza unida y predicación pastoral para toda la familia.
              </p>
            </div>

            {/* Columna Central: LA CRUZ MINIMALISTA LUMINOSA (col-span 4) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                {/* Aura resplandeciente */}
                <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
                
                {/* Cruz vectorial limpia idéntica al diseño de referencia */}
                <svg
                  className="w-24 h-36 sm:w-28 sm:h-44 text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
                  viewBox="0 0 100 140"
                  fill="currentColor"
                >
                  {/* Barra vertical */}
                  <rect x="42" y="0" width="16" height="140" rx="3" />
                  {/* Barra horizontal */}
                  <rect x="15" y="32" width="70" height="16" rx="3" />
                </svg>
              </div>
              <span className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400">
                Auditorio Central
              </span>
            </div>

            {/* Columna Derecha: MIÉRCOLES (BETEL) (col-span 4) */}
            <div className="md:col-span-4 text-center md:text-left space-y-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                Entre Semana
              </span>
              <div className="text-4xl sm:text-5xl font-black text-white">
                MIÉRCOLES
              </div>
              <div className="text-xl font-black text-amber-400">
                21:00 hs
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Espacio Betel · Noche de Fe, Alabanza Extravagante, ministración profética y clamor por milagros.
              </p>
            </div>
          </div>

          {/* Botón inferior con dirección oficial */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white text-xs font-bold">
              <MapPin size={16} className="text-cyan-400" />
              <span>Av. España N° 1565 · Ciudad de San Luis, Argentina</span>
            </div>
          </div>
        </section>

        {/* =======================================================
            6. "TODO SE TRATA DE JESÚS" ("IT'S ALL ABOUT JESUS" en Dribbble)
        ======================================================= */}
        <section className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/15 p-10 sm:p-16 md:p-20 text-center text-white isolate shadow-2xl bg-gradient-to-br from-slate-950 via-[#0B1E2E] to-[#042426]">
          {/* Fondo atmosférico de aguas / naturaleza */}
          <div className="absolute inset-0 -z-10">
            <img
              src="/fractal-glass-bg.jpg"
              alt="Aguas vivas de Cristo"
              className="w-full h-full object-cover brightness-25 saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-cyan-400">
              Nuestro Eje Supremo
            </span>

            {/* Titular Masivo en mayúsculas estilo Dribbble */}
            <h3 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
              TODO SE TRATA DE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-100 to-amber-200">
                JESÚS
              </span>
            </h3>

            <p className="text-base sm:text-lg text-slate-200 font-medium italic font-serif leading-relaxed pt-2">
              «El que cree en mí, como dice la Escritura, de su interior correrán ríos de agua viva.»
            </p>
            <span className="block text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              — Juan 7:38
            </span>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto pt-2">
              No nos predicamos a nosotros mismos, sino a Jesucristo como Señor; plantados junto a corrientes de aguas que nunca se secan.
            </p>
          </div>
        </section>

        {/* =======================================================
            7. SERIES ACTUALES & ENSEÑANZAS ("Current Series" en Dribbble)
        ======================================================= */}
        <section id="series" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
                Palabra & Fundamento
              </span>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                Series <span className="text-cyan-600 dark:text-cyan-400 italic font-serif">Actuales</span>
              </h3>
            </div>
            <a
              href="https://www.youtube.com/@cmvcentralsl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Ver todas en YouTube</span>
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Grilla de Tarjetas de Series idénticas al diseño Dribbble */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {seriesData.map((serie) => (
              <div
                key={serie.id}
                className="group rounded-3xl bg-white dark:bg-[#0C1019] border border-slate-200/90 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Portada HD de la Serie */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={serie.image}
                    alt={serie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Badge de Categoría */}
                  <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${serie.tagColor} shadow-md`}>
                    {serie.category}
                  </span>

                  {/* Botón flotante para reproducir */}
                  <button
                    type="button"
                    onClick={() => setSelectedVideo({ id: serie.id, title: serie.title })}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                    title="Reproducir mensaje"
                  >
                    <Play size={14} fill="currentColor" className="ml-0.5 text-slate-950" />
                  </button>
                </div>

                {/* Contenido textual */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {serie.title}
                    </h4>
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                      {serie.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {serie.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedVideo({ id: serie.id, title: serie.title })}
                      className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Prédica</span>
                      <ChevronRight size={14} />
                    </button>
                    <span className="text-[11px] font-bold text-slate-400">
                      CMV Central
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =======================================================
            8. GRAN TIPOGRAFÍA "C M V" CON FOTOS SUPERPUESTAS (ESTILO "REFUGE" DRIBBLE)
        ======================================================= */}
        <section id="identidad-cmv" className="relative overflow-hidden py-10 sm:py-16 text-center select-none scroll-mt-24">
          {/* Letras Gigantes de Bloque en Colores Vibrantes estilo REFUGE */}
          <div className="flex items-center justify-center font-black tracking-tight text-[8rem] sm:text-[14rem] md:text-[18rem] leading-none font-sans select-none drop-shadow-xs">
            <span className="text-blue-600/40 dark:text-blue-400/35">C</span>
            <span className="text-amber-500/45 dark:text-amber-400/40 px-1 sm:px-2">M</span>
            <span className="text-rose-600/40 dark:text-rose-400/35">V</span>
          </div>

          {/* Tres Tarjetas Fotográficas Superpuestas al frente */}
          <div className="max-w-4xl mx-auto -mt-16 sm:-mt-28 md:-mt-36 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 z-10 relative">
            <div className="rounded-3xl overflow-hidden border-2 border-white dark:border-white/20 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-300 bg-white dark:bg-[#0c121e]">
              <img src="/church-gathering.jpg" alt="Alabanza unida" className="w-full h-56 object-cover" />
              <div className="p-3.5 text-left">
                <p className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Adoración Congregacional</p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-gray-400">Auditorio Central en alabanza viva</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border-2 border-white dark:border-white/20 shadow-2xl sm:-translate-y-6 hover:translate-y-0 transition-transform duration-300 bg-white dark:bg-[#0c121e]">
              <img src="/cmv-fellowship.jpg" alt="Comunión fraterna" className="w-full h-56 object-cover" />
              <div className="p-3.5 text-left">
                <p className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Grupos de Vida</p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-gray-400">Comunión real en hogares de San Luis</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border-2 border-white dark:border-white/20 shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-300 bg-white dark:bg-[#0c121e]">
              <img src="/banner-hermanos.jpg" alt="Comunidad unida" className="w-full h-56 object-cover" />
              <div className="p-3.5 text-left">
                <p className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Paternidad & Discipulado</p>
                <p className="text-[11px] font-semibold text-slate-600 dark:text-gray-400">Líderes formados con amor y carácter</p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            9. EL PIPELINE ESPIRITUAL (5 ETAPAS DE CRECIMIENTO EN CMV)
        ======================================================= */}
        <section id="proceso" className="space-y-6 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
              Ruta de Formación
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              El Camino del <span className="text-cyan-600 dark:text-cyan-400">Discípulo</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
              El proceso pastoral mediante el cual cuidamos el crecimiento de cada creyente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {pipelineSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={`p-5 rounded-2xl bg-white dark:bg-[#0A0E18] border ${item.color} shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-300 dark:text-white/20">
                        {item.step}
                      </span>
                      <div className={`p-2 rounded-xl ${item.badge}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-gray-400">
                      {item.role}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =======================================================
            10. PIE DE PÁGINA INSTITUCIONAL & CONTACTO
        ======================================================= */}
        <footer className="pt-10 pb-8 border-t border-slate-200 dark:border-white/10 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center p-2">
                <img src="/logo-cmv.png" alt="CMV" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Cristo Manantial de Vida
                </h4>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Auditorio Central · Av. España 1565, San Luis, Argentina
                </p>
              </div>
            </div>

            {/* Redes Sociales Oficiales */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/cmv_central/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-white/5 dark:hover:bg-pink-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Instagram @cmv_central</span>
              </a>
              <a
                href="https://www.facebook.com/cmvcentral"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-white/5 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Facebook /cmvcentral</span>
              </a>
              <a
                href="https://www.youtube.com/@cmvcentralsl"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white dark:bg-white/5 dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>YouTube @cmvcentralsl</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
            <p>
              © {new Date().getFullYear()} Cristo Manantial de Vida. Paternidad pastoral: Apóstoles José Hernández & Gabriela Castro.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-black uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
            >
              Volver a la Plataforma
            </button>
          </div>
        </footer>
      </main>

      {/* =========================================================
          MODAL REPRODUCTOR DE VIDEO EMBEBIDO (YOUTUBE)
      ========================================================= */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-4xl bg-slate-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv size={18} className="text-cyan-400" />
                <h4 className="text-sm font-extrabold text-white truncate max-w-md">
                  {selectedVideo.title} · CMV Central
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-4 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Auditorio CMV Central San Luis</span>
              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
              >
                <span>Abrir en YouTube</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
