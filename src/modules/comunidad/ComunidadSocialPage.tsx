import React, { useState } from 'react';
import {
  Heart,
  Flame,
  Music,
  Share2,
  Bookmark,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  FileText,
  Plus,
  Compass,
  Home,
  Users,
  Search,
  MessageCircle,
  X,
  Sparkles,
  Coffee,
  HandHeart,
  Send,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Headphones,
  Radio,
  ExternalLink,
  Download,
  Calendar,
  MapPin,
  Clock,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ComunidadSocialPage: React.FC = () => {
  const { user } = useAuth();

  // Modo Claro / Oscuro
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Panel Ampliado In-Situ (sin cambiar de pantalla)
  type PanelType = 'devocional' | 'betel' | 'musica' | 'predica' | 'vida' | 'misericordia' | 'altar' | 'crear' | null;
  const [expandedPanel, setExpandedPanel] = useState<PanelType>(null);

  // Estados de Carrusel y Audio de Alex Morales
  const [alexCarouselIndex, setAlexCarouselIndex] = useState(0);
  const [isAlexAudioPlaying, setIsAlexAudioPlaying] = useState(false);
  const [alexAudioProgress, setAlexAudioProgress] = useState(38); // porcentaje

  const alexSlides = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      caption: 'Alex temprano en el altar matutino',
      tag: 'Oración 06:30 hs',
    },
    {
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80',
      caption: 'Notas de Filipenses 4 y un café caliente',
      tag: 'Palabra Clave',
    },
    {
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
      caption: 'Comunión con los hermanos al salir a trabajar',
      tag: 'Hermandad Viva',
    },
  ];

  // Estados interactivos Bento
  const [amenCount, setAmenCount] = useState(42);
  const [hasAmened, setHasAmened] = useState(false);
  const [betelCount, setBetelCount] = useState(28);
  const [isPrayingBetel, setIsPrayingBetel] = useState(false);
  const [volunteerJoined, setVolunteerJoined] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'betel' | 'devocionales' | 'vida' | 'musica'>('todos');
  
  // Hermano seleccionado para Caminar Juntos
  const [showBrotherModal, setShowBrotherModal] = useState(false);
  const [selectedBrother, setSelectedBrother] = useState({
    name: 'Alex Morales',
    role: 'Célula Emanuel • Servidor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isWalking: false,
  });

  // Feed Comunitario - Datos de Publicaciones (Instagram + Threads)
  interface PostComment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
  }

  interface FeedPost {
    id: string;
    author: string;
    avatar: string;
    cell: string;
    timeAgo: string;
    content: string;
    tags: string[];
    image?: string;
    hasAudio?: boolean;
    audioTitle?: string;
    audioDuration?: string;
    hugs: number;
    hasHugged: boolean;
    comments: PostComment[];
    showComments: boolean;
  }

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([
    {
      id: 'post-1',
      author: 'Marcos & Andrea',
      avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=150&q=80',
      cell: 'Célula Matrimonios Firmes',
      timeAgo: 'Hace 2 horas',
      content: 'Anoche nos reunimos en el patio con las familias para cerrar el taller sobre "Paciencia y Gracia en el Hogar". Hubo asado, muchas risas y un tiempo tremendo de oración por los hijos. Qué regalo es no caminar solos en esta etapa de crianza. Como dice Efesios 4:2: "Con toda humildad y mansedumbre, soportándoos con paciencia los unos a los otros en amor". 🌿🕊️✨',
      tags: ['#Matrimonios', '#FamiliaCMV', '#ComunionEnCasa'],
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      hugs: 48,
      hasHugged: false,
      showComments: false,
      comments: [
        {
          id: 'c1',
          author: 'Pastora Miriam',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
          text: '¡Hermosa noche hermanos! Gracias por abrir las puertas de su casa con tanta generosidad y amor.',
          time: 'Hace 1h',
        },
        {
          id: 'c2',
          author: 'Lucas Benítez',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
          text: '¡Esos momentos de mesa compartida edifican a toda la iglesia! Abrazo grande.',
          time: 'Hace 30m',
        },
      ],
    },
    {
      id: 'post-2',
      author: 'Facundo Gómez',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      cell: 'Ministerio Misericordia • Célula Vida',
      timeAgo: 'Hace 4 horas',
      content: 'Hoy salimos temprano con los termos de café caliente y las viandas para la Plaza Central. Nos cruzamos con Don Pedro; nos contó de su semana y pudimos orar por trabajo y salud para su familia. Ver sus lágrimas transformadas en paz nos recuerda por qué servimos. "De gracia recibisteis, dad de gracia" (Mateo 10:8). Si alguien tiene una frazada o abrigo limpio para sumar este sábado, avísenme por acá 🙏☕',
      tags: ['#MisericordiaEnAccion', '#ManosDeCristo', '#OracionEnLaCalle'],
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
      hasAudio: true,
      audioTitle: 'Nota de Fe: Oración con Don Pedro en la plaza',
      audioDuration: '0:45 min',
      hugs: 64,
      hasHugged: false,
      showComments: false,
      comments: [
        {
          id: 'c3',
          author: 'Agustina Flores',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          text: '¡Qué testimonio Facu! Este sábado llevo termos extra y dos cajas de ropa de abrigo que juntamos.',
          time: 'Hace 3h',
        },
        {
          id: 'c4',
          author: 'Alex Morales',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          text: 'Amén hermano, intercediendo por Don Pedro y su familia desde el altar.',
          time: 'Hace 2h',
        },
      ],
    },
    {
      id: 'post-3',
      author: 'Valentina Ríos',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      cell: 'Universitarios CMV',
      timeAgo: 'Hace 6 horas',
      content: 'En plena semana de finales de la facultad, el café no alcanza si el corazón no reposa en Su presencia. Esta mañana me aferré a Salmo 46:10: "Estad quietos, y sabed que yo soy Dios". No estudiamos desde la ansiedad o el miedo, estudiamos para honrar a Dios con excelencia. ¡Abrazo fuerte a todos los que están rindiendo materias esta semana! 📚🧉✨',
      tags: ['#UniversitariosCMV', '#PazEnFinales', '#Salmo46'],
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
      hugs: 52,
      hasHugged: false,
      showComments: false,
      comments: [
        {
          id: 'c5',
          author: 'Mateo Rossi',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          text: '¡Fuerzas Vale! Dios te respalda en cada examen, el Señor es tu sabiduría.',
          time: 'Hace 5h',
        },
        {
          id: 'c6',
          author: 'Sofi',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          text: '¡Ese pasaje es clave! Mañana merendamos y oramos por los exámenes juntas.',
          time: 'Hace 4h',
        },
      ],
    },
    {
      id: 'post-4',
      author: 'Santiago & Agustina Flores',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      cell: 'CMV Adoración',
      timeAgo: 'Hace 9 horas',
      content: 'Terminando el ensayo para este domingo. Hay una melodía que Dios viene poniendo en nuestras oraciones estos días sobre volver al primer amor y rendir todo en el altar. Les dejamos un fragmento acústico de 30 segundos para que lo escuchen en su tiempo devocional de hoy. ¿Qué canción sienten que el Señor les está recordando últimamente? 🎶🎹🎸',
      tags: ['#AlabanzaCMV', '#AltarEncendido', '#VolverAlPrimerAmor'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      hasAudio: true,
      audioTitle: 'Volver al Primer Amor (Fragmento Acústico)',
      audioDuration: '0:34 min',
      hugs: 91,
      hasHugged: false,
      showComments: false,
      comments: [
        {
          id: 'c7',
          author: 'Pr. Daniel',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
          text: 'Ministró mucho mi corazón este ensayo. El domingo será un tiempo glorioso para la casa.',
          time: 'Hace 8h',
        },
        {
          id: 'c8',
          author: 'Camila',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
          text: '¡Esa melodía no se me va de la cabeza! Gracias por guiarnos a Su presencia.',
          time: 'Hace 7h',
        },
      ],
    },
  ]);

  // Manejo de interacciones del feed
  const [playingAudioPostId, setPlayingAudioPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const togglePostHug = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newHugged = !post.hasHugged;
          showNotification(newHugged ? 'Abrazo fraterno enviado ❤️' : 'Abrazo cancelado');
          return {
            ...post,
            hasHugged: newHugged,
            hugs: newHugged ? post.hugs + 1 : post.hugs - 1,
          };
        }
        return post;
      })
    );
  };

  const togglePostComments = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, showComments: !post.showComments } : post
      )
    );
  };

  const addCommentToPost = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment: PostComment = {
            id: `c-${Date.now()}`,
            author: user?.name || 'Mateo Rossi',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
            text,
            time: 'Recién',
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
            showComments: true,
          };
        }
        return post;
      })
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    showNotification('Comentario compartido con la comunidad');
  };

  const togglePostAudio = (postId: string) => {
    if (playingAudioPostId === postId) {
      setPlayingAudioPostId(null);
      showNotification('Audio pausado');
    } else {
      setPlayingAudioPostId(postId);
      showNotification('Reproduciendo nota de fe...');
    }
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleAmen = () => {
    if (hasAmened) {
      setAmenCount((prev) => prev - 1);
      setHasAmened(false);
    } else {
      setAmenCount((prev) => prev + 1);
      setHasAmened(true);
      showNotification('Has meditado en el devocional. ¡Gloria a Dios!');
    }
  };

  const toggleBetelPrayer = () => {
    if (isPrayingBetel) {
      setBetelCount((prev) => prev - 1);
      setIsPrayingBetel(false);
    } else {
      setBetelCount((prev) => prev + 1);
      setIsPrayingBetel(true);
      showNotification('Te uniste en intercesión al Altar de Betel. 🙏');
    }
  };

  const handleVolunteer = () => {
    setVolunteerJoined(true);
    showNotification('¡Te sumaste como voluntario de Misericordia este sábado!');
  };

  const toggleWalkingTogether = () => {
    setSelectedBrother((prev) => ({
      ...prev,
      isWalking: !prev.isWalking,
    }));
    showNotification(
      !selectedBrother.isWalking
        ? `Ahora caminas en oración con ${selectedBrother.name}. Sus motivos estarán en tu altar.`
        : `Dejaste de llevar a ${selectedBrother.name} en tu cuaderno.`
    );
  };

  const toggleAlexAudio = () => {
    setIsAlexAudioPlaying(!isAlexAudioPlaying);
    showNotification(!isAlexAudioPlaying ? 'Reproduciendo audio devocional...' : 'Audio pausado');
  };

  const nextAlexSlide = () => {
    setAlexCarouselIndex((prev) => (prev + 1) % alexSlides.length);
  };

  const prevAlexSlide = () => {
    setAlexCarouselIndex((prev) => (prev - 1 + alexSlides.length) % alexSlides.length);
  };

  // Clases semánticas según Tema Claro/Oscuro
  const themeBg = isDarkMode ? 'bg-[#0A0D14] text-white' : 'bg-[#F4F6FB] text-slate-900';
  const headerBg = isDarkMode ? 'bg-[#101420]/90 border-white/10' : 'bg-white/95 border-slate-200/90 shadow-sm';
  const inputBg = isDarkMode ? 'bg-[#182030] border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-800';

  return (
    <div className={`min-h-screen ${themeBg} transition-colors duration-300 pb-36 font-sans relative`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#141b2b] border border-[#2dd4bf] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf] animate-ping" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Superior Fraterno con Toggle de Modo Claro/Oscuro */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-4 sm:px-8 py-3.5 transition-colors ${headerBg}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo e Identidad */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpandedPanel(null)}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#2dd4bf] flex items-center justify-center text-[#0a1820] font-black text-xl shadow-lg shadow-[#06b6d4]/20 hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight">CMV Comunidad</h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40">
                  En Comunión
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>El Muro de la Casa • Hechos 2:42</p>
            </div>
          </div>

          {/* Buscador inteligente */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Buscar hermanos, células, devocionales o dones..."
                className={`w-full text-xs rounded-xl pl-9 pr-4 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#06b6d4] transition-all ${inputBg}`}
              />
              <Search className={`w-4 h-4 absolute left-3 top-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Acciones de Cabecera: Modo Claro/Oscuro, Oración y Perfil */}
          <div className="flex items-center gap-2.5">
            {/* Toggle Modo Claro / Oscuro */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? 'bg-[#182030] hover:bg-[#202b40] border-white/10 text-[#38bdf8]'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
              }`}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notificaciones de Oración Activa */}
            <button
              onClick={() => showNotification('Lucas y 3 hermanos oraron por tu motivo hace 5 min')}
              className={`relative p-2.5 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-[#182030] hover:bg-[#202b40] border-white/10 text-white/80' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
              title="Oraciones por ti"
            >
              <Heart className="w-4 h-4 text-[#f43f5e]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2dd4bf] border-2 border-[#101420]" />
            </button>

            {/* Perfil del Hermano */}
            <div
              onClick={() => setExpandedPanel('altar')}
              className="flex items-center gap-2.5 pl-2 cursor-pointer group"
              title="Abrir Mi Altar y Cuaderno Espiritual"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#856CBD] via-[#06b6d4] to-[#2dd4bf] p-[2px]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold block group-hover:text-[#06b6d4] transition-colors leading-none">
                  {user?.name || 'Mateo Rossi'}
                </span>
                <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>Célula Vida</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Píldoras de Navegación / Filtros Rápidos (Con acceso directo al panel) */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 mt-5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
        <button
          onClick={() => {
            setSelectedFilter('todos');
            setExpandedPanel(null);
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'todos'
              ? 'bg-gradient-to-r from-[#06b6d4] to-[#2dd4bf] text-[#0a1820] shadow-md shadow-[#06b6d4]/20'
              : isDarkMode
              ? 'bg-[#141b2a] text-white/80 border border-white/10 hover:bg-[#1c263c]'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🏛️</span> Todo el Cuerpo
        </button>

        <button
          onClick={() => {
            setSelectedFilter('betel');
            setExpandedPanel('betel');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'betel'
              ? 'bg-gradient-to-r from-[#856CBD] to-[#a855f7] text-white shadow-md shadow-purple-500/20'
              : isDarkMode
              ? 'bg-[#1e1338] text-purple-200 border border-purple-800/40 hover:bg-[#281b49]'
              : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
          }`}
        >
          <span>🔥</span> Tiempos de Betel
        </button>

        <button
          onClick={() => {
            setSelectedFilter('devocionales');
            setExpandedPanel('devocional');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'devocionales'
              ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#042f2e] shadow-md shadow-emerald-500/20'
              : isDarkMode
              ? 'bg-[#09221d] text-emerald-200 border border-emerald-800/40 hover:bg-[#0e2f28]'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span>📖</span> Devocional de Alex
        </button>

        <button
          onClick={() => {
            setSelectedFilter('vida');
            setExpandedPanel('vida');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'vida'
              ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-white shadow-md'
              : isDarkMode
              ? 'bg-[#0c2438] text-sky-200 border border-sky-800/40 hover:bg-[#12314d]'
              : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
          }`}
        >
          <span>☕</span> Vida & Té Bíblico
        </button>

        <button
          onClick={() => {
            setSelectedFilter('musica');
            setExpandedPanel('musica');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'musica'
              ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white shadow-md'
              : isDarkMode
              ? 'bg-[#0c1f3d] text-cyan-200 border border-cyan-800/40 hover:bg-[#122c57]'
              : 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100'
          }`}
        >
          <span>🎵</span> Playlists
        </button>
      </nav>

      {/* Grid Bento Asimétrico y Colorido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          
          {/* ======================================================== */}
          {/* WIDGET 1: DEVOCIONAL DEL DÍA (Alex) CON CARRUSEL DE FOTOS + AUDIO */}
          {/* Color: Mint, Esmeralda & Turquesa */}
          {/* ======================================================== */}
          <article
            className={`md:col-span-2 rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#0a231d] via-[#081a16] to-[#061511] border-[#2dd4bf]/30 shadow-[#2dd4bf]/5 hover:border-[#2dd4bf]/60'
                : 'bg-gradient-to-br from-[#f0fdf4] via-[#ecfdf5] to-[#e6fffa] border-[#34d399]/40 shadow-emerald-500/10 hover:border-[#10b981]'
            }`}
          >
            {/* Halo de luz turquesa */}
            <div className="absolute -top-14 -right-14 w-52 h-52 bg-[#2dd4bf]/15 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Encabezado con Botón de Ampliación In-Situ */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2dd4bf] to-[#06b6d4] p-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Alex"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Alex Morales</h3>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#2dd4bf]/20 text-[#2dd4bf] font-bold border border-[#2dd4bf]/30">
                        Devocional & Carrusel
                      </span>
                    </div>
                    <p className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>07:15 hs • Célula Emanuel</p>
                  </div>
                </div>

                {/* Botón Ampliar Panel */}
                <button
                  onClick={() => setExpandedPanel('devocional')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-[#132d26] hover:bg-[#1a3d33] border-[#2dd4bf]/30 text-[#2dd4bf]'
                      : 'bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800'
                  }`}
                  title="Ampliar devocional y carrusel"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ampliar</span>
                </button>
              </div>

              {/* CARRUSEL DE IMÁGENES + AUDIO EN SIMULTÁNEO */}
              <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/10 group/carousel">
                <div className="aspect-[16/9] w-full relative">
                  <img
                    src={alexSlides[alexCarouselIndex].image}
                    alt={alexSlides[alexCarouselIndex].caption}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Tag y Caption de la Foto */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#2dd4bf] border border-[#2dd4bf]/40">
                      {alexSlides[alexCarouselIndex].tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <p className="text-xs font-semibold text-white drop-shadow truncate pr-2">
                      {alexSlides[alexCarouselIndex].caption}
                    </p>
                    <span className="text-[11px] text-white/70 font-mono flex-shrink-0">
                      {alexCarouselIndex + 1}/{alexSlides.length}
                    </span>
                  </div>

                  {/* Flechas de Navegación del Carrusel */}
                  <button
                    onClick={prevAlexSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
                    title="Foto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextAlexSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
                    title="Siguiente foto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Indicadores de diapositiva */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {alexSlides.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === alexCarouselIndex ? 'w-5 bg-[#2dd4bf]' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Versículo Bíblico Destacado */}
              <blockquote
                className={`border-l-4 border-[#2dd4bf] rounded-2xl p-3.5 my-2 ${
                  isDarkMode ? 'bg-[#0f2c24]/70' : 'bg-white/80'
                }`}
              >
                <p className="text-xs text-[#2dd4bf] uppercase tracking-widest font-extrabold mb-1">Filipenses 4:6-7</p>
                <p className={`text-xs sm:text-sm font-semibold italic leading-relaxed ${isDarkMode ? 'text-white/95' : 'text-slate-800'}`}>
                  "Por nada estéis afanosos; antes bien, sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias."
                </p>
              </blockquote>

              {/* REPRODUCTOR DE AUDIO DE ALEX (Sincronizado) */}
              <div
                className={`mt-3 p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDarkMode ? 'bg-[#0c221c] border-[#2dd4bf]/20' : 'bg-white border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleAlexAudio}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform shadow-md shadow-[#2dd4bf]/20"
                    title={isAlexAudioPlaying ? 'Pausar audio' : 'Escuchar reflexión en audio'}
                  >
                    {isAlexAudioPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                  </button>
                  <div>
                    <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Reflexión en audio de Alex
                    </span>
                    <span className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                      1 min 24 seg • {isAlexAudioPlaying ? 'Reproduciendo...' : 'Pausado'}
                    </span>
                  </div>
                </div>

                {/* Ondas Dinámicas */}
                <div className="flex items-center gap-1">
                  <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-5 animate-pulse' : 'h-2'}`} />
                  <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-7 animate-pulse' : 'h-4'}`} />
                  <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-3 animate-pulse' : 'h-2'}`} />
                  <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-6 animate-pulse' : 'h-3'}`} />
                </div>
              </div>
            </div>

            {/* Footer de Reacción Fraterna */}
            <div className={`mt-5 pt-4 border-t flex items-center justify-between flex-wrap gap-2 ${isDarkMode ? 'border-white/10' : 'border-emerald-200'}`}>
              <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-[#0a231d]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="img" />
                  <img className="w-6 h-6 rounded-full border-2 border-[#0a231d]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80" alt="img" />
                  <img className="w-6 h-6 rounded-full border-2 border-[#0a231d]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&q=80" alt="img" />
                </div>
                <span>{amenCount} hermanos meditaron hoy</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAmen}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border ${
                    hasAmened
                      ? 'bg-[#2dd4bf] text-[#042f2e] border-[#2dd4bf]'
                      : isDarkMode
                      ? 'bg-[#0f2c24] hover:bg-[#2dd4bf] text-white hover:text-[#042f2e] border-[#2dd4bf]/40'
                      : 'bg-white hover:bg-[#2dd4bf] text-slate-800 hover:text-[#042f2e] border-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{hasAmened ? '¡Amén registrado!' : 'Amén / Meditado'}</span>
                </button>
              </div>
            </div>
          </article>

          {/* ======================================================== */}
          {/* WIDGET 2: TIEMPOS DE BETEL (Oración Espontánea) */}
          {/* Color: Deep Purple, Violeta & Acento Cálido Naranja */}
          {/* ======================================================== */}
          <article
            className={`rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#241344] via-[#1b0e35] to-[#140a28] border-[#856CBD]/40 shadow-purple-500/10 hover:border-[#a855f7]'
                : 'bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe] border-[#c084fc]/50 shadow-purple-500/10 hover:border-[#9333ea]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#856CBD]/20 via-transparent to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  Tiempos de Betel
                </span>

                <button
                  onClick={() => setExpandedPanel('betel')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-[#311c57] hover:bg-[#412674] border-[#856CBD]/40 text-purple-200'
                      : 'bg-white hover:bg-purple-100 border-purple-300 text-purple-900'
                  }`}
                  title="Ampliar Altar de Betel"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className={`text-base font-extrabold mt-2 relative z-10 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Oraciones Espontáneas
              </h3>
              <p className={`text-xs mt-1 relative z-10 leading-relaxed ${isDarkMode ? 'text-purple-200/70' : 'text-purple-950/70'}`}>
                Motivos compartidos para intercesión inmediata de toda la iglesia.
              </p>

              {/* Tarjeta de Petición Activa */}
              <div
                className={`mt-4 p-4 rounded-2xl border relative z-10 ${
                  isDarkMode ? 'bg-[#1b0d36]/90 border-purple-500/30' : 'bg-white/90 border-purple-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#856CBD] to-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                    M
                  </div>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Familia Gutiérrez</span>
                  <span className={`text-[10px] ml-auto ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Hace 12 min</span>
                </div>
                <p className={`text-xs italic ${isDarkMode ? 'text-purple-100/90' : 'text-slate-700'}`}>
                  "Pidiendo fortaleza por la salud de la abuela Rosa en su estudio médico de este jueves. Creemos en sanidad."
                </p>
              </div>
            </div>

            <div className="mt-5 relative z-10">
              <div className={`flex items-center justify-between text-xs mb-2 ${isDarkMode ? 'text-purple-200/70' : 'text-purple-800'}`}>
                <span>🔥 {betelCount} hermanos intercediendo</span>
                <span className="text-[#2dd4bf] font-bold text-[11px]">En vivo</span>
              </div>

              <button
                onClick={toggleBetelPrayer}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isPrayingBetel
                    ? 'bg-[#2dd4bf] text-[#042f2e] ring-2 ring-orange-400'
                    : 'bg-gradient-to-r from-[#856CBD] via-[#9333ea] to-orange-500 text-white hover:brightness-110'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>{isPrayingBetel ? 'Orando en Altar Activo 🙏' : 'Me uno en oración'}</span>
              </button>
            </div>
          </article>

          {/* ======================================================== */}
          {/* WIDGET 3: PLAYLISTS DE ADORACIÓN (Agustina Flores) */}
          {/* Color: Cyan Eléctrico, Azul & Turquesa */}
          {/* ======================================================== */}
          <article
            className={`rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#072c44] via-[#092238] to-[#061828] border-[#0ea5e9]/40 shadow-cyan-500/10 hover:border-[#38bdf8]'
                : 'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#ecfeff] border-[#38bdf8]/50 shadow-sky-500/10 hover:border-[#0284c7]'
            }`}
          >
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#38bdf8]/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Altar Sonoro
                </span>

                <button
                  onClick={() => setExpandedPanel('musica')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-[#0f3856] hover:bg-[#164e77] border-[#0ea5e9]/40 text-cyan-200'
                      : 'bg-white hover:bg-sky-100 border-sky-300 text-sky-900'
                  }`}
                  title="Ampliar Playlist"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Lo que escucha la comunidad
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-cyan-200/70' : 'text-slate-600'}`}>
                Canciones que ministran esta semana
              </p>

              {/* Tarjeta de Agustina Flores */}
              <div
                className={`mt-4 p-3.5 rounded-2xl border flex items-center gap-3 ${
                  isDarkMode ? 'bg-[#0a2338]/90 border-[#0ea5e9]/20' : 'bg-white/90 border-sky-200 shadow-sm'
                }`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80"
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-[#38bdf8] fill-current" />
                  </div>
                </div>
                <div className="overflow-hidden flex-1">
                  <span className={`text-xs font-bold truncate block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Fuego de Dios (Acústico)
                  </span>
                  <p className={`text-[11px] truncate ${isDarkMode ? 'text-cyan-200/70' : 'text-slate-600'}`}>
                    En la playlist de <strong>Agustina Flores</strong>
                  </p>
                  <span className="text-[10px] text-[#2dd4bf] font-medium">CMV Adoración • 4:20</span>
                </div>
              </div>
            </div>

            <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-sky-200'}`}>
              <button
                onClick={() => setExpandedPanel('musica')}
                className="text-xs font-bold text-[#38bdf8] hover:underline flex items-center gap-1"
              >
                <span>Ver lista completa</span>
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* ======================================================== */}
          {/* WIDGET 4: ÚLTIMA PRÉDICA Y BOSQUEJO */}
          {/* Color: Azul Real, Índigo Profundo */}
          {/* ======================================================== */}
          <article
            className={`md:col-span-2 rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#101b3d] via-[#0d1633] to-[#090f24] border-[#3b82f6]/40 shadow-blue-500/10 hover:border-[#60a5fa]'
                : 'bg-gradient-to-br from-[#eff6ff] via-[#e0e7ff] to-[#f8fafc] border-[#93c5fd]/50 shadow-blue-500/10 hover:border-[#2563eb]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">
                    Última Prédica
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>Domingo Pasado</span>
                </div>
                <h3 className={`text-base font-extrabold mt-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Serie: Raíces en Aguas Profundas • Parte 3
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showNotification('Descargando Bosquejo & Guía de Célula en PDF...')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-colors ${
                    isDarkMode ? 'bg-[#182652] hover:bg-[#223572] border-blue-500/30 text-blue-200' : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Guía PDF</span>
                </button>

                <button
                  onClick={() => setExpandedPanel('predica')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    isDarkMode ? 'bg-[#182652] hover:bg-[#223572] border-blue-500/30 text-blue-200' : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-800'
                  }`}
                  title="Ampliar prédica y análisis"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview de Video y Puntos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div
                onClick={() => setExpandedPanel('predica')}
                className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center cursor-pointer group/video"
              >
                <img
                  src="https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=400&q=80"
                  alt="Prédica"
                  className="w-full h-full object-cover opacity-75 group-hover/video:scale-105 transition-transform"
                />
                <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-[#38bdf8] text-white flex items-center justify-center font-bold shadow-xl group-hover/video:scale-110 transition-transform">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-mono">
                  41:20
                </span>
              </div>

              <div className="flex flex-col justify-between text-xs space-y-2">
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#121f47]/80 border-blue-500/20' : 'bg-white/80 border-blue-200'}`}>
                  <p className="font-bold text-[11px] uppercase tracking-wide text-[#38bdf8]">Principio Clave:</p>
                  <p className={`mt-1 italic ${isDarkMode ? 'text-blue-100/90' : 'text-slate-700'}`}>
                    "No creces cuando todo es cómodo; tus raíces bajan cuando el desierto te obliga a buscar el agua viva."
                  </p>
                </div>

                <div className={`flex items-center justify-between text-[11px] px-1 ${isDarkMode ? 'text-white/60' : 'text-slate-600'}`}>
                  <span>💬 19 notas de hermanos</span>
                  <button
                    onClick={() => setExpandedPanel('predica')}
                    className="text-[#38bdf8] font-bold hover:underline"
                  >
                    Ver análisis completo &rarr;
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* ======================================================== */}
          {/* WIDGET 5: POLAROIDS COMUNITARIAS & MISERICORDIA */}
          {/* FOTO ACTUALIZADA: REUNIÓN REAL EN CASA DE SOFI ("Grow your faith") */}
          {/* Color: Turquesa, Verde & Naranja Cálido */}
          {/* ======================================================== */}
          <article
            className={`md:col-span-2 rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#0c2e26] via-[#0d272d] to-[#091b1d] border-[#14b8a6]/40 shadow-teal-500/10 hover:border-[#2dd4bf]'
                : 'bg-gradient-to-br from-[#f0fdfa] via-[#ecfeff] to-[#fff7ed] border-[#5eead4]/50 shadow-teal-500/10 hover:border-[#0d9488]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]" />
                  <h3 className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Comunión en la Casa & Misericordia
                  </h3>
                </div>

                <button
                  onClick={() => setExpandedPanel('vida')}
                  className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-[#153f36] hover:bg-[#1d574b] border-[#14b8a6]/40 text-teal-200'
                      : 'bg-white hover:bg-teal-50 border-teal-300 text-teal-900'
                  }`}
                  title="Ampliar fotos comunitarias"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className={`text-xs mb-4 ${isDarkMode ? 'text-teal-100/70' : 'text-slate-600'}`}>
                La fe en el té de la tarde, la lectura bíblica y la ayuda práctica a quienes lo necesitan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Polaroid 1 - FOTO ACTUALIZADA DE CASA DE SOFI ("Grow your faith") */}
                <div
                  onClick={() => setExpandedPanel('vida')}
                  className="bg-white p-3 rounded-2xl shadow-lg transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer group/polaroid"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                    <img
                      src="/images/comunion-casa-sofi.jpg"
                      alt="Célula de Jóvenes en casa de Sofi - Grow your faith"
                      className="w-full h-full object-cover group-hover/polaroid:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                      ✨ "Grow your faith"
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    "Tardecita de té, mates y Filipenses en casa de Sofi ☕📖"
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    Célula de Jóvenes: merienda, Biblias abiertas y mucha fe
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>Por Sofi, Camila & Célula Conexión</span>
                    <span className="text-rose-500 font-bold">❤️ 38 abrazos</span>
                  </div>
                </div>

                {/* Misericordia */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-[#29170e]/90 border-orange-500/30' : 'bg-orange-50 border-orange-200 shadow-sm'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-500/30">
                      Ministerio Misericordia
                    </span>
                    <h4 className={`text-xs font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Viandas & Abrigo Plaza Central
                    </h4>
                    <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-orange-200/70' : 'text-slate-600'}`}>
                      Este sábado 10:00 hs. Armado de viandas y abrigo para 20 familias del barrio.
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-orange-500/20' : 'border-orange-200'}`}>
                    <span className="text-[11px] font-bold text-orange-400">
                      {volunteerJoined ? '13 / 15 Voluntarios' : '12 / 15 Voluntarios'}
                    </span>
                    <button
                      onClick={handleVolunteer}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all active:scale-95 shadow ${
                        volunteerJoined
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white'
                      }`}
                    >
                      {volunteerJoined ? '¡Anotado! 💛' : '✋ Me anoto'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>

        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN FEED COMUNITARIO: EL SCROLL SOCIAL (THREADS + INSTAGRAM) */}
        {/* 4 EJEMPLOS DE PUBLICACIONES DE HERMANOS CON INTERACCIONES REALES */}
        {/* ========================================================================= */}
        <section className="mt-14 max-w-2xl mx-auto">
          {/* Cabecera del Feed Social */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2dd4bf] to-[#06b6d4] flex items-center justify-center text-[#042f2e] font-bold shadow-md shadow-[#2dd4bf]/20">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  El Muro de la Casa • Feed Comunitario
                </h2>
                <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                  El scroll fraterno diario: vidas, hogares, oraciones y testimonios vivos
                </p>
              </div>
            </div>

            <button
              onClick={() => setExpandedPanel('crear')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>

          {/* Lista de Publicaciones en Scroll (4 Ejemplos) */}
          <div className="space-y-6">
            {feedPosts.map((post) => (
              <article
                key={post.id}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xl ${
                  isDarkMode
                    ? 'bg-[#121826] border-white/10 hover:border-white/20 shadow-black/40'
                    : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-slate-200/50'
                }`}
              >
                {/* Cabecera del Post (Autor, Célula, Tiempo & Caminar Juntos) */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.avatar}
                      alt={post.author}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#2dd4bf]/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {post.author}
                        </h3>
                        <span className="w-1 h-1 rounded-full bg-white/40" />
                        <span className={`text-[11px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                          {post.timeAgo}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#2dd4bf]">
                        {post.cell}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBrother({
                        name: post.author,
                        role: post.cell,
                        image: post.avatar,
                        isWalking: false,
                      });
                      setShowBrotherModal(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      isDarkMode
                        ? 'bg-[#192338] hover:bg-[#202e49] border-white/10 text-white/90 hover:text-white'
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    <span className="hidden sm:inline">Caminar Juntos</span>
                  </button>
                </div>

                {/* Texto del Post (Estilo Threads) */}
                <div className="px-4 sm:px-5 pb-3">
                  <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isDarkMode ? 'text-white/90' : 'text-slate-800'
                  }`}>
                    {post.content}
                  </p>

                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isDarkMode
                            ? 'bg-[#18233a] text-[#38bdf8]'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Media del Post (Foto / Polaroid) */}
                {post.image && (
                  <div className="px-4 sm:px-5 pb-3">
                    <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-black/40 border border-white/5 relative group">
                      <img
                        src={post.image}
                        alt="Foto de la publicación"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Micro-Reproductor de Audio (si tiene audio adjunto) */}
                {post.hasAudio && (
                  <div className="px-4 sm:px-5 pb-3">
                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-[#18233a] border-[#2dd4bf]/30' : 'bg-emerald-50/80 border-emerald-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePostAudio(post.id)}
                          className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
                        >
                          {playingAudioPostId === post.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5 fill-current" />
                          )}
                        </button>
                        <div>
                          <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {post.audioTitle}
                          </p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                            {post.audioDuration} • {playingAudioPostId === post.id ? 'Reproduciendo...' : 'Pausado'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`w-1 rounded-full bg-[#2dd4bf] ${playingAudioPostId === post.id ? 'h-6 animate-pulse' : 'h-2'}`} />
                        <span className={`w-1 rounded-full bg-[#2dd4bf] ${playingAudioPostId === post.id ? 'h-8 animate-pulse' : 'h-4'}`} />
                        <span className={`w-1 rounded-full bg-[#2dd4bf] ${playingAudioPostId === post.id ? 'h-4 animate-pulse' : 'h-2'}`} />
                        <span className={`w-1 rounded-full bg-[#2dd4bf] ${playingAudioPostId === post.id ? 'h-7 animate-pulse' : 'h-3'}`} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Barra de Acciones / Reacciones (Instagram + Threads) */}
                <div className={`px-4 sm:px-5 py-3 border-t flex items-center justify-between ${
                  isDarkMode ? 'border-white/10' : 'border-slate-100'
                }`}>
                  <div className="flex items-center gap-4">
                    {/* Botón de Abrazo Fraterno (Like) */}
                    <button
                      onClick={() => togglePostHug(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 ${
                        post.hasHugged
                          ? 'text-rose-500'
                          : isDarkMode
                          ? 'text-white/60 hover:text-rose-400'
                          : 'text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.hasHugged ? 'fill-current' : ''}`} />
                      <span>{post.hugs} abrazos</span>
                    </button>

                    {/* Botón de Comentarios (Threads) */}
                    <button
                      onClick={() => togglePostComments(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} respuestas</span>
                    </button>
                  </div>

                  {/* Acciones Secundarias: Llevar a mi Altar & Compartir */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showNotification(`Motivo de ${post.author} guardado en tu Altar de Oración 🙏`)}
                      className={`p-2 rounded-xl transition-colors ${
                        isDarkMode ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Llevar a mi Altar de Oración"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => showNotification('Enlace de la publicación copiado al portapapeles')}
                      className={`p-2 rounded-xl transition-colors ${
                        isDarkMode ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                      title="Compartir"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hilo de Respuestas / Comentarios (Desplegable) */}
                {post.showComments && (
                  <div className={`p-4 sm:p-5 border-t space-y-3 ${
                    isDarkMode ? 'bg-[#0e1420] border-white/10' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {/* Lista de comentarios existentes */}
                    <div className="space-y-2.5">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                          <img
                            src={comment.avatar}
                            alt={comment.author}
                            className="w-7 h-7 rounded-xl object-cover mt-0.5"
                          />
                          <div className={`flex-1 p-2.5 rounded-2xl ${
                            isDarkMode ? 'bg-[#161f30]' : 'bg-white border border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {comment.author}
                              </span>
                              <span className={`text-[10px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                                {comment.time}
                              </span>
                            </div>
                            <p className={isDarkMode ? 'text-white/80' : 'text-slate-700'}>
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input para responder en el hilo */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Escribe una palabra de aliento o bendición..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCommentToPost(post.id);
                        }}
                        className={`flex-1 text-xs rounded-xl px-3.5 py-2 border focus:outline-none focus:ring-1 focus:ring-[#2dd4bf] ${
                          isDarkMode
                            ? 'bg-[#182338] border-white/10 text-white placeholder-white/40'
                            : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                        }`}
                      />
                      <button
                        onClick={() => addCommentToPost(post.id)}
                        className="p-2 rounded-xl bg-[#2dd4bf] hover:bg-[#25b5a3] text-[#042f2e] transition-colors"
                        title="Enviar respuesta"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* BARRA DE NAVEGACIÓN FLOTANTE (Con ampliación directa in-situ) */}
      {/* ======================================================== */}
      <aside className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav
          className={`pointer-events-auto backdrop-blur-2xl border px-3 py-2 rounded-full shadow-2xl flex items-center gap-1 sm:gap-3 transition-all ${
            isDarkMode
              ? 'bg-[#101420]/90 border-white/15 shadow-black/80'
              : 'bg-white/95 border-slate-300 shadow-slate-900/15'
          }`}
        >
          {/* 1. Muro Casa */}
          <button
            onClick={() => {
              setExpandedPanel(null);
              setSelectedFilter('todos');
              showNotification('Muro de la Casa activo');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`p-3 rounded-full transition-colors ${
              expandedPanel === null ? 'text-[#2dd4bf]' : isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Inicio / Muro Casa"
          >
            <Home className="w-6 h-6" />
          </button>

          <span className={`w-[1px] h-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* 2. Tiempos de Betel */}
          <button
            onClick={() => setExpandedPanel('betel')}
            className={`p-3 rounded-full transition-colors ${
              expandedPanel === 'betel' ? 'text-purple-400' : isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Tiempos de Betel (Oraciones en vivo)"
          >
            <Flame className="w-6 h-6" />
          </button>

          {/* 3. BOTÓN CENTRAL CREAR / COMPARTIR */}
          <div className="px-1">
            <button
              onClick={() => setExpandedPanel('crear')}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#2dd4bf] via-[#06b6d4] to-[#3b82f6] hover:scale-105 active:scale-95 text-[#042f2e] flex items-center justify-center font-black shadow-lg shadow-[#06b6d4]/25 transition-transform"
              title="Compartir con la Hermandad"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 4. Playlists / Alabanza */}
          <button
            onClick={() => setExpandedPanel('musica')}
            className={`p-3 rounded-full transition-colors ${
              expandedPanel === 'musica' ? 'text-[#38bdf8]' : isDarkMode ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Altar Sonoro & Playlists"
          >
            <Music className="w-6 h-6" />
          </button>

          <span className={`w-[1px] h-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />

          {/* 5. Mi Altar & Hermandad */}
          <button
            onClick={() => setExpandedPanel('altar')}
            className={`p-3 rounded-full transition-colors ${
              expandedPanel === 'altar' ? 'ring-2 ring-[#2dd4bf]' : ''
            }`}
            title="Mi Altar & Compañeros"
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#2dd4bf] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </nav>
      </aside>

      {/* ========================================================================= */}
      {/* VISTA AMPLIADA IN-SITU (MODAL/SHEET EXPANDIBLE SIN CAMBIAR DE INTERFAZ) */}
      {/* ========================================================================= */}
      {expandedPanel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-6 relative overflow-hidden my-auto ${
              isDarkMode
                ? 'bg-[#101524] border-white/20 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Botón Cerrar */}
            <button
              onClick={() => setExpandedPanel(null)}
              className={`absolute top-5 right-5 p-2 rounded-full border transition-all ${
                isDarkMode ? 'bg-[#182033] hover:bg-[#222e49] border-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
              title="Cerrar vista ampliada"
            >
              <X className="w-5 h-5" />
            </button>

            {/* CONTENIDO AMPLIADO SEGÚN EL PANEL SELECCIONADO */}

            {/* 1. DEVOCIONAL AMPLIADO (Alex Morales) */}
            {expandedPanel === 'devocional' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2dd4bf] to-[#06b6d4] p-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                      alt="Alex"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Alex Morales • Devocional en Detalle</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                      Célula Emanuel • Filipenses 4:6-7 • Publicado a las 07:15 hs
                    </p>
                  </div>
                </div>

                {/* Carrusel Ampliado de Fotos */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-black">
                  <img
                    src={alexSlides[alexCarouselIndex].image}
                    alt={alexSlides[alexCarouselIndex].caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <p className="text-sm font-bold">{alexSlides[alexCarouselIndex].caption}</p>
                    <span className="text-xs bg-black/60 px-2.5 py-1 rounded-full border border-white/20">
                      Foto {alexCarouselIndex + 1} de {alexSlides.length}
                    </span>
                  </div>

                  <button
                    onClick={prevAlexSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextAlexSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Reproductor de Audio Completo */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isDarkMode ? 'bg-[#152438] border-[#0ea5e9]/30' : 'bg-sky-50 border-sky-200'}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleAlexAudio}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] flex items-center justify-center font-bold shadow-lg"
                    >
                      {isAlexAudioPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold">Reflexión Pastoral de Alex (Voz en Vivo)</p>
                      <p className={`text-[11px] ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                        Duración: 1:24 min • Audio oficial grabado para la congregación
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-6 animate-pulse' : 'h-2'}`} />
                    <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-9 animate-pulse' : 'h-4'}`} />
                    <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-4 animate-pulse' : 'h-2'}`} />
                    <span className={`w-1 rounded-full bg-[#2dd4bf] ${isAlexAudioPlaying ? 'h-8 animate-pulse' : 'h-5'}`} />
                  </div>
                </div>

                {/* Texto del Devocional */}
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0f1b29] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2dd4bf] mb-2">Reflexión para el Día:</h4>
                  <p className="text-sm leading-relaxed">
                    "Hermanos, hoy mientras oraba temprano me di cuenta cuánto tiempo gastamos preocupándonos por cosas que Dios ya prometió sostener. Filipenses 4 nos enseña que la paz de Dios que sobrepasa todo entendimiento no llega cuando resolvemos todo por nuestras fuerzas, sino cuando entregamos todo en el altar de oración. ¡Dejemos hoy esa carga y caminemos en Su paz!"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={toggleAmen}
                    className="px-5 py-2.5 rounded-2xl bg-[#2dd4bf] text-[#042f2e] font-extrabold text-xs shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{hasAmened ? '¡Amén registrado!' : 'Decir Amén / Meditado'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBrother({
                        name: 'Alex Morales',
                        role: 'Célula Emanuel • Servidor',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                        isWalking: false,
                      });
                      setShowBrotherModal(true);
                    }}
                    className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 ${
                      isDarkMode ? 'bg-[#182338] border-white/20 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4 text-[#2dd4bf]" />
                    <span>Caminar juntos en oración</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. TIEMPOS DE BETEL AMPLIADO */}
            {expandedPanel === 'betel' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#856CBD] to-orange-500 flex items-center justify-center text-white">
                    <Flame className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Tiempos de Betel • Altar Comunitario en Vivo</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-purple-200/70' : 'text-slate-500'}`}>
                      {betelCount} hermanos intercediendo en este momento • 1 Pedro 5:7
                    </p>
                  </div>
                </div>

                {/* Lista de motivos espontáneos */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1d1033] border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Familia Gutiérrez • Salud</span>
                      <span className="text-[10px] text-orange-400 font-bold">Urgente</span>
                    </div>
                    <p className="text-xs italic">
                      "Pidiendo fortaleza por la salud de la abuela Rosa en su estudio médico de este jueves. Creemos en sanidad."
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1d1033] border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Lucas Benítez • Exámenes y Paz</span>
                      <span className="text-[10px] text-purple-400 font-bold">Hace 45 min</span>
                    </div>
                    <p className="text-xs italic">
                      "Rindiendo el final de la carrera mañana. Pido oración para que el Señor me dé claridad y serenidad."
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#1d1033] border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Hermano Carlos • Testimonio de Gratitud</span>
                      <span className="text-[10px] text-[#2dd4bf] font-bold">Respondido ✓</span>
                    </div>
                    <p className="text-xs italic">
                      "¡Dios abrió puertas de trabajo esta mañana! Gracias a todos los que estuvieron orando conmigo."
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={toggleBetelPrayer}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#856CBD] to-orange-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <Flame className="w-4 h-4 fill-current" />
                    <span>{isPrayingBetel ? 'Orando en Altar Activo 🙏' : 'Unirme a la Intercesión'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setExpandedPanel('crear');
                    }}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold ${
                      isDarkMode ? 'bg-[#21143b] border-purple-400/30 text-purple-200' : 'bg-white border-purple-200 text-purple-900'
                    }`}
                  >
                    + Alzar mi Petición
                  </button>
                </div>
              </div>
            )}

            {/* 3. ALTAR SONORO / PLAYLIST AMPLIADA */}
            {expandedPanel === 'musica' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#3b82f6] flex items-center justify-center text-white">
                    <Music className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Altar Sonoro • Música que edifica hoy</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-cyan-200/70' : 'text-slate-500'}`}>
                      Playlist comunitaria compartida por Agustina Flores y el equipo de alabanza
                    </p>
                  </div>
                </div>

                {/* Lista de canciones */}
                <div className="space-y-2">
                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#0f243b] border-[#0ea5e9]/30' : 'bg-sky-50 border-sky-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#06b6d4] text-[#042f2e] flex items-center justify-center font-bold">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Fuego de Dios (Acústico)</p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>CMV Adoración • En la playlist de Agustina Flores</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#2dd4bf]">4:20</span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#0f243b] border-[#0ea5e9]/20' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Canto Espontáneo en Betel</p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Grabado en vivo en la vigilia del viernes</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#2dd4bf]">6:15</span>
                  </div>

                  <div className={`p-3 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-[#0f243b] border-[#0ea5e9]/20' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Salmo 23 (En Vivo)</p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Adoración congregacional dominical</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#2dd4bf]">5:04</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => showNotification('Abriendo en Spotify')}
                    className="flex-1 py-3 rounded-2xl bg-[#1db954] hover:bg-[#1aa34a] text-black font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir en Spotify</span>
                  </button>

                  <button
                    onClick={() => showNotification('Abriendo en YouTube Music')}
                    className="flex-1 py-3 rounded-2xl bg-[#ff0000] hover:bg-[#e60000] text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir en YouTube</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. PRÉDICA AMPLIADA */}
            {expandedPanel === 'predica' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-[#38bdf8] flex items-center justify-center text-white">
                    <Play className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Serie: Raíces en Aguas Profundas • Parte 3</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-blue-200/70' : 'text-slate-500'}`}>
                      Prédica dominical • 41 min 20 seg • Pr. Daniel
                    </p>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=800&q=80"
                    alt="Prédica"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => showNotification('Reproduciendo prédica completa')}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-[#38bdf8] text-white flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform"
                    >
                      <Play className="w-7 h-7 ml-1 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => showNotification('Descargando bosquejo en PDF')}
                    className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Bosquejo & Guía de Célula</span>
                  </button>

                  <button
                    onClick={() => showNotification('Abriendo hilo de comentarios')}
                    className={`px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                      isDarkMode ? 'bg-[#182338] border-white/20 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    💬 Ver 19 reflexiones comunitarias
                  </button>
                </div>
              </div>
            )}

            {/* 5. VIDA EN LA CASA & POLAROIDS AMPLIADO (CON FOTO ACTUALIZADA CASA DE SOFI) */}
            {expandedPanel === 'vida' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2dd4bf] to-amber-500 flex items-center justify-center text-white">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">Vida en Comunión • Polaroids de la Casa</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-teal-200/70' : 'text-slate-500'}`}>
                      Momentos informales, meriendas, té y estudio bíblico en los hogares
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Polaroid Real Casa de Sofi */}
                  <div className="bg-white p-3 rounded-2xl shadow-lg">
                    <div className="relative rounded-xl overflow-hidden mb-2">
                      <img
                        src="/images/comunion-casa-sofi.jpg"
                        alt="Reunión en casa de Sofi"
                        className="w-full aspect-[4/3] object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-sm">
                        🌿 "Grow your faith"
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      "Tardecita de té, mates y Filipenses en casa de Sofi ☕📖"
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Llenamos el living para merendar, compartir la mesa y sumergirnos juntas en Filipenses 4. Qué hermoso ver corazones jóvenes hambrientos de la presencia de Dios.
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>Por Sofi, Camila & Célula Conexión</span>
                      <span className="text-rose-500 font-bold">❤️ 38 abrazos fraternos</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-2xl shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80"
                      alt="Hermanos"
                      className="rounded-xl w-full aspect-[4/3] object-cover mb-2"
                    />
                    <p className="text-xs font-bold text-slate-800">"Desayuno y oración antes de salir a la misión 🍞"</p>
                    <p className="text-[11px] text-slate-600 mt-1">Equipo de Jóvenes • Sábado pasado compartiendo en hermandad</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <span>Grupo Misión</span>
                      <span className="text-rose-500 font-bold">❤️ 29 abrazos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setExpandedPanel('crear')}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] font-extrabold text-xs shadow-lg"
                  >
                    + Subir Foto de Nuestra Reunión
                  </button>
                </div>
              </div>
            )}

            {/* 6. MI ALTAR & HERMANOS (Caminar juntos) */}
            {expandedPanel === 'altar' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#856CBD] via-[#06b6d4] to-[#2dd4bf] p-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold">{user?.name || 'Mateo Rossi'} • Mi Altar</h2>
                    <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                      Célula Vida • 14 hermanos oran contigo en el camino
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#141d2e] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf] mb-2">Dinámica Fraterna de CMV</h4>
                  <p className="text-xs leading-relaxed">
                    Aquí no tienes "seguidores" que alimenten el ego secular. Tienes <strong>compañeros de intercesión</strong>. Al "Caminar Juntos", sus motivos se guardan en tu altar y los suyos en el tuyo.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold">Hermanos con los que caminas en oración:</h4>
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img className="w-8 h-8 rounded-xl object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Alex" />
                      <div>
                        <p className="text-xs font-bold">Alex Morales</p>
                        <p className="text-[11px] text-white/50">Célula Emanuel</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#2dd4bf]">En Altar ✓</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img className="w-8 h-8 rounded-xl object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Agustina" />
                      <div>
                        <p className="text-xs font-bold">Agustina Flores</p>
                        <p className="text-[11px] text-white/50">Ministerio Adoración</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#2dd4bf]">En Altar ✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* 7. MODAL COMPARTIR / CREAR */}
            {expandedPanel === 'crear' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-extrabold">Compartir con la Congregación</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>
                    Edificar al cuerpo, agradecer una victoria o abrir un motivo de Betel
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button className="p-2.5 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#06b6d4] text-[#042f2e] font-extrabold text-xs flex flex-col items-center gap-1 shadow">
                    <span>📷</span> Polaroid
                  </button>
                  <button className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-[#182338] border-white/10 text-white' : 'bg-slate-100 border-slate-300'}`}>
                    <span>🎙️</span> Nota Fe
                  </button>
                  <button className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-[#182338] border-white/10 text-white' : 'bg-slate-100 border-slate-300'}`}>
                    <span>📖</span> Verso
                  </button>
                  <button className={`p-2.5 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1 ${isDarkMode ? 'bg-[#182338] border-white/10 text-white' : 'bg-slate-100 border-slate-300'}`}>
                    <span>🔥</span> Betel
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="¿Qué hizo Dios hoy? ¿Qué leyeron en el té o en la célula?..."
                  className={`w-full rounded-2xl p-3.5 text-xs border focus:outline-none focus:ring-2 focus:ring-[#06b6d4] ${inputBg}`}
                />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setExpandedPanel(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setExpandedPanel(null);
                      showNotification('¡Momento compartido con toda la casa con éxito!');
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#2dd4bf] via-[#06b6d4] to-[#3b82f6] text-[#042f2e] font-extrabold text-xs shadow-lg active:scale-95 transition-transform"
                  >
                    Publicar en el Muro
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CAMINAR JUNTOS / HERMANO */}
      {/* ======================================================== */}
      {showBrotherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-3xl p-6 shadow-2xl w-full max-w-md relative ${
              isDarkMode ? 'bg-[#131b2e] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#856CBD] to-[#2dd4bf] p-[2px]">
                  <img
                    src={selectedBrother.image}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{selectedBrother.name}</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>{selectedBrother.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBrotherModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`my-4 p-3.5 rounded-2xl border text-xs space-y-2 ${isDarkMode ? 'bg-[#0f1728] border-white/5 text-white/70' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-2 text-[#2dd4bf] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Dinámica Comunitaria de CMV</span>
              </div>
              <p className="leading-relaxed">
                En nuestra congregación <strong>no existe el 'Seguir / Dejar de seguir'</strong> selectivo para evitar exclusión o camarillas. Todos formamos un mismo cuerpo.
              </p>
              <p className={`leading-relaxed text-[11px] ${isDarkMode ? 'text-white/50' : 'text-slate-500'}`}>
                Al <strong>Caminar Juntos</strong>, intercedes por este hermano, llevas sus motivos en tu altar privado y te notificamos cuando Dios responde sus oraciones.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs py-2 px-1">
              <span className={isDarkMode ? 'text-white/60' : 'text-slate-500'}>Compañeros de intercesión:</span>
              <span className="font-bold text-[#2dd4bf]">24 hermanos oran juntos</span>
            </div>

            <button
              onClick={toggleWalkingTogether}
              className={`w-full mt-3 py-3 rounded-2xl font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                selectedBrother.isWalking
                  ? 'bg-[#2dd4bf] text-[#042f2e]'
                  : 'bg-gradient-to-r from-[#2dd4bf] via-[#06b6d4] to-[#3b82f6] text-[#042f2e]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{selectedBrother.isWalking ? 'Caminando juntos en oración ✓' : 'Caminar Juntos en Oración'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
