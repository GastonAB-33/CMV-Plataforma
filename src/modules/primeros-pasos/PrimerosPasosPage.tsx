import React, { useMemo, useState } from 'react';
import {
  Footprints,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Eye,
  Send,
  Trash2,
  Heart,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Toast } from '../../components/ui/Toast';
import { FichaBienvenidaModal } from './components/FichaBienvenidaModal';
import { FichaDetalleModal } from './components/FichaDetalleModal';
import { DerivarHermanoModal } from './components/DerivarHermanoModal';
import { primerosPasosService } from './services/primerosPasosService';
import { FichaBienvenida } from './types';

export const PrimerosPasosPage: React.FC = () => {
  const { user } = useAuth();
  const [fichas, setFichas] = useState<FichaBienvenida[]>(() => primerosPasosService.list());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendiente' | 'derivado'>('todos');
  const [selectedCellFilter, setSelectedCellFilter] = useState<string>('todas');

  // Modales
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedFichaForDetail, setSelectedFichaForDetail] = useState<FichaBienvenida | null>(null);
  const [selectedFichaForDerivar, setSelectedFichaForDerivar] = useState<FichaBienvenida | null>(null);

  // Toast
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const reloadFichas = () => {
    setFichas(primerosPasosService.list());
  };

  const handleFichaCreated = (newFicha: FichaBienvenida) => {
    reloadFichas();
    setToast({
      text: `Ficha de ${newFicha.nombreCompleto} registrada exitosamente en Primeros Pasos.`,
      type: 'success',
    });
  };

  const handleFichaDerivada = (fichaActualizada: FichaBienvenida, notifMsg: string) => {
    reloadFichas();
    setToast({
      text: `${fichaActualizada.nombreCompleto} derivado a ${fichaActualizada.derivadoA?.nombre}. ${notifMsg}`,
      type: 'success',
    });
  };

  const handleDeleteFicha = (ficha: FichaBienvenida) => {
    if (window.confirm(`¿Estás seguro de que querés eliminar la ficha de ${ficha.nombreCompleto}?`)) {
      primerosPasosService.deleteFicha(ficha.id);
      reloadFichas();
      setToast({
        text: `Ficha de ${ficha.nombreCompleto} eliminada.`,
        type: 'info',
      });
    }
  };

  // Células presentes en las fichas
  const availableCells = useMemo(() => {
    const set = new Set<string>();
    fichas.forEach((f) => {
      if (f.celulaRecibe) set.add(f.celulaRecibe);
    });
    return Array.from(set).sort();
  }, [fichas]);

  // Filtrado de fichas
  const filteredFichas = useMemo(() => {
    return fichas.filter((f) => {
      const matchSearch =
        f.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.telefono.includes(searchTerm) ||
        f.celulaRecibe.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.comoLlego.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.derivadoA?.nombre ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'todos' || f.estadoDerivacion === statusFilter;

      const matchCell =
        selectedCellFilter === 'todas' || f.celulaRecibe === selectedCellFilter;

      return matchSearch && matchStatus && matchCell;
    });
  }, [fichas, searchTerm, statusFilter, selectedCellFilter]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: fichas.length,
      pendientes: fichas.filter((f) => f.estadoDerivacion === 'pendiente').length,
      derivados: fichas.filter((f) => f.estadoDerivacion === 'derivado').length,
      deseanContacto: fichas.filter((f) => f.deseaContacto).length,
    };
  }, [fichas]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Encabezado Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Footprints size={14} />
            <span>Módulo de Consolidación Pastoral</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Primeros Pasos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            Recepción de nuevos hermanos, Fichas de Bienvenida y derivación a pastores o líderes con aviso OneSignal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            <span>NUEVA FICHA DE BIENVENIDA</span>
          </button>
        </div>
      </header>

      {/* Tarjetas KPI de resumen */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Fichas */}
        <article className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-[#0d1829]/95 dark:to-[#060c17]/95 p-4 sm:p-5 flex flex-col justify-between shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
              Total Nuevos Hermanos
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
              {stats.total}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-gray-500 font-semibold mt-1">
              Fichas registradas en el sistema
            </p>
          </div>
        </article>

        {/* KPI 2: Pendientes de Derivación */}
        <article className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-[#0d1829]/95 p-4 sm:p-5 flex flex-col justify-between shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black text-amber-700 dark:text-amber-400">
              Pendientes de Derivar
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
              {stats.pendientes}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-bold mt-1">
              {stats.pendientes > 0 ? 'Requieren asignación pastoral' : 'Al día, sin pendientes'}
            </p>
          </div>
        </article>

        {/* KPI 3: Derivados a Líderes */}
        <article className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-[#0d1829]/95 p-4 sm:p-5 flex flex-col justify-between shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black text-emerald-700 dark:text-emerald-400">
              Derivados a Líderes
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {stats.derivados}
            </p>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-bold mt-1">
              En proceso de acompañamiento
            </p>
          </div>
        </article>

        {/* KPI 4: Solicitan Contacto */}
        <article className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white/95 to-slate-50/90 dark:from-[#0d1829]/95 dark:to-[#060c17]/95 p-4 sm:p-5 flex flex-col justify-between shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-black text-slate-500 dark:text-gray-400">
              Desean Ser Contactados
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <Heart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 leading-none">
              {stats.deseanContacto}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-gray-500 font-semibold mt-1">
              Teléfono listo para contacto
            </p>
          </div>
        </article>
      </section>

      {/* Barra de Búsqueda y Filtros */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, célula o cómo llegó..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('todos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                statusFilter === 'todos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              Todos ({fichas.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pendiente')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                statusFilter === 'pendiente'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-300 hover:text-amber-600'
              }`}
            >
              Pendientes ({stats.pendientes})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('derivado')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                statusFilter === 'derivado'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              Derivados ({stats.derivados})
            </button>
          </div>

          {/* Filtro por célula */}
          {availableCells.length > 0 && (
            <div className="min-w-[180px]">
              <select
                value={selectedCellFilter}
                onChange={(e) => setSelectedCellFilter(e.target.value)}
                className="w-full bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500 shadow-sm"
              >
                <option value="todas">Todas las células</option>
                {availableCells.map((c) => (
                  <option key={c} value={c}>
                    Célula: {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Lista / Tabla de Fichas de Bienvenida */}
      <section className="space-y-4">
        {filteredFichas.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 space-y-3">
            <Footprints size={40} className="mx-auto text-slate-300 dark:text-gray-600" />
            <h3 className="text-base font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
              No se encontraron fichas de bienvenida
            </h3>
            <p className="text-xs text-slate-400 dark:text-gray-500 max-w-sm mx-auto">
              Podés registrar un nuevo hermano utilizando el botón de arriba o desde el Topbar del portal.
            </p>
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:bg-emerald-500"
            >
              <Plus size={14} />
              <span>Registrar Primera Ficha</span>
            </button>
          </div>
        ) : (
          <>
            {/* Vista Mobile: Tarjetas */}
            <div className="md:hidden space-y-3">
              {filteredFichas.map((ficha) => {
                const cleanPhone = ficha.telefono.replace(/\D/g, '');
                const waLink = cleanPhone
                  ? `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`}`
                  : null;

                return (
                  <article
                    key={ficha.id}
                    className="p-4 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121212] shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                          {ficha.nombreCompleto}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500 font-bold mt-0.5">
                          {ficha.edad ? `${ficha.edad} años · ` : ''}Fecha: {ficha.fecha}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                          ficha.estadoDerivacion === 'derivado'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {ficha.estadoDerivacion === 'derivado' ? 'Derivado' : 'Pendiente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-gray-500 block">
                          Célula:
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {ficha.celulaRecibe}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 dark:text-gray-500 block">
                          Contacto:
                        </span>
                        <span className="font-bold text-slate-700 dark:text-gray-300">
                          {ficha.deseaContacto ? 'Sí desea (WhatsApp)' : 'No contactar'}
                        </span>
                      </div>
                    </div>

                    {ficha.derivadoA && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300 block">
                          Derivado a:
                        </span>
                        <span className="font-black text-slate-800 dark:text-gray-100">
                          {ficha.derivadoA.nombre} ({ficha.derivadoA.rol})
                        </span>
                      </div>
                    )}

                    {/* Acciones móviles */}
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                            title="WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                        <a
                          href={`tel:${ficha.telefono}`}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-200"
                          title="Llamar"
                        >
                          <Phone size={16} />
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFichaForDetail(ficha)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100"
                        >
                          Ver Ficha
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFichaForDerivar(ficha)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-500 flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>Derivar</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Vista Desktop: Tabla Moderna */}
            <div className="hidden md:block rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#121212] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-black/40 text-slate-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-200 dark:border-white/10">
                      <th className="px-6 py-4">Nuevo Hermano</th>
                      <th className="px-6 py-4">Teléfono</th>
                      <th className="px-6 py-4">Célula que recibe</th>
                      <th className="px-6 py-4">¿Cómo llegó?</th>
                      <th className="px-6 py-4">¿Contacto?</th>
                      <th className="px-6 py-4">Estado / Asignación</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredFichas.map((ficha) => {
                      const cleanPhone = ficha.telefono.replace(/\D/g, '');
                      const waLink = cleanPhone
                        ? `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`}`
                        : null;

                      return (
                        <tr
                          key={ficha.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors group"
                        >
                          {/* Hermano */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-base">
                                {ficha.nombreCompleto}
                              </p>
                              <p className="text-[11px] text-slate-400 dark:text-gray-500 font-semibold">
                                {ficha.edad ? `${ficha.edad} años · ` : ''}Fecha: {ficha.fecha}
                              </p>
                            </div>
                          </td>

                          {/* Teléfono */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 dark:text-gray-200 text-sm">
                                {ficha.telefono}
                              </span>
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                  title="Enviar WhatsApp"
                                >
                                  <MessageCircle size={15} />
                                </a>
                              )}
                              <a
                                href={`tel:${ficha.telefono}`}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-200 transition-colors"
                                title="Llamar"
                              >
                                <Phone size={15} />
                              </a>
                            </div>
                          </td>

                          {/* Célula */}
                          <td className="px-6 py-4">
                            <span className="inline-flex px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                              {ficha.celulaRecibe}
                            </span>
                          </td>

                          {/* Cómo llegó */}
                          <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-gray-300 max-w-[200px] truncate">
                            {ficha.comoLlego || '-'}
                          </td>

                          {/* ¿Desea contacto? */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                ficha.deseaContacto
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                              }`}
                            >
                              {ficha.deseaContacto ? 'Sí' : 'No'}
                            </span>
                          </td>

                          {/* Estado de derivación */}
                          <td className="px-6 py-4">
                            {ficha.estadoDerivacion === 'derivado' ? (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={13} />
                                  <span>Derivado a {ficha.derivadoA?.nombre}</span>
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-bold">
                                  {ficha.derivadoA?.rol}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
                                <Clock size={12} />
                                Pendiente
                              </span>
                            )}
                          </td>

                          {/* Botones de acción */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedFichaForDetail(ficha)}
                                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                              >
                                Ver Ficha
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedFichaForDerivar(ficha)}
                                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                                title="Derivar y Notificar por OneSignal"
                              >
                                <Send size={12} />
                                <span>{ficha.estadoDerivacion === 'derivado' ? 'Re-derivar' : 'Derivar'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteFicha(ficha)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Eliminar ficha"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Modal para Nueva Ficha de Bienvenida */}
      <FichaBienvenidaModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleFichaCreated}
      />

      {/* Modal para Ver Ficha Completa */}
      <FichaDetalleModal
        ficha={selectedFichaForDetail}
        isOpen={Boolean(selectedFichaForDetail)}
        onClose={() => setSelectedFichaForDetail(null)}
        onOpenDerivar={(ficha) => setSelectedFichaForDerivar(ficha)}
      />

      {/* Modal para Derivar Hermano a Pastor o Líder (Notificación OneSignal) */}
      <DerivarHermanoModal
        ficha={selectedFichaForDerivar}
        isOpen={Boolean(selectedFichaForDerivar)}
        onClose={() => setSelectedFichaForDerivar(null)}
        onSuccess={handleFichaDerivada}
      />

      {/* Toast de notificaciones en pantalla */}
      {toast && (
        <Toast
          isVisible={Boolean(toast)}
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
