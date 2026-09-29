import { Award, CalendarDays, Users, BookOpenCheck, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { canEditManagedModule, listModuleResponsibleNames } from '../../lib/moduleAccess';
import { edemSchoolService } from './services/edemSchoolService';
import { BrotherNameTrigger } from '../../components/brothers/BrotherNameTrigger';

const statusLabel: Record<string, string> = {
  EN_CURSO: 'En curso',
  CERRADO: 'Cerrado',
  PLANIFICADO: 'Planificado',
};

export const EscuelaEdemPage = () => {
  const { user } = useAuth();
  const canEdit = canEditManagedModule(user, 'escuela_edem');

  const cohorts = useMemo(() => edemSchoolService.listCohorts(), []);
  const students = useMemo(() => edemSchoolService.listStudentProgress(), []);
  const classes = useMemo(() => edemSchoolService.listUpcomingClasses(), []);
  const responsibleNames = useMemo(() => listModuleResponsibleNames('escuela_edem'), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-purple-400 text-xs uppercase tracking-[0.2em] font-black">
              <Award size={14} />
              Escuela EDEM
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-2">
              Escuela de Entrenamiento Ministerial
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-2">
              Formación avanzada y capacitación doctrinal y ministerial para futuros ministros de la congregación.
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest font-black border ${
              canEdit
                ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                : 'bg-purple-500/10 border-purple-400/30 text-purple-300'
            }`}
          >
            {canEdit ? 'Administración habilitada' : 'Solo lectura'}
          </span>
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-gray-500">
          Responsables del módulo: <span className="text-slate-700 dark:text-gray-300 font-bold">{responsibleNames.join(', ')}</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-purple-400">
            <BookOpenCheck size={16} />
            <span className="text-xs uppercase tracking-widest font-black">Cohortes Ministeriales</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{cohorts.length}</p>
        </article>
        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-purple-400">
            <Users size={16} />
            <span className="text-xs uppercase tracking-widest font-black">Ministros en Formación</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{students.length}</p>
        </article>
        <article className="p-5 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 text-purple-400">
            <CalendarDays size={16} />
            <span className="text-xs uppercase tracking-widest font-black">Cátedras Próximas</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-3">{classes.length}</p>
        </article>
      </section>

      <section className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Cohortes EDEM</h2>
        <div className="md:hidden space-y-3">
          {cohorts.map((cohort) => (
            <article
              key={cohort.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0f0f0f]"
            >
              <p className="font-bold text-slate-900 dark:text-white">{cohort.name}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Inicio: {cohort.startDate}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Cierre: {cohort.endDate}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Estado: {statusLabel[cohort.status] ?? cohort.status}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">Alumnos: <span className="font-bold">{cohort.totalStudents}</span></p>
            </article>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500 dark:text-gray-500">
                <th className="text-left py-3">Cohorte</th>
                <th className="text-left py-3">Inicio</th>
                <th className="text-left py-3">Cierre</th>
                <th className="text-left py-3">Estado</th>
                <th className="text-left py-3">Alumnos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {cohorts.map((cohort) => (
                <tr key={cohort.id}>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{cohort.name}</td>
                  <td className="py-3 text-slate-500 dark:text-gray-400">{cohort.startDate}</td>
                  <td className="py-3 text-slate-500 dark:text-gray-400">{cohort.endDate}</td>
                  <td className="py-3 text-slate-500 dark:text-gray-400">{statusLabel[cohort.status] ?? cohort.status}</td>
                  <td className="py-3 text-slate-900 dark:text-white font-bold">{cohort.totalStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Progreso de Ministros en Formación</h2>
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                <BrotherNameTrigger
                  name={student.name}
                  className="font-bold text-slate-900 dark:text-white hover:text-purple-400 transition-colors"
                  fallbackClassName="font-bold text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{student.cell} - {student.level}</p>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-2">
                  Asistencia: <span className="font-bold">{student.attendanceRate}%</span> | Promedio:{' '}
                  <span className="font-bold">{student.averageGrade ?? 'Sin notas'}</span>
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Cátedras y Agenda Ministerial</h2>
          <div className="space-y-3">
            {classes.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0f0f0f]">
                <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                  {item.date} - {item.hour} - Docente: {item.teacher}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {!canEdit && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-500">
          <ShieldCheck size={14} />
          Solo los responsables del módulo pueden editar información de Escuela EDEM.
        </div>
      )}
    </div>
  );
};
