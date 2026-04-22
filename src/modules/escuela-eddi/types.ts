export type EddiCohortStatus = 'EN_CURSO' | 'CERRADO' | 'PLANIFICADO';

export interface EddiCohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: EddiCohortStatus;
  totalStudents: number;
}

export interface EddiStudentProgress {
  id: string;
  name: string;
  cell: string;
  level: string;
  attendanceRate: number;
  averageGrade: number | null;
}

export interface EddiUpcomingClass {
  id: string;
  title: string;
  date: string;
  hour: string;
  teacher: string;
}

export interface EddiSchoolRepository {
  listCohorts(): EddiCohort[];
  listStudentProgress(): EddiStudentProgress[];
  listUpcomingClasses(): EddiUpcomingClass[];
}

