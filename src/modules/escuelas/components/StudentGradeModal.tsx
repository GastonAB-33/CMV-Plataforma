import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { escuelasService } from '../services/escuelasService';
import { SchoolGradeItem, SchoolStudent, SchoolType } from '../types';

interface StudentGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: SchoolStudent;
  schoolType: Exclude<SchoolType, 'material-estudio'>;
  onSaved: () => void;
}

export const StudentGradeModal: React.FC<StudentGradeModalProps> = ({
  isOpen,
  onClose,
  student,
  schoolType,
  onSaved,
}) => {
  const schoolDef = escuelasService.getSchoolDefinition(schoolType);

  const [fechaInicio, setFechaInicio] = useState(student.fechaInicio || '');
  const [fechaFin, setFechaFin] = useState(student.fechaFin || '');
  const [grades, setGrades] = useState<SchoolGradeItem[]>(() =>
    student.grades.map((g) => ({ ...g }))
  );

  // Formulario para nueva materia
  const [newMateria, setNewMateria] = useState('');
  const [newModulo, setNewModulo] = useState('Módulo 1');
  const [newFecha, setNewFecha] = useState(new Date().toISOString().split('T')[0]);
  const [newNota, setNewNota] = useState<number | ''>(9);
  const [newObservacion, setNewObservacion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Promedio dinámico
  const average =
    grades.length > 0
      ? Number((grades.reduce((acc, g) => acc + g.nota, 0) / grades.length).toFixed(1))
      : null;

  const approvedCount = grades.filter((g) => g.nota >= 7).length;

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateria.trim()) return;

    const notaNum = Number(newNota);
    if (isNaN(notaNum) || notaNum < 1 || notaNum > 10) return;

    const newEntry: SchoolGradeItem = {
      id: `grade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materia: newMateria.trim(),
      modulo: newModulo,
      fecha: newFecha,
      nota: notaNum,
      estado: notaNum >= 7 ? 'APROBADO' : 'REPROBADO',
      observacion: newObservacion.trim() || undefined,
    };

    setGrades((prev) => [...prev, newEntry]);
    setNewMateria('');
    setNewObservacion('');
    setNewNota(9);
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
  };

  const handleGradeScoreChange = (gradeId: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const clamped = Math.max(1, Math.min(10, num));
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId
          ? {
              ...g,
              nota: clamped,
              estado: clamped >= 7 ? 'APROBADO' : 'REPROBADO',
            }
          : g
      )
    );
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    try {
      escuelasService.saveStudentProgress(schoolType, student.brotherId, {
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
        grades,
      });
      onSaved();
      onClose();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPresetSubjects = () => {
    const existingNames = new Set(grades.map((g) => g.materia.toLowerCase()));
    const presetsToAdd = schoolDef.suggestedSubjects
      .filter((s) => !existingNames.has(s.materia.toLowerCase()))
      .map((s, idx) => ({
        id: `grade-preset-${Date.now()}-${idx}`,
        materia: s.materia,
        modulo: s.modulo,
        fecha: new Date().toISOString().split('T')[0],
        nota: 9,
        estado: 'APROBADO' as const,
        observacion: 'Carga curricular estándar de la escuela',
      }));

    if (presetsToAdd.length > 0) {
      setGrades((prev) => [...prev, ...presetsToAdd]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 p-0.5 shadow-md flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0">
              {student.fotoUrl ? (
                <img
                  src={student.fotoUrl}
                  alt={student.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                student.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${schoolDef.badgeBg} ${schoolDef.badgeText}`}
                >
                  {schoolDef.shortTitle}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-400 font-bold">
                  Célula: <span className="text-slate-800 dark:text-white font-extrabold">{student.cellName}</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                {student.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/hermanos/${student.brotherId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir ficha completa en nueva pestaña"
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 [scrollbar-width:thin]">
          {/* Fechas de Cursada y Estado de la Línea de Vida */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" />
                Fechas de Cursada ({schoolDef.shortTitle})
              </span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold">
                Sincronizado con Línea de Vida (Etapa {schoolDef.stageNumber})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider">
                    Fecha de Fin / Graduación
                  </label>
                  {fechaFin && (
                    <button
                      type="button"
                      onClick={() => setFechaFin('')}
                      className="text-[10px] text-rose-500 hover:underline font-bold"
                    >
                      Quitar fecha
                    </button>
                  )}
                </div>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-gray-400">
              💡 <span className="font-semibold">Nota:</span> Al definir la fecha de finalización, la etapa {schoolDef.stageNumber} se marcará como completada en la ficha del hermano y se desbloqueará la siguiente etapa en la Línea de Vida.
            </p>
          </div>

          {/* Resumen de Calificaciones */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Materias Aprobadas
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {approvedCount} de {grades.length}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-600 dark:text-cyan-400 block">
                Promedio
              </span>
              <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                {average !== null ? average : '-'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 dark:text-purple-400 block">
                Estado Actual
              </span>
              <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-2">
                {fechaFin ? 'COMPLETADO' : fechaInicio ? 'EN CURSO' : 'SIN INICIAR'}
              </p>
            </div>
          </div>

          {/* Listado de Materias Registradas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-500" />
                Materias y Calificaciones ({grades.length})
              </h4>

              {grades.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadPresetSubjects}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  + Cargar Materias del Plan
                </button>
              )}
            </div>

            {grades.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="w-full min-w-[550px] text-xs">
                  <thead className="bg-slate-100 dark:bg-black/60">
                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      <th className="text-left px-4 py-2.5">Materia</th>
                      <th className="text-left px-3 py-2.5">Módulo</th>
                      <th className="text-left px-3 py-2.5">Fecha</th>
                      <th className="text-center px-3 py-2.5">Nota (1-10)</th>
                      <th className="text-center px-3 py-2.5">Estado</th>
                      <th className="text-center px-3 py-2.5">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {grade.materia}
                          {grade.observacion && (
                            <p className="text-[10px] text-slate-500 dark:text-gray-400 font-normal mt-0.5">
                              {grade.observacion}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-gray-400">
                          {grade.modulo || '-'}
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-gray-400">
                          {grade.fecha || '-'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={grade.nota}
                            onChange={(e) => handleGradeScoreChange(grade.id, e.target.value)}
                            className="w-14 text-center bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-lg py-1 font-black text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              grade.nota >= 7
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            }`}
                          >
                            {grade.nota >= 7 ? 'APROBADO' : 'REPROBADO'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Eliminar materia"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">
                  Este alumno aún no tiene materias ni notas registradas en {schoolDef.shortTitle}.
                </p>
                <button
                  type="button"
                  onClick={handleLoadPresetSubjects}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={13} />
                  <span>Cargar Materias Estándar de {schoolDef.shortTitle}</span>
                </button>
              </div>
            )}
          </div>

          {/* Formulario para Agregar Nueva Materia Individual */}
          <form
            onSubmit={handleAddGrade}
            className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-500" />
                Registrar Calificación de Materia
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase mb-1">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Doctrina Básica o seleccioná del plan"
                  list="suggested-subjects-list"
                  value={newMateria}
                  onChange={(e) => setNewMateria(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
                <datalist id="suggested-subjects-list">
                  {schoolDef.suggestedSubjects.map((s) => (
                    <option key={s.materia} value={s.materia} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase mb-1">
                  Módulo
                </label>
                <select
                  value={newModulo}
                  onChange={(e) => setNewModulo(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="Módulo 1">Módulo 1</option>
                  <option value="Módulo 2">Módulo 2</option>
                  <option value="Módulo 3">Módulo 3</option>
                  <option value="Módulo 4">Módulo 4</option>
                  <option value="Examen Final">Examen Final</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase mb-1">
                  Nota (1 al 10) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  required
                  value={newNota}
                  onChange={(e) => setNewNota(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 font-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase mb-1">
                  Fecha de Examen
                </label>
                <input
                  type="date"
                  value={newFecha}
                  onChange={(e) => setNewFecha(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-gray-400 uppercase mb-1">
                  Observación Docente
                </label>
                <input
                  type="text"
                  placeholder="Ej. Excelente comprensión"
                  value={newObservacion}
                  onChange={(e) => setNewObservacion(e.target.value)}
                  className="w-full bg-white dark:bg-black/60 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 font-extrabold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                <Plus size={13} />
                <span>Agregar a la Lista</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer del Modal con Botones de Acción */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 font-bold text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} />
            <span>{isSaving ? 'Guardando...' : 'Guardar y Sincronizar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
