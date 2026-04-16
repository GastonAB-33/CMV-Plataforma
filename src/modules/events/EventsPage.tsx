import { useState } from 'react';
import { Calendar, Clock, Plus, Tag, X } from 'lucide-react';
import { eventsService } from '../../services/eventsService';
import { EventType } from '../../types';

export const EventsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [events] = useState(() => eventsService.list());

  const getTypeColor = (type: EventType) => {
    switch (type) {
      case EventType.CELULA:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case EventType.RED:
        return 'text-[#c5a059] bg-[#c5a059]/10 border-[#c5a059]/20';
      case EventType.JOVENES:
        return 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20';
      default:
        return 'text-slate-500 dark:text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 dark:text-gray-500">Gestión de Actividades</span>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-gray-500">Eventos CMV</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-8 py-4 bg-[#c5a059] hover:bg-[#d4b375] text-black font-black rounded-2xl transition-all shadow-[0_10px_20px_rgba(197,160,89,0.2)] active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>CREAR EVENTO</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-slate-200 dark:border-white/5 p-8 hover:border-[#c5a059]/30 transition-all group relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getTypeColor(event.type)}`}>
                {event.type}
              </span>
            </div>

            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#c5a059] transition-colors">{event.title}</h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-gray-500 text-sm">
                  <Tag size={14} />
                  <span>{event.cell}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                  <Calendar size={16} className="text-[#c5a059]" />
                  <span className="text-sm font-medium">{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 dark:text-gray-400">
                  <Clock size={16} className="text-[#c5a059]" />
                  <span className="text-sm font-medium">{event.time}h</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-xl rounded-[2.5rem] border border-slate-300 dark:border-white/10 p-10 relative shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Nuevo Evento</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Título del Evento</label>
                <input type="text" placeholder="Ej: Noche de Alabanza" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Fecha</label>
                  <input type="date" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Hora</label>
                  <input type="time" className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Célula / Red Encargada</label>
                <select className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-colors appearance-none">
                  <option value="Red Apostólica">Red Apostólica</option>
                  <option value="Vida">Vida</option>
                  <option value="Nissi">Nissi</option>
                  <option value="Zaeta">Zaeta</option>
                  <option value="Sion">Sion</option>
                  <option value="Maranata">Maranata</option>
                  <option value="Alpha y Omega">Alpha y Omega</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-black text-[#c5a059]">Tipo de Evento</label>
                <select className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-2xl p-4 text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a059] transition-colors appearance-none">
                  <option value={EventType.CELULA}>Célula</option>
                  <option value={EventType.RED}>Red</option>
                  <option value={EventType.JOVENES}>Jóvenes</option>
                </select>
              </div>

              <button onClick={() => setShowForm(false)} className="w-full py-4 bg-[#c5a059] text-black font-black rounded-2xl mt-4 hover:bg-[#d4b375] transition-all">
                GUARDAR EVENTO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};