import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Download,
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  FileText,
  CheckCircle,
  Sparkles,
  Share2,
  Flame,
  Users2,
  Coins,
  Mic,
  BookMarked,
  Layers,
  GraduationCap,
} from 'lucide-react';

export interface ManualItem {
  id: string;
  title: string;
  badge: string;
  category: 'manual' | 'guia';
  etapaLabel: string;
  description: string;
  author: string;
  fileType: 'PDF' | 'GUIA';
  fileSizeOrDuration: string;
  readTimeMinutes: number;
  featured?: boolean;
  iconName: 'conector' | 'doctrina' | 'altar' | 'celula' | 'espiritu' | 'finanzas' | 'homiletica' | 'protocolo';
  keyVerses?: string[];
  contentOutline?: string[];
  summaryText?: string;
}

export const MANUALES_RECURSOS: ManualItem[] = [
  {
    id: 'man-conectores',
    title: 'Manual de los Discípulos Conectores',
    badge: 'DESTACADO • ETAPA 4',
    category: 'manual',
    etapaLabel: 'Discípulos Conectores',
    featured: true,
    description:
      'Guía metodológica integral para el discípulo conector de Cristo Manantial de Vida: estrategias de intercesión por hogares, activación del altar familiar, visita de consolidación y conexión activa de los nuevos hermanos a los Grupos de Vida y Células.',
    author: 'Colegio Pastoral CMV & Red de Discipulado',
    fileType: 'PDF',
    fileSizeOrDuration: '3.8 MB • 52 páginas',
    readTimeMinutes: 40,
    iconName: 'conector',
    keyVerses: ['Lucas 10:1-9', 'Juan 1:40-42', 'Hechos 20:20', '2 Timoteo 2:2'],
    contentOutline: [
      '1. El ADN y Propósito del Discípulo Conector',
      '2. El Altar Familiar como Punto Sagrado de Encuentro',
      '3. Pautas Prácticas para la Primera Visita y Ministración en Gracia',
      '4. Conectando al Hermano con la Célula y Grupo de Vida Adecuado',
      '5. Cuidado Pastoral, Seguimiento y Registro en la Plataforma Visión CMV',
      '6. Guerra Espiritual, Intercesión y Consolidación de la Cosecha',
    ],
    summaryText:
      'Este manual equipa a cada discípulo conector para ser el puente amoroso y eficaz entre el altar de la iglesia y la vida diaria del nuevo creyente en su hogar y célula.',
  },
  {
    id: 'man-eddi-1',
    title: 'Manual de Discipulado Básico - EDDI 1',
    badge: 'EDDI 1 • DOCTRINA',
    category: 'manual',
    etapaLabel: 'EDDI Escuela de Discipulado',
    description:
      'Guía oficial con 12 lecciones doctrinales esenciales para nuevos creyentes: el nuevo nacimiento, el bautismo en aguas y en el Espíritu Santo, la oración diaria y la cobertura eclesial.',
    author: 'Comisión Doctrinal CMV',
    fileType: 'PDF',
    fileSizeOrDuration: '4.2 MB • 64 páginas',
    readTimeMinutes: 45,
    iconName: 'doctrina',
    keyVerses: ['Juan 3:16', 'Romanos 10:9-10', '2 Corintios 5:17', 'Efesios 2:8-9'],
    contentOutline: [
      '1. El Plan de Salvación y el Nuevo Nacimiento',
      '2. La Seguridad de la Salvación y la Gracia Inmerecida',
      '3. El Bautismo en Aguas y el Bautismo en el Espíritu Santo',
      '4. La Importancia de la Oración Diaria y el Devocional Personal',
      '5. Cómo Leer, Meditar y Aplicar la Santa Palabra de Dios',
      '6. La Iglesia Local, el Cuerpo de Cristo y la Cobertura Espiritual',
    ],
    summaryText:
      'Fundamentos doctrinales innegociables para establecer una fe cristiana inconmovible y preparar al hermano para el crecimiento ministerial.',
  },
  {
    id: 'man-altar',
    title: 'Guía Práctica del Altar y la Vida Devocional',
    badge: 'ALTAR • DEVOCIONAL',
    category: 'manual',
    etapaLabel: 'Altar Familiar y Personal',
    description:
      'Manual paso a paso para encender y mantener el altar familiar, pautas prácticas de intercesión diaria, clamor por la congregación y lectura bíblica metódica en el hogar.',
    author: 'Pastor Carlos',
    fileType: 'GUIA',
    fileSizeOrDuration: '1.8 MB • 28 páginas',
    readTimeMinutes: 25,
    iconName: 'altar',
    keyVerses: ['Mateo 6:6', 'Salmos 5:3', '1 Tesalonicenses 5:17'],
    contentOutline: [
      '1. El Significado del Altar en el Antiguo y Nuevo Pacto',
      '2. Estableciendo una Rutina Diaria de Comunión en el Hogar',
      '3. El Patrón Bíblico de Oración del Padre Nuestro',
      '4. Clamor e Intercesión por la Familia y por la Célula',
    ],
    summaryText:
      'Pautas claras y espirituales para que cada hogar de la comunidad se convierta en una casa de adoración y clamor continuo.',
  },
  {
    id: 'man-eddi-3-celulas',
    title: 'Manual de Multiplicación Celular y Grupos de Vida - EDDI 3',
    badge: 'EDDI 3 • CÉLULAS',
    category: 'manual',
    etapaLabel: 'Liderazgo Celular',
    description:
      'Metodología oficial de Cristo Manantial de Vida para dirigir células y Grupos de Vida con fruto: la reunión semanal de 60 minutos, dinamismo participativo y metas de multiplicación anual.',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '5.6 MB • 76 páginas',
    readTimeMinutes: 60,
    iconName: 'celula',
    keyVerses: ['Hechos 2:42-47', 'Hechos 20:20', '2 Timoteo 2:2'],
    contentOutline: [
      '1. El ADN y la Visión de las Células CMV',
      '2. La Estructura de la Reunión Celular de 60 Minutos Paso a Paso',
      '3. El Arte de Conducir con Preguntas Bíblicas Aplicativas',
      '4. Cuidado Pastoral del Hermano Menor en el Grupo de Vida',
      '5. Formación de Nuevos Líderes (Timoteos) y la Multiplicación Anual',
    ],
    summaryText:
      'Herramientas prácticas para líderes y anfitriones con el fin de asegurar que cada célula crezca sana, con amor fraternal y multiplicación constante.',
  },
  {
    id: 'man-eddi-2-espiritu',
    title: 'Doctrina de la Vida en el Espíritu Santo - EDDI 2',
    badge: 'EDDI 2 • ESPÍRITU',
    category: 'manual',
    etapaLabel: 'Crecimiento Cristiano',
    description:
      'Estudio exhaustivo del bautismo en el Espíritu Santo, los dones de poder, el fruto del Espíritu Santo, la santidad bíblica y la victoria cotidiana sobre la tentación.',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '3.5 MB • 48 páginas',
    readTimeMinutes: 35,
    iconName: 'espiritu',
    keyVerses: ['Gálatas 5:22-23', 'Efesios 5:18', 'Romanos 8:14', 'Hechos 1:8'],
    contentOutline: [
      '1. La Persona y Obra del Espíritu Santo en el Creyente',
      '2. El Fruto del Espíritu frente a las Obras de la Carne',
      '3. La Activación de los Dones Espirituales para Edificación',
      '4. Santidad Práctica y Carácter en la Sociedad Contemporánea',
    ],
    summaryText:
      'Profundización en la vida llena del Espíritu para vivir en victoria moral y autoridad espiritual permanente.',
  },
  {
    id: 'man-finanzas',
    title: 'Mayordomía Bíblica y Finanzas del Reino',
    badge: 'MAYORDOMÍA • REINO',
    category: 'manual',
    etapaLabel: 'Formación Integral',
    description:
      'Principios bíblicos de mayordomía financiera familiar, fidelidad en diezmos y ofrendas, pactos de fe, desendeudamiento y generosidad apostólica.',
    author: 'Pastora Ana',
    fileType: 'PDF',
    fileSizeOrDuration: '2.1 MB • 32 páginas',
    readTimeMinutes: 30,
    iconName: 'finanzas',
    keyVerses: ['Malaquías 3:10', '2 Corintios 9:6-8', 'Proverbios 3:9-10'],
    contentOutline: [
      '1. El Señorío de Cristo sobre Todos los Recursos',
      '2. El Principio del Diezmo y la Generosidad Apostólica',
      '3. Salir de Deudas y Planificación Financiera Sabia',
      '4. Sembrar para la Cosecha del Reino y Bendición Generacional',
    ],
    summaryText:
      'Claves de mayordomía integral para que cada familia cristiana experimente la provisión y el favor de Dios.',
  },
  {
    id: 'man-edem',
    title: 'Manual de Homilética y Predicación Eficaz - EDEM',
    badge: 'EDEM • MINISTERIAL',
    category: 'manual',
    etapaLabel: 'Entrenamiento Ministerial',
    description:
      'Manual teológico y práctico para la preparación de sermones expositivos, temáticos y textuales. Ilustraciones, hermenéutica bíblica y ministración ungida en el altar.',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '6.1 MB • 84 páginas',
    readTimeMinutes: 70,
    iconName: 'homiletica',
    keyVerses: ['2 Timoteo 4:1-5', 'Esdras 7:10', 'Romanos 10:14-17'],
    contentOutline: [
      '1. La Naturaleza Sagrada de la Predicación Bíblica',
      '2. Hermenéutica: Cómo Interpretar el Texto en su Contexto Original',
      '3. Estructuración del Bosquejo Homilético y Puntos Centrales',
      '4. La Entrega del Mensaje, Uso de la Voz y el Llamado Final al Altar',
    ],
    summaryText:
      'Material de formación superior para pastores, evangelistas y predicadores llamados a proclamar con fidelidad la Palabra de Dios.',
  },
  {
    id: 'guia-bienvenida',
    title: 'Protocolo de Bienvenida y Consolidación (Primeros Pasos)',
    badge: 'PROTOCOLO • BIENVENIDA',
    category: 'guia',
    etapaLabel: 'Primeros Pasos',
    description:
      'Guía operativa para coordinadores y servidores: pasos de contacto en las primeras 48 horas, alta de ficha de bienvenida y asignación ágil a discípulos conectores.',
    author: 'Equipo de Bienvenida CMV',
    fileType: 'GUIA',
    fileSizeOrDuration: '1.2 MB • 18 páginas',
    readTimeMinutes: 15,
    iconName: 'protocolo',
    keyVerses: ['Mateo 25:35', 'Romanos 15:7'],
    contentOutline: [
      '1. Recepción en el Templo y Registro de Datos Iniciales',
      '2. El Primer Llamado Telefónico de 3 Minutos',
      '3. Coordinación de la Visita del Discípulo Conector',
      '4. Cierre del Ciclo y Traspaso al Registro de Altar',
    ],
    summaryText:
      'El protocolo fundamental para garantizar que ninguna persona nueva se sienta desatendida o perdida.',
  },
  {
    id: 'guia-grupos-vida',
    title: 'Protocolo de Dinámica de Grupos de Vida y Células',
    badge: 'PROTOCOLO • GRUPOS DE VIDA',
    category: 'guia',
    etapaLabel: 'Grupos de Vida',
    description:
      'Instrucciones operativas para líderes de célula sobre la subdivisión de grupos de vida internos, roles de líder y ayudante, y reporte de asistencia semanal.',
    author: 'Red de Células CMV',
    fileType: 'GUIA',
    fileSizeOrDuration: '1.5 MB • 24 páginas',
    readTimeMinutes: 20,
    iconName: 'protocolo',
    keyVerses: ['Hechos 2:46', 'Hebreos 10:24-25'],
    contentOutline: [
      '1. Estructura de Grupos de Vida dentro de la Célula Madre',
      '2. Rol del Anfitrión y Preparación del Hogar',
      '3. Administración del Tiempo y Dinámica de Oración Compartida',
      '4. Registro de Novedades y Asistencias en la Plataforma',
    ],
    summaryText:
      'Pautas para optimizar el pastoreo cercano dentro de cada célula a través de grupos de vida más íntimos y efectivos.',
  },
];

interface RecursosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const RecursosModal: React.FC<RecursosModalProps> = ({ isOpen, onClose, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'manuales' | 'guias'>('manuales');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManual, setSelectedManual] = useState<ManualItem | null>(null);

  const filteredItems = useMemo(() => {
    const list = activeTab === 'manuales' 
      ? MANUALES_RECURSOS.filter((item) => item.category === 'manual')
      : MANUALES_RECURSOS.filter((item) => item.category === 'guia');

    if (!searchTerm.trim()) {
      return list;
    }

    const term = searchTerm.toLowerCase();
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(term) ||
        m.description.toLowerCase().includes(term) ||
        m.author.toLowerCase().includes(term) ||
        m.etapaLabel.toLowerCase().includes(term) ||
        m.badge.toLowerCase().includes(term)
    );
  }, [activeTab, searchTerm]);

  const handleDownload = (manual: ManualItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onNotify(`Descargando "${manual.title}" (${manual.fileSizeOrDuration})...`, 'success');
  };

  const getManualIcon = (iconName: ManualItem['iconName'], isFeatured?: boolean) => {
    const className = isFeatured ? 'text-emerald-400' : 'text-teal-500 dark:text-teal-400';
    switch (iconName) {
      case 'conector':
        return <Share2 className={className} size={22} />;
      case 'doctrina':
        return <BookMarked className={className} size={22} />;
      case 'altar':
        return <Flame className={className} size={22} />;
      case 'celula':
        return <Users2 className={className} size={22} />;
      case 'espiritu':
        return <Sparkles className={className} size={22} />;
      case 'finanzas':
        return <Coins className={className} size={22} />;
      case 'homiletica':
        return <Mic className={className} size={22} />;
      case 'protocolo':
        return <Layers className={className} size={22} />;
      default:
        return <FileText className={className} size={22} />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0c1322] border-t sm:border border-slate-200 dark:border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Centro de Recursos */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl btn-3d-emerald text-white flex items-center justify-center font-black shadow-md shrink-0">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Recursos y Manuales
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Línea de Vida
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                Manuales oficiales, guías formativas y material de discipulado CMV
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal de recursos"
          >
            <X size={20} />
          </button>
        </div>

        {/* Si hay un manual abierto en lectura completa */}
        {selectedManual ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Barra superior de lectura */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedManual(null)}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Volver a la lista</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDownload(selectedManual, e)}
                className="btn-3d-emerald text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Download size={14} />
                <span>Descargar PDF</span>
              </button>
            </div>

            {/* Contenido detallado del manual */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 [scrollbar-width:thin]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    {selectedManual.badge}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">
                    {selectedManual.fileSizeOrDuration} • Lectura ~{selectedManual.readTimeMinutes} min
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {selectedManual.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  Autor / Comisión: <span className="text-slate-800 dark:text-gray-200 font-black">{selectedManual.author}</span>
                </p>
              </div>

              {/* Resumen */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-gray-400 block">
                  Descripción Doctrinal y Propósito
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 font-medium leading-relaxed">
                  {selectedManual.description}
                </p>
              </div>

              {/* Pasajes Bíblicos Clave */}
              {selectedManual.keyVerses && selectedManual.keyVerses.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <BookMarked size={15} /> Pasajes Bíblicos de Fundamento
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedManual.keyVerses.map((verse) => (
                      <span
                        key={verse}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-black/60 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black shadow-sm"
                      >
                        {verse}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Temario y Unidades */}
              {selectedManual.contentOutline && selectedManual.contentOutline.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                    <CheckCircle size={15} className="text-teal-500" />
                    Unidades de Estudio y Contenidos
                  </span>
                  <div className="rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 bg-slate-50/50 dark:bg-black/20 overflow-hidden shadow-sm">
                    {selectedManual.contentOutline.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 text-xs font-semibold text-slate-800 dark:text-gray-200 flex items-start gap-3 hover:bg-slate-100/60 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="w-6 h-6 rounded-lg btn-3d-emerald text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="leading-tight pt-1">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pie de modal en lectura */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">
                {selectedManual.fileType} • {selectedManual.fileSizeOrDuration}
              </span>
              <button
                type="button"
                onClick={(e) => handleDownload(selectedManual, e)}
                className="btn-3d-emerald text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download size={15} />
                <span>Descargar Manual Completo</span>
              </button>
            </div>
          </div>
        ) : (
          /* Vista de Exploración de Recursos y Manuales */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Selector de pestañas + Buscador */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 space-y-3.5 bg-slate-50/50 dark:bg-black/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('manuales')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'manuales'
                      ? 'btn-3d-pill-active'
                      : 'btn-3d-pill-inactive text-slate-700 dark:text-gray-300 hover:text-emerald-600'
                  }`}
                >
                  <BookOpen size={16} />
                  <span>Manuales ({MANUALES_RECURSOS.filter((i) => i.category === 'manual').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('guias')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'guias'
                      ? 'btn-3d-pill-active'
                      : 'btn-3d-pill-inactive text-slate-700 dark:text-gray-300 hover:text-emerald-600'
                  }`}
                >
                  <Layers size={16} />
                  <span>Guías y Protocolos ({MANUALES_RECURSOS.filter((i) => i.category === 'guia').length})</span>
                </button>
              </div>

              {/* Input de Búsqueda */}
              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder={activeTab === 'manuales' ? 'Buscar en manuales (ej: conectores, doctrina, altar)...' : 'Buscar protocolos y guías...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-[#080d17] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500/60 shadow-inner transition-all"
                />
              </div>
            </div>

            {/* Listado con scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 [scrollbar-width:thin]">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-gray-400 text-sm font-medium">
                  No se encontraron materiales que coincidan con la búsqueda.
                </div>
              ) : (
                filteredItems.map((manual) => (
                  <div
                    key={manual.id}
                    onClick={() => setSelectedManual(manual)}
                    className={`group relative rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      manual.featured
                        ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/30 dark:via-transparent dark:to-transparent shadow-md hover:border-emerald-500'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] hover:border-emerald-500/40 hover:bg-white dark:hover:bg-white/[0.06] shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          manual.featured
                            ? 'btn-3d-emerald text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {getManualIcon(manual.iconName, manual.featured)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                              manual.featured
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-gray-300 border-slate-300/60 dark:border-white/10'
                            }`}
                          >
                            {manual.badge}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-bold">
                            {manual.fileSizeOrDuration}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                          {manual.title}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-gray-400 font-medium line-clamp-2 mt-1">
                          {manual.description}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-white/5">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(manual, e)}
                        className="p-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors shrink-0"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedManual(manual)}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                          manual.featured
                            ? 'btn-3d-emerald text-white shadow-sm'
                            : 'btn-3d-pill-inactive text-slate-700 dark:text-gray-200 hover:text-emerald-600'
                        }`}
                      >
                        <span>Leer Manual</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie de modal con acceso directo a Escuelas */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 shrink-0">
              <span className="font-medium flex items-center gap-1.5">
                <GraduationCap size={16} className="text-emerald-500" />
                Material complementario de EDDI y EDEM
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-slate-600 dark:text-gray-300 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
