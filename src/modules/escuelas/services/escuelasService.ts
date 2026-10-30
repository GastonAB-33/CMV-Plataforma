import { brothersService } from '../../../services/brothersService';
import { stageDatesService } from '../../../services/stageDatesService';
import { stageProgressionService } from '../../../services/stageProgressionService';
import { BrotherProfile } from '../../hermanos/types';
import {
  SchoolDefinition,
  SchoolGradeItem,
  SchoolStats,
  SchoolStudent,
  SchoolStudentStatus,
  SchoolType,
  StudyMaterial,
} from '../types';

export const SCHOOL_DEFINITIONS: Record<Exclude<SchoolType, 'material-estudio'>, SchoolDefinition> = {
  'eddi-1': {
    id: 'eddi-1',
    title: 'Escuela EDDI 1',
    shortTitle: 'EDDI 1',
    stageNumber: 3,
    stageName: 'EDDI Escuela de Discipulados',
    levelBadge: 'NIVEL 1 • BÁSICO',
    categoryLabel: 'FORMACIÓN DOCTRINAL',
    description: 'Fundamentos de la fe, primeros pasos del creyente, doctrina básica y vida devocional diaria.',
    longDescription:
      'La Escuela de Discipulado 1 (EDDI 1) es el cimiento de la formación doctrinal en Cristo Manantial de Vida. Los nuevos creyentes son guiados en las verdades bíblicas cardinales, aprendiendo sobre salvación, autoridad espiritual, bautismo, oración y el fruto del Espíritu.',
    accentColor: '#10b981',
    gradientClass: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-600 dark:text-emerald-400',
    tagline: 'Formando discípulos de Cristo arraigados en la Palabra',
    cohortsCount: 3,
    upcomingClass: {
      title: 'Doctrina Básica y Salvación',
      date: '2026-05-12',
      hour: '20:00',
      teacher: 'Pastor Carlos',
    },
    suggestedSubjects: [
      { materia: 'Doctrina Básica y Salvación', modulo: 'Módulo 1' },
      { materia: 'Fundamentos de la Fe Cristiana', modulo: 'Módulo 1' },
      { materia: 'Autoridad Espiritual y Carácter', modulo: 'Módulo 2' },
      { materia: 'Vida Devocional y Oración', modulo: 'Módulo 2' },
    ],
  },
  'eddi-2': {
    id: 'eddi-2',
    title: 'Escuela EDDI 2',
    shortTitle: 'EDDI 2',
    stageNumber: 5,
    stageName: 'EDDI 2',
    levelBadge: 'NIVEL 2 • INTERMEDIO',
    categoryLabel: 'CRECIMIENTO CRISTIANO',
    description: 'Carácter cristiano maduro, vida en el Espíritu Santo, mayordomía bíblica y evangelismo sobrenatural.',
    longDescription:
      'EDDI 2 profundiza en la transformación del carácter del discípulo, preparándolo para servir con integridad. Se abordan principios de mayordomía financiera bíblica, liderazgo de servicio, evangelismo con poder y discernimiento espiritual.',
    accentColor: '#0ea5e9',
    gradientClass: 'from-sky-500/20 via-blue-500/10 to-transparent',
    badgeBg: 'bg-sky-500/15 border-sky-500/30',
    badgeText: 'text-sky-600 dark:text-sky-400',
    tagline: 'Capacitando discípulos en carácter, servicio y unción',
    cohortsCount: 2,
    upcomingClass: {
      title: 'Liderazgo de Servicio y Mayordomía',
      date: '2026-05-14',
      hour: '20:30',
      teacher: 'Pastora Ana',
    },
    suggestedSubjects: [
      { materia: 'Liderazgo de Servicio', modulo: 'Módulo 1' },
      { materia: 'Mayordomía Bíblica', modulo: 'Módulo 1' },
      { materia: 'Evangelismo Sobrenatural', modulo: 'Módulo 2' },
      { materia: 'Fundamentos de Consejería', modulo: 'Módulo 2' },
    ],
  },
  'eddi-3': {
    id: 'eddi-3',
    title: 'Escuela EDDI 3',
    shortTitle: 'EDDI 3',
    stageNumber: 7,
    stageName: 'EDDI 3',
    levelBadge: 'NIVEL 3 • AVANZADO',
    categoryLabel: 'DISCIPULADO MULTIPLICADOR',
    description: 'Liderazgo práctico, plantación celular, multiplicación de discípulos y guerra espiritual con autoridad.',
    longDescription:
      'EDDI 3 es el nivel de graduación para los futuros Líderes de Célula de la iglesia. Se capacita de forma práctica en pastoreo celular, formación de mentores, guerra espiritual de avanzada y ministración en los dones del Espíritu.',
    accentColor: '#f59e0b',
    gradientClass: 'from-amber-500/20 via-orange-500/10 to-transparent',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-600 dark:text-amber-400',
    tagline: 'Desarrollando líderes multiplicadores con visión apostólica',
    cohortsCount: 2,
    upcomingClass: {
      title: 'Plantación Celular y Guerra Espiritual',
      date: '2026-05-18',
      hour: '19:30',
      teacher: 'Apóstol Guillermo',
    },
    suggestedSubjects: [
      { materia: 'Plantación y Cuidado Celular', modulo: 'Módulo 1' },
      { materia: 'Guerra Espiritual y Victoria', modulo: 'Módulo 1' },
      { materia: 'Formación de Nuevos Líderes', modulo: 'Módulo 2' },
      { materia: 'Ministración y Dones del Espíritu', modulo: 'Módulo 2' },
    ],
  },
  'edem': {
    id: 'edem',
    title: 'Escuela EDEM',
    shortTitle: 'EDEM',
    stageNumber: 9,
    stageName: 'EDEM Escuela de Entrenamiento Ministerial',
    levelBadge: 'NIVEL SUPERIOR • MINISTERIAL',
    categoryLabel: 'ENTRENAMIENTO MINISTERIAL',
    description: 'Escuela teológica superior, homilética, consejería pastoral avanzada y activación de los 5 ministerios.',
    longDescription:
      'La Escuela de Entrenamiento Ministerial (EDEM) forma a los futuros ministros ordenados de la congregación. Brinda una formación teológica, pastoral y homilética exhaustiva para pastores, profetas, evangelistas, maestros y líderes de red.',
    accentColor: '#a855f7',
    gradientClass: 'from-purple-500/20 via-violet-500/10 to-transparent',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
    tagline: 'Equipando a los santos para la obra del ministerio',
    cohortsCount: 1,
    upcomingClass: {
      title: 'Homilética y Predicación Expositiva',
      date: '2026-05-20',
      hour: '20:00',
      teacher: 'Apóstol Guillermo',
    },
    suggestedSubjects: [
      { materia: 'Liderazgo Celular y Multiplicación', modulo: 'Módulo 1' },
      { materia: 'Homilética y Predicación Eficaz', modulo: 'Módulo 1' },
      { materia: 'Consejería Pastoral y Familia', modulo: 'Módulo 2' },
      { materia: 'Guerra Espiritual y Liberación', modulo: 'Módulo 2' },
    ],
  },
};

const DEFAULT_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Manual de Discipulado Básico - EDDI 1',
    schoolType: 'eddi-1',
    categoryLabel: 'EDDI 1 • Doctrina',
    description: 'Guía oficial para el alumno con 12 lecciones doctrinales esenciales, cuestionarios y versículos para memorizar.',
    moduleName: 'Módulo 1 & 2',
    author: 'Comisión Doctrinal CMV',
    fileType: 'PDF',
    fileSizeOrDuration: '4.2 MB • 64 páginas',
    dateAdded: '2026-02-15',
    readTimeMinutes: 45,
    contentOutline: [
      '1. El Plan de Salvación y el Nuevo Nacimiento',
      '2. La Seguridad de la Salvación y la Gracia',
      '3. El Bautismo en Aguas y en el Espíritu Santo',
      '4. La Importancia de la Oración Diaria y el Devocional',
      '5. Cómo Leer y Meditar en la Santa Palabra de Dios',
      '6. La Iglesia Local y la Cobertura Espiritual',
    ],
    keyVerses: ['Juan 3:16', 'Romanos 10:9-10', '2 Corintios 5:17', 'Efesios 2:8-9'],
    summaryText:
      'Este manual contiene la doctrina fundamental que cada nuevo hermano debe incorporar en su corazón para construir una vida espiritual sólida e inamovible.',
  },
  {
    id: 'mat-2',
    title: 'Guía Práctica del Altar y la Vida Devocional',
    schoolType: 'eddi-1',
    categoryLabel: 'EDDI 1 • Vida Espiritual',
    description: 'Manual paso a paso para levantar el altar personal y familiar, pautas de intercesión y lectura bíblica metódica.',
    moduleName: 'Módulo 2',
    author: 'Pastor Carlos',
    fileType: 'GUIA',
    fileSizeOrDuration: '1.8 MB • 28 páginas',
    dateAdded: '2026-03-01',
    readTimeMinutes: 25,
    contentOutline: [
      '1. El Significado del Altar en el Antiguo y Nuevo Pacto',
      '2. Estableciendo una Rutina Diaria de Comunión con Dios',
      '3. Patrón de Oración del Padre Nuestro',
      '4. Intercesión por la Familia y por la Célula',
    ],
    keyVerses: ['Mateo 6:6', 'Salmos 5:3', '1 Tesalonicenses 5:17'],
  },
  {
    id: 'mat-3',
    title: 'Doctrina de la Vida en el Espíritu y Santidad',
    schoolType: 'eddi-2',
    categoryLabel: 'EDDI 2 • Vida en el Espíritu',
    description: 'Estudio exhaustivo del bautismo en el Espíritu Santo, el fruto del Espíritu y la victoria sobre la tentación.',
    moduleName: 'Módulo 1',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '3.5 MB • 48 páginas',
    dateAdded: '2026-02-20',
    readTimeMinutes: 35,
    contentOutline: [
      '1. La Persona del Espíritu Santo',
      '2. El Fruto del Espíritu frente a las Obras de la Carne',
      '3. Cómo Ser Llenos del Espíritu Continuamente',
      '4. La Santidad Práctica en la Sociedad Actual',
    ],
    keyVerses: ['Gálatas 5:22-23', 'Efesios 5:18', 'Romanos 8:14'],
  },
  {
    id: 'mat-4',
    title: 'Mayordomía Bíblica y Finanzas del Reino',
    schoolType: 'eddi-2',
    categoryLabel: 'EDDI 2 • Mayordomía',
    description: 'Principios bíblicos de diezmos, ofrendas, administración financiera familiar y pactos de fe.',
    moduleName: 'Módulo 1',
    author: 'Pastora Ana',
    fileType: 'GUIA',
    fileSizeOrDuration: '2.1 MB • 32 páginas',
    dateAdded: '2026-03-10',
    readTimeMinutes: 30,
    contentOutline: [
      '1. El Señorío de Cristo sobre Todos los Recursos',
      '2. El Principio del Diezmo y la Generosidad Apostólica',
      '3. Salir de Deudas y Planificación Sabia',
      '4. Sembrar para la Cosecha del Reino',
    ],
    keyVerses: ['Malaquías 3:10', '2 Corintios 9:6-8', 'Proverbios 3:9-10'],
  },
  {
    id: 'mat-5',
    title: 'Manual de Multiplicación Celular y Pastoreo',
    schoolType: 'eddi-3',
    categoryLabel: 'EDDI 3 • Liderazgo Práctico',
    description: 'Metodología oficial de Cristo Manantial de Vida para dirigir una célula con fruto, dinámica semanal y consolidación.',
    moduleName: 'Módulo 1',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '5.6 MB • 76 páginas',
    dateAdded: '2026-01-25',
    readTimeMinutes: 60,
    contentOutline: [
      '1. El ADN de las Células CMV',
      '2. La Reunión Celular de 60 Minutos Paso a Paso',
      '3. El Arte de Hacer Preguntas Bíblicas Aplicativas',
      '4. La Meta de Multiplicación Anual',
      '5. Cómo Cuidar al Hermano Menor en el Grupo de Vida',
    ],
    keyVerses: ['Hechos 2:42-47', 'Hechos 20:20', '2 Timoteo 2:2'],
  },
  {
    id: 'mat-6',
    title: 'Estrategias de Evangelismo Sobrenatural y Discipulado Conector',
    schoolType: 'eddi-3',
    categoryLabel: 'EDDI 3 • Evangelismo',
    description: 'Herramientas para salir a las calles, orar por los enfermos, evangelizar con testimonio y conectar con el altar.',
    moduleName: 'Módulo 2',
    author: 'Pastor Carlos',
    fileType: 'BOSQUEJO',
    fileSizeOrDuration: '1.5 MB • 22 páginas',
    dateAdded: '2026-02-18',
    readTimeMinutes: 20,
    contentOutline: [
      '1. La Gran Comisión es una Orden, No una Opción',
      '2. Evangelismo de Contacto Personal y en Casas',
      '3. Ministración de Sanidad y Libertad',
      '4. El Papel del Discípulo Conector',
    ],
    keyVerses: ['Marcos 16:15-18', 'Lucas 10:1-9'],
  },
  {
    id: 'mat-7',
    title: 'Homilética y Predicación Eficaz de la Palabra',
    schoolType: 'edem',
    categoryLabel: 'EDEM • Homilética',
    description: 'Manual de preparación de sermones expositivos, temáticos y textuales. Ilustraciones, aplicaciones y unción en el altar.',
    moduleName: 'Módulo 1',
    author: 'Apóstol Guillermo',
    fileType: 'PDF',
    fileSizeOrDuration: '6.1 MB • 84 páginas',
    dateAdded: '2026-01-15',
    readTimeMinutes: 70,
    contentOutline: [
      '1. La Naturaleza de la Predicación Bíblica',
      '2. Hermenéutica: Cómo Interpretar el Texto en su Contexto',
      '3. La Estructura del Bosquejo Homilético',
      '4. La Entrega del Mensaje y el Llamado al Altar',
    ],
    keyVerses: ['2 Timoteo 4:1-5', '1 Corintios 2:1-5', 'Tito 2:1'],
  },
  {
    id: 'mat-8',
    title: 'Consejería Pastoral y Sanidad de la Familia',
    schoolType: 'edem',
    categoryLabel: 'EDEM • Consejería',
    description: 'Protocolos de consejería bíblica para matrimonios, restauración de jóvenes, luto y sanidad de heridas del alma.',
    moduleName: 'Módulo 2',
    author: 'Pastora Ana',
    fileType: 'PDF',
    fileSizeOrDuration: '4.9 MB • 58 páginas',
    dateAdded: '2026-02-10',
    readTimeMinutes: 50,
    contentOutline: [
      '1. Principios de la Consejería Cristocéntrica',
      '2. Diagnóstico Espiritual y Emocional',
      '3. Crisis Matrimoniales y Resolución Bíblica',
      '4. Ética y Confidencialidad Pastoral',
    ],
    keyVerses: ['Gálatas 6:1-2', 'Santiago 5:16', 'Proverbios 11:14'],
  },
  {
    id: 'mat-9',
    title: 'Constitución Doctrinal y ADN Cristo Manantial de Vida',
    schoolType: 'GENERAL',
    categoryLabel: 'General • Doctrina Oficial',
    description: 'Documento rector de la visión apostólica, valores esenciales, orden congregacional y gobierno eclesiástico de CMV.',
    moduleName: 'Documento Rector',
    author: 'Colegio Pastoral CMV',
    fileType: 'PDF',
    fileSizeOrDuration: '3.8 MB • 42 páginas',
    dateAdded: '2026-01-01',
    readTimeMinutes: 40,
    contentOutline: [
      '1. Declaración de Fe y Creencias Fundamentales',
      '2. La Visión de los 5 Ministerios y el Cuerpo de Cristo',
      '3. Estructura de Células, Redes y Zonas',
      '4. Código de Ética Ministerial y Servicio',
    ],
    keyVerses: ['Efesios 4:11-16', '1 Corintios 12:12-27'],
  },
];

const MATERIALS_STORAGE_KEY = 'cmv_escuelas_materials_v1';

export const escuelasService = {
  /**
   * Obtiene la definición de una escuela
   */
  getSchoolDefinition(schoolType: Exclude<SchoolType, 'material-estudio'>): SchoolDefinition {
    return SCHOOL_DEFINITIONS[schoolType];
  },

  /**
   * Lista todos los alumnos de una escuela determinada con sus notas y estado,
   * leyendo directamente del repositorio reactivo de hermanos.
   */
  getSchoolStudents(schoolType: Exclude<SchoolType, 'material-estudio'>): SchoolStudent[] {
    const brothers = brothersService.list();
    const students: SchoolStudent[] = [];

    for (const b of brothers) {
      const stageDates = stageDatesService.getBrotherStageDates(b.id);
      const progression = stageProgressionService.resolveProgression(b);

      let fechaInicio: string | undefined;
      let fechaFin: string | undefined;
      let rawGrades: SchoolGradeItem[] = [];
      let isEnrolled = false;
      let stageNumber = 3;

      switch (schoolType) {
        case 'eddi-1': {
          stageNumber = 3;
          fechaInicio = stageDates?.eddiFechaInicio || b.eddi?.fechaInicio;
          fechaFin = stageDates?.eddiFechaFin || b.eddi?.fechaFin;
          rawGrades = (b.eddi?.notasExamenes ?? []).map((g) => ({
            id: g.id,
            materia: g.materia,
            modulo: g.modulo,
            fecha: g.fecha,
            nota: g.nota,
            estado: g.estado ?? (g.nota >= 7 ? 'APROBADO' : 'REPROBADO'),
            observacion: g.observacion,
          }));
          // Está en EDDI 1 si tiene fechas, notas, o si su etapa actual es >= 3
          isEnrolled =
            Boolean(fechaInicio) ||
            Boolean(fechaFin) ||
            rawGrades.length > 0 ||
            progression.currentStageNumber >= 3;
          break;
        }
        case 'eddi-2': {
          stageNumber = 5;
          fechaInicio = stageDates?.eddi2FechaInicio || b.eddi2?.fechaInicio;
          fechaFin = stageDates?.eddi2FechaFin || b.eddi2?.fechaFin;
          rawGrades = (b.eddi2?.notasExamenes ?? []).map((g) => ({
            id: g.id,
            materia: g.materia,
            modulo: g.modulo,
            fecha: g.fecha,
            nota: g.nota,
            estado: g.estado ?? (g.nota >= 7 ? 'APROBADO' : 'REPROBADO'),
            observacion: g.observacion,
          }));
          isEnrolled =
            Boolean(fechaInicio) ||
            Boolean(fechaFin) ||
            rawGrades.length > 0 ||
            progression.currentStageNumber >= 5;
          break;
        }
        case 'eddi-3': {
          stageNumber = 7;
          fechaInicio = stageDates?.eddi3FechaInicio || b.eddi3?.fechaInicio;
          fechaFin = stageDates?.eddi3FechaFin || b.eddi3?.fechaFin;
          rawGrades = (b.eddi3?.notasExamenes ?? []).map((g) => ({
            id: g.id,
            materia: g.materia,
            modulo: g.modulo,
            fecha: g.fecha,
            nota: g.nota,
            estado: g.estado ?? (g.nota >= 7 ? 'APROBADO' : 'REPROBADO'),
            observacion: g.observacion,
          }));
          isEnrolled =
            Boolean(fechaInicio) ||
            Boolean(fechaFin) ||
            rawGrades.length > 0 ||
            progression.currentStageNumber >= 7;
          break;
        }
        case 'edem': {
          stageNumber = 9;
          fechaInicio = stageDates?.edemFechaInicio || b.edem?.fechaInicio;
          fechaFin = stageDates?.edemFechaFin || b.edem?.fechaFin;
          rawGrades = (b.edem?.notasExamenes ?? []).map((g) => ({
            id: g.id,
            materia: g.materia,
            modulo: g.modulo,
            fecha: g.fecha,
            nota: g.nota,
            estado: g.estado ?? (g.nota >= 7 ? 'APROBADO' : 'REPROBADO'),
            observacion: g.observacion,
          }));
          isEnrolled =
            Boolean(fechaInicio) ||
            Boolean(fechaFin) ||
            rawGrades.length > 0 ||
            progression.currentStageNumber >= 9;
          break;
        }
      }

      if (!isEnrolled) continue;

      // Calcular promedio
      let averageGrade: number | null = null;
      if (rawGrades.length > 0) {
        const sum = rawGrades.reduce((acc, g) => acc + g.nota, 0);
        averageGrade = Number((sum / rawGrades.length).toFixed(1));
      }

      // Evaluar estado del alumno
      const isCompleted = progression.isStageCompleted(stageNumber);
      let status: SchoolStudentStatus = 'SIN_INICIAR';
      if (isCompleted || (fechaFin && fechaFin.trim() !== '')) {
        status = 'COMPLETADO';
      } else if (fechaInicio || rawGrades.length > 0) {
        const hasFailedOnly = rawGrades.length > 0 && rawGrades.every((g) => g.estado === 'REPROBADO');
        status = hasFailedOnly ? 'REPROBADO' : 'EN_CURSO';
      }

      students.push({
        brotherId: b.id,
        name: b.name,
        fotoUrl: b.fotoUrl,
        telefono: b.telefono,
        cellName: b.acompanamiento.celulaName,
        role: b.role,
        procesoActual: b.procesoActual,
        fechaInicio,
        fechaFin,
        grades: rawGrades,
        averageGrade,
        status,
        isStageCompletedInTimeline: isCompleted,
      });
    }

    // Ordenar: primero los en curso, luego los completados, alfabéticamente por nombre
    return students.sort((a, b) => {
      if (a.status === 'EN_CURSO' && b.status !== 'EN_CURSO') return -1;
      if (a.status !== 'EN_CURSO' && b.status === 'EN_CURSO') return 1;
      return a.name.localeCompare(b.name);
    });
  },

  /**
   * Obtiene estadísticas agregadas de una escuela
   */
  getSchoolStats(schoolType: Exclude<SchoolType, 'material-estudio'>): SchoolStats {
    const students = this.getSchoolStudents(schoolType);
    const inProgressCount = students.filter((s) => s.status === 'EN_CURSO').length;
    const completedCount = students.filter((s) => s.status === 'COMPLETADO').length;

    let totalGrades = 0;
    let sumGrades = 0;
    const cells = new Set<string>();

    for (const student of students) {
      cells.add(student.cellName);
      for (const grade of student.grades) {
        totalGrades++;
        sumGrades += grade.nota;
      }
    }

    const averageGrade = totalGrades > 0 ? Number((sumGrades / totalGrades).toFixed(1)) : null;

    return {
      totalStudents: students.length,
      inProgressCount,
      completedCount,
      averageGrade,
      totalGradesRecorded: totalGrades,
      cellsRepresentedCount: cells.size,
    };
  },

  /**
   * Obtiene estadísticas globales de todas las escuelas combinadas
   */
  getGlobalStats() {
    const schools: Exclude<SchoolType, 'material-estudio'>[] = ['eddi-1', 'eddi-2', 'eddi-3', 'edem'];
    let totalEnrollments = 0;
    let activeEnrollments = 0;
    let totalGraduates = 0;
    let totalGrades = 0;
    let sumAllGrades = 0;

    for (const s of schools) {
      const stats = this.getSchoolStats(s);
      totalEnrollments += stats.totalStudents;
      activeEnrollments += stats.inProgressCount;
      totalGraduates += stats.completedCount;
      totalGrades += stats.totalGradesRecorded;
      if (stats.averageGrade !== null) {
        sumAllGrades += stats.averageGrade * stats.totalStudents;
      }
    }

    const globalAverage = totalEnrollments > 0 ? Number((sumAllGrades / totalEnrollments).toFixed(1)) : null;
    const materials = this.listStudyMaterials();

    return {
      totalEnrollments,
      activeEnrollments,
      totalGraduates,
      totalGrades,
      globalAverage,
      totalMaterials: materials.length,
    };
  },

  /**
   * Actualiza las calificaciones y fechas de un alumno en la escuela seleccionada.
   * Modifica tanto el objeto del hermano en brothersService como stageDatesService,
   * garantizando SINCRONIZACIÓN BIDIRECCIONAL INMEDIATA con su ficha personal y Línea de Vida.
   */
  saveStudentProgress(
    schoolType: Exclude<SchoolType, 'material-estudio'>,
    brotherId: string,
    payload: {
      fechaInicio?: string;
      fechaFin?: string;
      grades: SchoolGradeItem[];
    }
  ): boolean {
    const brother = brothersService.findById(brotherId);
    if (!brother) return false;

    const normalizedGrades = payload.grades.map((g) => ({
      id: g.id || `grade-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      materia: g.materia.trim(),
      modulo: g.modulo || 'Módulo 1',
      fecha: g.fecha || new Date().toISOString().split('T')[0],
      nota: Number(g.nota),
      estado: (g.nota >= 7 ? 'APROBADO' : 'REPROBADO') as 'APROBADO' | 'REPROBADO',
      observacion: g.observacion?.trim() || undefined,
    }));

    const updatedBrother: BrotherProfile = { ...brother };

    switch (schoolType) {
      case 'eddi-1': {
        updatedBrother.eddi = {
          ...brother.eddi,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
          notasExamenes: normalizedGrades,
        };
        stageDatesService.saveStageDates(brotherId, {
          eddiFechaInicio: payload.fechaInicio,
          eddiFechaFin: payload.fechaFin,
        });
        break;
      }
      case 'eddi-2': {
        updatedBrother.eddi2 = {
          ...brother.eddi2,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
          notasExamenes: normalizedGrades,
        };
        stageDatesService.saveStageDates(brotherId, {
          eddi2FechaInicio: payload.fechaInicio,
          eddi2FechaFin: payload.fechaFin,
        });
        break;
      }
      case 'eddi-3': {
        updatedBrother.eddi3 = {
          ...brother.eddi3,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
          notasExamenes: normalizedGrades,
        };
        stageDatesService.saveStageDates(brotherId, {
          eddi3FechaInicio: payload.fechaInicio,
          eddi3FechaFin: payload.fechaFin,
        });
        break;
      }
      case 'edem': {
        updatedBrother.edem = {
          ...brother.edem,
          fechaInicio: payload.fechaInicio,
          fechaFin: payload.fechaFin,
          notasExamenes: normalizedGrades,
        };
        stageDatesService.saveStageDates(brotherId, {
          edemFechaInicio: payload.fechaInicio,
          edemFechaFin: payload.fechaFin,
        });
        break;
      }
    }

    // Persistir hermano en memoria y caches
    brothersService.addBrother(updatedBrother);
    return true;
  },

  /**
   * Inscribe a un hermano de la congregación a una escuela con su fecha de inicio.
   */
  enrollStudent(
    schoolType: Exclude<SchoolType, 'material-estudio'>,
    brotherId: string,
    fechaInicio: string
  ): boolean {
    const brother = brothersService.findById(brotherId);
    if (!brother) return false;

    const updatedBrother: BrotherProfile = { ...brother };

    switch (schoolType) {
      case 'eddi-1': {
        updatedBrother.eddi = {
          ...brother.eddi,
          fechaInicio,
          fechaFin: brother.eddi?.fechaFin || '',
          notasExamenes: brother.eddi?.notasExamenes || [],
        };
        stageDatesService.saveStageDates(brotherId, { eddiFechaInicio: fechaInicio });
        break;
      }
      case 'eddi-2': {
        updatedBrother.eddi2 = {
          ...brother.eddi2,
          fechaInicio,
          fechaFin: brother.eddi2?.fechaFin || '',
          notasExamenes: brother.eddi2?.notasExamenes || [],
        };
        stageDatesService.saveStageDates(brotherId, { eddi2FechaInicio: fechaInicio });
        break;
      }
      case 'eddi-3': {
        updatedBrother.eddi3 = {
          ...brother.eddi3,
          fechaInicio,
          fechaFin: brother.eddi3?.fechaFin || '',
          notasExamenes: brother.eddi3?.notasExamenes || [],
        };
        stageDatesService.saveStageDates(brotherId, { eddi3FechaInicio: fechaInicio });
        break;
      }
      case 'edem': {
        updatedBrother.edem = {
          ...brother.edem,
          fechaInicio,
          fechaFin: brother.edem?.fechaFin || '',
          notasExamenes: brother.edem?.notasExamenes || [],
        };
        stageDatesService.saveStageDates(brotherId, { edemFechaInicio: fechaInicio });
        break;
      }
    }

    brothersService.addBrother(updatedBrother);
    return true;
  },

  /**
   * Lista todos los hermanos de la congregación que NO están inscriptos aún en esta escuela.
   */
  getAvailableBrothersToEnroll(schoolType: Exclude<SchoolType, 'material-estudio'>): BrotherProfile[] {
    const currentStudents = new Set(this.getSchoolStudents(schoolType).map((s) => s.brotherId));
    return brothersService.list().filter((b) => !currentStudents.has(b.id));
  },

  // ----------------------------------------------------
  // GESTIÓN DE MATERIALES DE ESTUDIO (5to Ítem)
  // ----------------------------------------------------

  listStudyMaterials(schoolFilter?: SchoolType | 'TODOS'): StudyMaterial[] {
    let saved: StudyMaterial[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(MATERIALS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            saved = parsed;
          }
        }
      } catch {
        saved = [];
      }
    }

    const all = [...DEFAULT_MATERIALS, ...saved];

    if (!schoolFilter || schoolFilter === 'TODOS' || schoolFilter === 'material-estudio') {
      return all;
    }

    return all.filter((m) => m.schoolType === schoolFilter);
  },

  addStudyMaterial(material: Omit<StudyMaterial, 'id' | 'dateAdded'>): StudyMaterial {
    const newMaterial: StudyMaterial = {
      ...material,
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(MATERIALS_STORAGE_KEY);
        const existing: StudyMaterial[] = raw ? JSON.parse(raw) : [];
        existing.push(newMaterial);
        window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(existing));
      } catch {
        // Ignore quota
      }
    }

    return newMaterial;
  },

  deleteStudyMaterial(materialId: string): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(MATERIALS_STORAGE_KEY);
        if (raw) {
          const existing: StudyMaterial[] = JSON.parse(raw);
          const filtered = existing.filter((m) => m.id !== materialId);
          window.localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(filtered));
          return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  },
};
