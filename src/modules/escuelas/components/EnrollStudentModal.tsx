import React, { useState, useMemo } from 'react';
import { X, UserPlus, Search, Calendar, Users } from 'lucide-react';
import { escuelasService } from '../services/escuelasService';
import { SchoolType } from '../types';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolType: Exclude<SchoolType, 'material-estudio'>;
  onEnrolled: () => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  schoolType,
  onEnrolled,
}) => {
  const schoolDef = escuelasService.getSchoolDefinition(schoolType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrotherId, setSelectedBrotherId] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBrothers = useMemo(() => {
    return escuelasService.getAvailableBrothersToEnroll(schoolType);
  }, [schoolType, isOpen]);

  const filteredBrothers = useMemo(() => {
    if (!searchTerm.trim()) return availableBrothers;
    const term = searchTerm.toLowerCase();
    return availableBrothers.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.acompanamiento.celulaName.toLowerCase().includes(term)
    );
  }, [availableBrothers, searchTerm]);

  if (!isOpen) return null;

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrotherId) return;

    setIsSubmitting(true);
    try {
      escuelasService.enrollStudent(schoolType, selectedBrotherId, fechaInicio);
      onEnrolled();
      onClose();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Inscribir Hermano a {schoolDef.shortTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 font-medium mt-0.5">
                Seleccioná un miembro de la congregación para habilitar su cursada
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleEnroll} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-emerald-500" />
              Fecha de Inicio de Cursada *
            </label>
            <input
              type="date"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users size={13} className="text-emerald-500" />
              Seleccionar Hermano * ({availableBrothers.length} disponibles)
            </label>

            <div className="relative mb-2">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre o célula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5 [scrollbar-width:thin]">
              {filteredBrothers.length > 0 ? (
                filteredBrothers.map((brother) => {
                  const isSelected = selectedBrotherId === brother.id;
                  return (
                    <div
                      key={brother.id}
                      onClick={() => setSelectedBrotherId(brother.id)}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border-l-4 border-emerald-500'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-gray-200 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                          {brother.fotoUrl ? (
                            <img
                              src={brother.fotoUrl}
                              alt={brother.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            brother.name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                            {brother.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                            Célula: {brother.acompanamiento.celulaName}
                          </p>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="selectedBrother"
                        checked={isSelected}
                        onChange={() => setSelectedBrotherId(brother.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No se encontraron hermanos disponibles para inscribir.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!selectedBrotherId || isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Inscribiendo...' : 'Confirmar Inscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
