import React, { useState } from 'react';
import {
  Heart,
  Flame,
  Music,
  Share2,
  Bookmark,
  CheckCircle2,
  Play,
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const ComunidadSocialPage: React.FC = () => {
  const { user } = useAuth();

  // Estados interactivos
  const [amenCount, setAmenCount] = useState(42);
  const [hasAmened, setHasAmened] = useState(false);
  const [betelCount, setBetelCount] = useState(28);
  const [isPrayingBetel, setIsPrayingBetel] = useState(false);
  const [volunteerJoined, setVolunteerJoined] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'betel' | 'devocionales' | 'vida' | 'musica'>('todos');
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrotherModal, setShowBrotherModal] = useState(false);
  const [selectedBrother, setSelectedBrother] = useState({
    name: 'Alex Morales',
    role: 'Célula Emanuel • Servidor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isWalking: false,
  });

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
      showNotification('Te uniste en oración por la Familia Gutiérrez. 🙏');
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

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-[#FFFF4C] selection:text-[#1A1A1A] pb-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1A1A1A] border border-[#A9E5C8] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A9E5C8] animate-ping" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Superior Fraterno */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFF4C] flex items-center justify-center text-[#1A1A1A] font-black text-xl shadow-lg shadow-[#FFFF4C]/20">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">CMV Comunidad</h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#856CBD]/20 text-[#A9E5C8] border border-[#856CBD]/40">
                  En Comunión
                </span>
              </div>
              <p className="text-xs text-white/50">El Muro de la Casa • Hechos 2:42</p>
            </div>
          </div>

          {/* Buscador inteligente */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Buscar hermanos, células, devocionales o dones..."
                className="w-full bg-[#242424] text-xs text-white placeholder-white/40 pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#FFFF4C] focus:ring-1 focus:ring-[#FFFF4C] transition-all"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            </div>
          </div>

          {/* Notificaciones y Perfil */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => showNotification('Lucas y 3 hermanos oraron por tu motivo hace 5 min')}
              className="relative p-2.5 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] border border-white/10 text-white/80 hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4 text-[#A9E5C8]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#A9E5C8] border-2 border-[#1A1A1A]" />
            </button>

            <div
              onClick={() => {
                setSelectedBrother({
                  name: user?.name || 'Mateo Rossi',
                  role: 'Líder de Jóvenes & Célula Vida',
                  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                  isWalking: false,
                });
                setShowBrotherModal(true);
              }}
              className="flex items-center gap-2.5 pl-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#856CBD] to-[#A9E5C8] p-[2px]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold block text-white group-hover:text-[#FFFF4C] transition-colors leading-none">
                  {user?.name || 'Mateo Rossi'}
                </span>
                <span className="text-[11px] text-white/50">Célula Vida</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Píldoras de Navegación / Filtros */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-8 mt-5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
        <button
          onClick={() => setSelectedFilter('todos')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'todos'
              ? 'bg-[#FFFF4C] text-[#1A1A1A] shadow-md shadow-[#FFFF4C]/10'
              : 'bg-[#242424] text-white/80 border border-white/10 hover:bg-[#2d2d2d]'
          }`}
        >
          <span>🏛️</span> Todo el Cuerpo
        </button>
        <button
          onClick={() => setSelectedFilter('betel')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'betel'
              ? 'bg-[#FFFF4C] text-[#1A1A1A]'
              : 'bg-[#242424] text-white/80 border border-white/10 hover:bg-[#2d2d2d]'
          }`}
        >
          <span>🔥</span> Tiempos de Betel
        </button>
        <button
          onClick={() => setSelectedFilter('devocionales')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'devocionales'
              ? 'bg-[#FFFF4C] text-[#1A1A1A]'
              : 'bg-[#242424] text-white/80 border border-white/10 hover:bg-[#2d2d2d]'
          }`}
        >
          <span>📖</span> Devocionales
        </button>
        <button
          onClick={() => setSelectedFilter('vida')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'vida'
              ? 'bg-[#FFFF4C] text-[#1A1A1A]'
              : 'bg-[#242424] text-white/80 border border-white/10 hover:bg-[#2d2d2d]'
          }`}
        >
          <span>☕</span> Vida & Té Bíblico
        </button>
        <button
          onClick={() => setSelectedFilter('musica')}
          className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
            selectedFilter === 'musica'
              ? 'bg-[#FFFF4C] text-[#1A1A1A]'
              : 'bg-[#242424] text-white/80 border border-white/10 hover:bg-[#2d2d2d]'
          }`}
        >
          <span>🎵</span> Playlists
        </button>
      </nav>

      {/* Grid Bento Asimétrico */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          
          {/* WIDGET 1: DEVOCIONAL DEL DÍA (Alex) */}
          <article className="md:col-span-2 bg-[#1A1A1A] rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-[#FFFF4C]/40 transition-all shadow-xl">
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#A9E5C8]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFFF4C] to-[#A9E5C8] p-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                      alt="Alex"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Alex Morales</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFFF4C]/10 text-[#FFFF4C] font-semibold">
                        Devocional de Hoy
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">07:15 hs • Célula Emanuel</p>
                  </div>
                </div>

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
                  className="text-xs text-[#A9E5C8] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Caminar juntos</span>
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>

              <blockquote className="bg-[#242424]/90 border-l-4 border-[#FFFF4C] rounded-2xl p-4 my-2">
                <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Filipenses 4:6-7</p>
                <p className="text-sm sm:text-base font-semibold text-white/95 italic leading-relaxed">
                  "Por nada estéis afanosos; antes bien, sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias."
                </p>
              </blockquote>

              <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                Hermanos, hoy mientras oraba temprano me di cuenta cuánto tiempo gastamos preocupándonos por cosas que Dios ya prometió sostener. ¡Dejemos hoy esa carga en el altar y caminemos en paz!
              </p>

              {/* Reproductor de Audio */}
              <div className="mt-4 p-3 bg-[#242424] rounded-2xl border border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => showNotification('Reproduciendo reflexión en audio de Alex Morales')}
                    className="w-9 h-9 rounded-xl bg-[#FFFF4C] text-[#1A1A1A] flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </button>
                  <div>
                    <span className="text-xs font-bold block text-white">Reflexión en audio de Alex</span>
                    <span className="text-[11px] text-white/50">1 min 24 seg • Grabación espontánea</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-[#A9E5C8] rounded-full animate-pulse" />
                  <span className="w-1 h-5 bg-[#A9E5C8] rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-[#A9E5C8] rounded-full animate-pulse" />
                  <span className="w-1 h-4 bg-[#A9E5C8] rounded-full animate-pulse" />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-[#1A1A1A]" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="img" />
                  <img className="w-6 h-6 rounded-full border-2 border-[#1A1A1A]" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&q=80" alt="img" />
                  <img className="w-6 h-6 rounded-full border-2 border-[#1A1A1A]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=64&q=80" alt="img" />
                </div>
                <span>{amenCount} hermanos meditaron hoy</span>
              </div>

              <button
                onClick={toggleAmen}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 border ${
                  hasAmened
                    ? 'bg-[#A9E5C8] text-[#1A1A1A] border-[#A9E5C8]'
                    : 'bg-[#242424] hover:bg-[#A9E5C8] text-white hover:text-[#1A1A1A] border-white/10 hover:border-[#A9E5C8]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasAmened ? '¡Amén registrado!' : 'Amén / Meditado'}</span>
              </button>
            </div>
          </article>

          {/* WIDGET 2: TIEMPOS DE BETEL */}
          <article className="bg-[#1A1A1A] rounded-3xl p-6 border border-[#856CBD]/40 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-b from-[#856CBD]/15 via-transparent to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFFF4C] uppercase tracking-wider bg-[#FFFF4C]/10 px-3 py-1 rounded-full border border-[#FFFF4C]/20">
                  <span className="w-2 h-2 rounded-full bg-[#FFFF4C] animate-pulse" />
                  Tiempos de Betel
                </span>
                <span className="text-[11px] text-[#A9E5C8] font-medium">Oración en Vivo</span>
              </div>

              <h3 className="text-base font-extrabold text-white mt-2 relative z-10">Oraciones Espontáneas</h3>
              <p className="text-xs text-white/60 mt-1 relative z-10 leading-relaxed">
                Motivos del corazón compartidos para intercesión inmediata de la congregación.
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-[#242424]/90 border border-white/10 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#856CBD] text-white flex items-center justify-center text-[10px] font-bold">
                    M
                  </div>
                  <span className="text-xs font-bold text-white">Familia Gutiérrez</span>
                  <span className="text-[10px] text-white/40 ml-auto">Hace 12 min</span>
                </div>
                <p className="text-xs text-white/80 italic">
                  "Pidiendo fortaleza por la salud de la abuela Rosa en su estudio médico de este jueves. Creemos en sanidad."
                </p>
              </div>
            </div>

            <div className="mt-5 relative z-10">
              <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                <span>🔥 {betelCount} hermanos intercediendo</span>
                <span className="text-[#A9E5C8] text-[11px]">Activo ahora</span>
              </div>

              <button
                onClick={toggleBetelPrayer}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isPrayingBetel
                    ? 'bg-[#A9E5C8] text-[#1A1A1A] ring-2 ring-[#FFFF4C]'
                    : 'bg-gradient-to-r from-[#856CBD] to-[#6d52a8] text-white hover:from-[#987fd1] hover:to-[#856CBD]'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>{isPrayingBetel ? 'Orando en Altar Activo 🙏' : 'Me uno en oración'}</span>
              </button>
            </div>
          </article>

          {/* WIDGET 3: PLAYLISTS DE ADORACIÓN (Agustina Flores) */}
          <article className="bg-[#1A1A1A] rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between group hover:border-[#FFFF4C]/30 transition-all shadow-xl">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFFF4C]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-[#A9E5C8] uppercase tracking-wider flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" /> Altar Sonoro
                </span>
                <span className="text-[11px] bg-[#242424] text-white/60 px-2 py-0.5 rounded-full border border-white/5">
                  Playlist
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">Lo que escucha la comunidad</h3>
              <p className="text-xs text-white/50 mt-0.5">Canciones que ministran esta semana</p>

              <div className="mt-4 p-3.5 rounded-2xl bg-[#242424] border border-white/5 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=150&q=80"
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-5 h-5 text-[#FFFF4C] fill-current" />
                  </div>
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-xs font-bold text-white truncate block">Fuego de Dios (Acústico)</span>
                  <p className="text-[11px] text-white/60 truncate">
                    En la playlist de <strong>Agustina Flores</strong>
                  </p>
                  <span className="text-[10px] text-[#A9E5C8] font-medium">CMV Adoración • 4:20</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => showNotification('Abriendo Playlist de Agustina Flores en Spotify')}
                className="text-xs font-bold text-[#FFFF4C] hover:underline flex items-center gap-1"
              >
                <span>Escuchar playlist completa</span>
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>

          {/* WIDGET 4: ÚLTIMA PRÉDICA */}
          <article className="md:col-span-2 bg-[#1A1A1A] rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between group shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFFF4C] text-[#1A1A1A]">
                    Última Prédica
                  </span>
                  <span className="text-xs text-white/40">Domingo Pasado</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1.5">Serie: Raíces en Aguas Profundas • Parte 3</h3>
              </div>

              <button
                onClick={() => showNotification('Descargando Bosquejo & Guía de Célula en PDF...')}
                className="px-3.5 py-2 rounded-xl bg-[#242424] hover:bg-[#303030] border border-white/10 text-xs font-bold text-white flex items-center gap-2 self-start sm:self-auto transition-colors"
              >
                <FileText className="w-4 h-4 text-[#A9E5C8]" />
                <span>Guía para Células</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center group-hover:ring-2 group-hover:ring-[#FFFF4C]/30 transition-all">
                <img
                  src="https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&w=400&q=80"
                  alt="Prédica"
                  className="w-full h-full object-cover opacity-75"
                />
                <button
                  onClick={() => showNotification('Reproduciendo Prédica: Raíces en Aguas Profundas')}
                  className="absolute w-12 h-12 rounded-full bg-[#FFFF4C] text-[#1A1A1A] flex items-center justify-center font-bold shadow-xl hover:scale-110 active:scale-95 transition-transform"
                >
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </button>
                <span className="absolute bottom-2 right-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-white font-mono">
                  41:20
                </span>
              </div>

              <div className="flex flex-col justify-between text-xs space-y-2">
                <div className="bg-[#242424] p-3 rounded-2xl border border-white/5">
                  <p className="font-bold text-[11px] uppercase tracking-wide text-[#A9E5C8]">Principio Clave:</p>
                  <p className="text-white/80 mt-1 italic">
                    "No creces cuando todo es cómodo; tus raíces bajan cuando el desierto te obliga a buscar el agua viva."
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/50 px-1">
                  <span>💬 19 reflexiones de hermanos</span>
                  <button
                    onClick={() => showNotification('Abriendo hilo de análisis en Threads CMV')}
                    className="text-[#FFFF4C] font-semibold hover:underline"
                  >
                    Ver análisis comunitario &rarr;
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* WIDGET 5: POLAROID COMUNITARIA & MISERICORDIA */}
          <article className="md:col-span-2 bg-[#1A1A1A] rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A9E5C8]" />
                  <h3 className="text-sm font-extrabold text-white">Comunión en la Casa & Misericordia</h3>
                </div>
                <span className="text-[11px] bg-[#242424] text-[#A9E5C8] font-bold px-2.5 py-0.5 rounded-full border border-white/5">
                  Actividades Reales
                </span>
              </div>

              <p className="text-xs text-white/60 mb-4">
                La fe en el té de la tarde, la lectura bíblica y la ayuda práctica a quienes lo necesitan.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Polaroid */}
                <div className="bg-white p-3 rounded-2xl shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80"
                      alt="Té y lectura"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    "Tardecita de té, mates y Filipenses en casa de Sofi ☕📖"
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>Por Camila & Lucía</span>
                    <span className="text-rose-500 font-bold">❤️ 24 abrazos</span>
                  </div>
                </div>

                {/* Misericordia */}
                <div className="bg-[#242424] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFFF4C] bg-[#FFFF4C]/10 px-2 py-0.5 rounded-full">
                      Ministerio Misericordia
                    </span>
                    <h4 className="text-xs font-bold text-white mt-2">Viandas & Abrigo Plaza Central</h4>
                    <p className="text-[11px] text-white/60 mt-1">
                      Este sábado 10:00 hs. Armado de cajas de alimentos para 20 familias del barrio.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#A9E5C8]">
                      {volunteerJoined ? '13 / 15 Voluntarios' : '12 / 15 Voluntarios'}
                    </span>
                    <button
                      onClick={handleVolunteer}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all active:scale-95 shadow ${
                        volunteerJoined
                          ? 'bg-[#FFFF4C] text-[#1A1A1A]'
                          : 'bg-[#A9E5C8] hover:bg-[#8fd6b3] text-[#1A1A1A]'
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
      </main>

      {/* FLOATING PILL DOCK NAVIGATION */}
      <aside className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/15 px-3 py-2 rounded-full shadow-2xl shadow-black/80 flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => showNotification('Estás en el Muro Abierto de la Casa')}
            className="p-3 text-[#FFFF4C] rounded-full transition-colors"
            title="Muro Casa"
          >
            <Home className="w-6 h-6" />
          </button>

          <span className="w-[1px] h-6 bg-white/10" />

          <button
            onClick={() => {
              setSelectedFilter('betel');
              showNotification('Filtrando Tiempos de Betel');
            }}
            className="p-3 text-white/60 hover:text-white rounded-full transition-colors"
            title="Tiempos de Betel"
          >
            <Flame className="w-6 h-6" />
          </button>

          <div className="px-1">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FFFF4C] to-[#A9E5C8] hover:scale-105 active:scale-95 text-[#1A1A1A] flex items-center justify-center font-black shadow-lg shadow-[#FFFF4C]/25 transition-transform"
              title="Compartir"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedFilter('musica');
              showNotification('Abriendo Playlists & Alabanza');
            }}
            className="p-3 text-white/60 hover:text-white rounded-full transition-colors"
            title="Alabanza"
          >
            <Music className="w-6 h-6" />
          </button>

          <span className="w-[1px] h-6 bg-white/10" />

          <button
            onClick={() => {
              setSelectedBrother({
                name: user?.name || 'Mateo Rossi',
                role: 'Tu Perfil & Cuaderno',
                image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                isWalking: false,
              });
              setShowBrotherModal(true);
            }}
            className="p-3 text-white/60 hover:text-white rounded-full transition-colors"
            title="Mi Altar"
          >
            <div className="w-6 h-6 rounded-full border-2 border-[#A9E5C8] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </nav>
      </aside>

      {/* MODAL CREAR / COMPARTIR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/15 rounded-3xl p-6 text-white shadow-2xl w-full max-w-lg relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-extrabold text-white">Compartir con la Congregación</h3>
                <p className="text-xs text-white/50">Edificar, agradecer o interceder</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 my-4">
              <button className="p-2.5 rounded-2xl bg-[#FFFF4C] text-[#1A1A1A] font-bold text-xs flex flex-col items-center gap-1 text-center">
                <span>📷</span> Polaroid
              </button>
              <button className="p-2.5 rounded-2xl bg-[#242424] hover:bg-[#2d2d2d] text-white/80 font-semibold text-xs flex flex-col items-center gap-1 text-center border border-white/5">
                <span>🎙️</span> Nota Fe
              </button>
              <button className="p-2.5 rounded-2xl bg-[#242424] hover:bg-[#2d2d2d] text-white/80 font-semibold text-xs flex flex-col items-center gap-1 text-center border border-white/5">
                <span>📖</span> Verso
              </button>
              <button className="p-2.5 rounded-2xl bg-[#242424] hover:bg-[#2d2d2d] text-white/80 font-semibold text-xs flex flex-col items-center gap-1 text-center border border-white/5">
                <span>🔥</span> Betel
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="¿Qué hizo Dios hoy? ¿Qué leyeron en el té o en la célula?..."
              className="w-full bg-[#242424] rounded-2xl p-3.5 text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-[#FFFF4C]"
            />

            <div className="mt-3 p-3 bg-[#242424] rounded-2xl border border-white/5 flex items-center gap-3">
              <div className="w-14 h-14 bg-white p-1 rounded-lg shadow transform -rotate-2 flex-shrink-0 flex items-center justify-center text-slate-500 text-xs">
                📷
              </div>
              <div className="text-xs text-white/60">
                <p className="font-bold text-white">Formato Polaroid Activo</p>
                <p className="text-[11px]">Se publicará visible en el Muro Abierto de toda la casa.</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  showNotification('¡Momento compartido con toda la casa con éxito!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#FFFF4C] hover:bg-[#e6e63d] text-[#1A1A1A] font-extrabold text-xs shadow-lg shadow-[#FFFF4C]/20 transition-all active:scale-95"
              >
                Publicar en el Muro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMINAR JUNTOS / HERMANO */}
      {showBrotherModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-white/15 rounded-3xl p-6 text-white shadow-2xl w-full max-w-md relative">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#856CBD] to-[#A9E5C8] p-[2px]">
                  <img
                    src={selectedBrother.image}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedBrother.name}</h3>
                  <p className="text-xs text-white/50">{selectedBrother.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBrotherModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3.5 bg-[#242424] rounded-2xl border border-white/5 text-xs text-white/70 space-y-2">
              <div className="flex items-center gap-2 text-[#A9E5C8] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Dinámica Comunitaria de CMV</span>
              </div>
              <p className="leading-relaxed">
                En nuestra congregación <strong>no existe el 'Seguir / Dejar de seguir'</strong> selectivo para evitar exclusión o camarillas. Todos formamos un mismo cuerpo.
              </p>
              <p className="leading-relaxed text-[11px] text-white/50">
                Al <strong>Caminar Juntos</strong>, intercedes por este hermano, llevas sus motivos en tu altar privado y te notificamos cuando Dios responde sus oraciones.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs py-2 px-1">
              <span className="text-white/60">Compañeros de intercesión:</span>
              <span className="font-bold text-[#FFFF4C]">24 hermanos oran juntos</span>
            </div>

            <button
              onClick={toggleWalkingTogether}
              className={`w-full mt-3 py-3 rounded-2xl font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                selectedBrother.isWalking
                  ? 'bg-[#A9E5C8] text-[#1A1A1A]'
                  : 'bg-[#FFFF4C] hover:bg-[#f5f542] text-[#1A1A1A] shadow-[#FFFF4C]/20'
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
