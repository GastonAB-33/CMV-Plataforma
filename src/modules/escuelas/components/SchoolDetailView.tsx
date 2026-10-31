import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  Users,
  GraduationCap,
  Calendar,
  ExternalLink,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { escuelasService } from '../services/escuelasService';
import { SchoolStudent, SchoolStudentStatus, SchoolType } from '../types';
import { StudentGradeModal } from './StudentGradeModal';
import { EnrollStudentModal } from './EnrollStudentModal';

interface SchoolDetailViewProps {
  schoolType: Exclude<SchoolType, 'material-estudio'>;
  onBackToMenu: () => void;
  onSwitchSchool: (school: SchoolType) => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SchoolDetailView: React.FC<SchoolDetailViewProps> = ({
  schoolType,
  onBackToMenu,
  onSwitchSchool,
  onNotify,
}) => {
  const schoolDef = escuelasService.getSchoolDefinition(schoolType);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | SchoolStudentStatus>('TODOS');
  const [selectedStudentForGrades, setSelectedStudentForGrades] = useState<SchoolStudent | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cargar estudiantes y estadísticas
  const students = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey;
    return escuelasService.getSchoolStudents(schoolType);
  }, [schoolType, refreshKey]);

  const stats = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey;
    return escuelasService.getSchoolStats(schoolType);
  }, [schoolType, refreshKey]);

  // Lista de células únicas
  const availableCells = useMemo(() => {
    const cells = new Set(students.map((s) => s.cellName));
    return ['Todas', ...Array.from(cells).sort()];
  }, [students]);

  // Filtrado de alumnos
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.cellName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCell = selectedCell === 'Todas' || s.cellName === selectedCell;
      const matchStatus = selectedStatus === 'TODOS' || s.status === selectedStatus;
      return matchSearch && matchCell && matchStatus;
    });
  }, [students, searchTerm, selectedCell, selectedStatus]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Barra de Navegación Superior y Selector Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-white/10">
        <button
          type="button"
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Volver a Menú de Escuelas</span>
        </button>

        {/* Pestañas de Navegación Rápida entre Escuelas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {(['eddi-1', 'eddi-2', 'eddi-3', 'edem', 'material-estudio'] as SchoolType[]).map((type) => {
            const isCurrent = type === schoolType;
            const label =
              type === 'eddi-1'
                ? 'EDDI 1'
                : type === 'eddi-2'
                ? 'EDDI 2'
                : type === 'eddi-3'
                ? 'EDDI 3'
                : type === 'edem'
                ? 'EDEM'
                : 'Material de Estudio';
            return (
              <button
                key={type}
                type="button"
                onClick={() => onSwitchSchool(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabecera Principal de la Escuela */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border-2 border-slate-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xl">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none bg-gradient-to-br ${schoolDef.gradientClass}`} />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${schoolDef.badgeBg} ${schoolDef.badgeText}`}
              >
                {schoolDef.levelBadge}
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                • {schoolDef.categoryLabel}
              </span>
              <span className="text-xs text-slate-500 dark:text-gray-400 font-extrabold">
                • Etapa {schoolDef.stageNumber} de la Línea de Vida
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {schoolDef.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium leading-relaxed">
              {schoolDef.longDescription}
            </p>
          </div>

          {/* Próxima Clase y Agenda */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 shrink-0 min-w-[280px]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
              <Calendar size={14} className="text-emerald-500" />
              <span>Próxima Cátedra Oficial</span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
              {schoolDef.upcomingClass.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Docente: <span className="font-bold text-slate-700 dark:text-gray-200">{schoolDef.upcomingClass.teacher}</span>
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              📅 {schoolDef.upcomingClass.date} • ⏰ {schoolDef.upcomingClass.hour} hs
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards de la Escuela */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-black tracking-wider">
            <Users size={15} className="text-emerald-500" />
            <span>Alumnos Totales</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.totalStudents}
          </p>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {stats.inProgressCount} cursando activamente
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-black tracking-wider">
            <CheckCircle2 size={15} className="text-cyan-500" />
            <span>Graduados / Aprobados</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.completedCount}
          </p>
          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
            Etapa {schoolDef.stageNumber} finalizada
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-black tracking-wider">
            <Award size={15} className="text-amber-500" />
            <span>Promedio General</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.averageGrade !== null ? stats.averageGrade : '-'}
          </p>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {stats.totalGradesRecorded} evaluaciones cargadas
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-xs uppercase font-black tracking-wider">
            <Sparkles size={15} className="text-purple-500" />
            <span>Células Involucradas</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {stats.cellsRepresentedCount}
          </p>
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
            Cobertura en la congregación
          </span>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Botón Inscribir */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Buscar alumno o célula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filtro por Célula */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
              className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
            >
              {availableCells.map((cell) => (
                <option key={cell} value={cell}>
                  {cell === 'Todas' ? 'Todas las células' : `Célula: ${cell}`}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['TODOS', 'EN_CURSO', 'COMPLETADO', 'REPROBADO'] as const).map((status) => {
              const isSelected = selectedStatus === status;
              const label =
                status === 'TODOS'
                  ? 'Todos'
                  : status === 'EN_CURSO'
                  ? 'En Curso'
                  : status === 'COMPLETADO'
                  ? 'Completado'
                  : 'Reprobado';
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón Inscribir Alumno */}
        <button
          type="button"
          onClick={() => setIsEnrollModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl btn-3d-emerald text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <UserPlus size={14} />
          <span>INSCRIBIR HERMANO</span>
        </button>
      </div>

      {/* Tabla de Alumnos y Calificaciones */}
      <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-white/10 shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} className="text-emerald-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Listado de Alumnos y Calificaciones ({filteredStudents.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">
            Haz clic en "Calificar" para editar notas y fechas en tiempo real
          </span>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-black/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3.5">Hermano</th>
                  <th className="text-left px-4 py-3.5">Célula</th>
                  <th className="text-left px-4 py-3.5">Fechas de Cursada</th>
                  <th className="text-center px-4 py-3.5">Materias Evaluadas</th>
                  <th className="text-center px-4 py-3.5">Promedio</th>
                  <th className="text-center px-4 py-3.5">Estado</th>
                  <th className="text-right px-5 py-3.5">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredStudents.map((student) => {
                  return (
                    <tr
                      key={student.brotherId}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Hermano */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {student.fotoUrl ? (
                              <img
                                src={student.fotoUrl}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              student.name[0]
                            )}
                          </div>
                          <div>
                            <a
                              href={`/hermanos/${student.brotherId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-extrabold text-slate-900 dark:text-white hover:text-emerald-500 transition-colors inline-flex items-center gap-1 leading-tight group"
                            >
                              <span>{student.name}</span>
                              <ExternalLink
                                size={11}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </a>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5 capitalize">
                              {student.role.toLowerCase().replace(/_/g, ' ')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Célula */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-700 dark:text-gray-300">
                          {student.cellName}
                        </span>
                      </td>

                      {/* Fechas de Cursada */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-slate-600 dark:text-gray-400">
                            Inicio: <span className="font-bold text-slate-800 dark:text-gray-200">{student.fechaInicio || 'Sin fecha'}</span>
                          </p>
                          <p className="text-slate-600 dark:text-gray-400">
                            Fin: <span className="font-bold text-slate-800 dark:text-gray-200">{student.fechaFin || 'En progreso'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Materias Evaluadas */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-gray-300">
                          <BookOpen size={13} className="text-emerald-500" />
                          <span>{student.grades.length} cargadas</span>
                        </span>
                      </td>

                      {/* Promedio */}
                      <td className="px-4 py-4 text-center">
                        {student.averageGrade !== null ? (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              student.averageGrade >= 8
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : student.averageGrade >= 7
                                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}
                          >
                            {student.averageGrade}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">-</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            student.status === 'COMPLETADO'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : student.status === 'EN_CURSO'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                              : student.status === 'REPROBADO'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                              : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                          }`}
                        >
                          {student.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForGrades(student)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 font-extrabold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <BookOpen size={13} />
                          <span>Calificar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-gray-300">
              No se encontraron alumnos para los filtros seleccionados
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 max-w-md mx-auto">
              Puedes limpiar el buscador o inscribir a un hermano de la congregación a esta escuela.
            </p>
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(true)}
              className="px-4 py-2 rounded-xl btn-3d-emerald text-white font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus size={13} />
              <span>Inscribir Alumno Ahora</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal para Calificar y Gestionar Alumno */}
      {selectedStudentForGrades && (
        <StudentGradeModal
          isOpen={Boolean(selectedStudentForGrades)}
          onClose={() => setSelectedStudentForGrades(null)}
          student={selectedStudentForGrades}
          schoolType={schoolType}
          onSaved={() => {
            handleRefresh();
            onNotify(
              `Calificaciones y fechas de ${selectedStudentForGrades.name} sincronizadas con éxito.`,
              'success'
            );
          }}
        />
      )}

      {/* Modal para Inscribir Alumno */}
      {isEnrollModalOpen && (
        <EnrollStudentModal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          schoolType={schoolType}
          onEnrolled={() => {
            handleRefresh();
            onNotify(`Hermano inscripto a ${schoolDef.shortTitle} exitosamente.`, 'success');
          }}
        />
      )}
    </div>
  );
};
