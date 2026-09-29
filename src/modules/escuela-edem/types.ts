export type EdemCohortStatus = 'EN_CURSO' | 'CERRADO' | 'PLANIFICADO';

export interface EdemCohort {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: EdemCohortStatus;
  totalStudents: number;
}

export interface EdemStudentProgress {
  id: string;
  name: string;
  cell: string;
  level: string;
  attendanceRate: number;
  averageGrade: number | null;
}

export interface EdemUpcomingClass {
  id: string;
  title: string;
  date: string;
  hour: string;
  teacher: string;
}

export interface EdemSchoolRepository {
  listCohorts(): EdemCohort[];
  listStudentProgress(): EdemStudentProgress[];
  listUpcomingClasses(): EdemUpcomingClass[];
}
