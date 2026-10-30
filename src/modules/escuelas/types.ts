import { Cell, Proceso, Role } from '../../types';
import { BrotherId, BrotherProfile } from '../hermanos/types';

export type SchoolType = 'eddi-1' | 'eddi-2' | 'eddi-3' | 'edem' | 'material-estudio';

export type SchoolStudentStatus = 'EN_CURSO' | 'COMPLETADO' | 'SIN_INICIAR' | 'REPROBADO';

export interface SchoolGradeItem {
  id: string;
  materia: string;
  modulo?: string;
  fecha?: string;
  nota: number;
  estado?: 'APROBADO' | 'REPROBADO' | 'EN_CURSO';
  observacion?: string;
}

export interface SchoolStudent {
  brotherId: BrotherId;
  name: string;
  fotoUrl?: string;
  telefono?: string;
  cellName: Cell;
  role: Role;
  procesoActual: Proceso;
  fechaInicio?: string;
  fechaFin?: string;
  grades: SchoolGradeItem[];
  averageGrade: number | null;
  status: SchoolStudentStatus;
  isStageCompletedInTimeline: boolean;
}

export interface SchoolDefinition {
  id: SchoolType;
  title: string;
  shortTitle: string;
  stageNumber: number; // 3 = EDDI 1, 5 = EDDI 2, 7 = EDDI 3, 9 = EDEM
  stageName: string;
  levelBadge: string;
  categoryLabel: string;
  description: string;
  longDescription: string;
  accentColor: string; // Tailwind color class or hex
  gradientClass: string;
  badgeBg: string;
  badgeText: string;
  tagline: string;
  suggestedSubjects: { materia: string; modulo: string }[];
  cohortsCount: number;
  upcomingClass: { title: string; date: string; hour: string; teacher: string };
}

export type MaterialCategory = 'TODOS' | 'eddi-1' | 'eddi-2' | 'eddi-3' | 'edem' | 'GENERAL';
export type MaterialFileType = 'PDF' | 'GUIA' | 'VIDEO' | 'BOSQUEJO' | 'EXAMEN';

export interface StudyMaterial {
  id: string;
  title: string;
  schoolType: SchoolType | 'GENERAL';
  categoryLabel: string;
  description: string;
  moduleName?: string;
  author: string;
  fileType: MaterialFileType;
  fileSizeOrDuration: string;
  dateAdded: string;
  readTimeMinutes: number;
  downloadUrl?: string;
  contentOutline?: string[];
  keyVerses?: string[];
  summaryText?: string;
}

export interface SchoolStats {
  totalStudents: number;
  inProgressCount: number;
  completedCount: number;
  averageGrade: number | null;
  totalGradesRecorded: number;
  cellsRepresentedCount: number;
}
