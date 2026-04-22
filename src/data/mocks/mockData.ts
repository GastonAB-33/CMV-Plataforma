import { Brother, Event, EventType, Observation, ProcessObservation, Proceso, Role } from '../../types';

const OBS_GUILLERMO: Observation[] = [
  { id: 'o1', date: '2024-03-20', author: 'Sistema', text: 'Fundacion de la Red Apostolica CMV.' },
];

const OBS_PASTOR: Observation[] = [
  { id: 'o2', date: '2024-03-25', author: 'Apostol Guillermo', text: 'Gran trabajo liderando y multiplicando.' },
];

const OBS_DISCIPULO: Observation[] = [
  { id: 'o3', date: '2024-04-01', author: 'Lider Celula', text: 'Asistencia perfecta a las reuniones EDDI.' },
];

const makeObservation = (
  text: string,
  authorName: string,
  role: ProcessObservation['author']['role'],
  createdAt: string
): ProcessObservation => ({
  text,
  author: { name: authorName, role },
  createdAt,
});

export const MOCK_BROTHERS: Brother[] = [
  {
    id: '1',
    name: 'Apostol Guillermo',
    role: Role.APOSTOL,
    procesoActual: Proceso.DISCIPULO,
    acompanamiento: {
      apostolName: 'Apostol Guillermo',
      celulaName: 'Red Apostólica',
    },
    altar: {
      fechaInicio: '2020-01-01',
      fechaFin: '2020-03-01',
      observaciones: [makeObservation('Excelente inicio.', 'Pastor Carlos', 'pastor', '2020-03-01')],
    },
    grupo: { fechaInicio: '2020-03-01', fechaFin: '2020-06-01' },
    experiencia: {
      fechaRealizacion: '2020-07-15',
      observaciones: [makeObservation('Impactado por el Espiritu Santo.', 'Pastor Carlos', 'pastor', '2020-07-15')],
    },
    eddi: {
      fechaInicio: '2020-08-01',
      fechaFin: '2021-02-01',
      notasExamenes: [
        { id: 'g-1-1', materia: 'Doctrina 1', modulo: 'Modulo 1', fecha: '2020-09-10', nota: 10, estado: 'APROBADO' },
        { id: 'g-1-2', materia: 'Sanidad', modulo: 'Modulo 2', fecha: '2020-11-18', nota: 10, estado: 'APROBADO' },
      ],
    },
    discipulo: {
      fechaInicio: '2021-03-01',
      observaciones: [makeObservation('Formando a los pastores.', 'Apostol Guillermo', 'pastor', '2021-03-01')],
    },
    observations: OBS_GUILLERMO,
    disciples: ['Pastor Carlos', 'Pastora Ana'],
  },
  {
    id: '2',
    name: 'Pastor Carlos',
    role: Role.PASTOR,
    procesoActual: Proceso.DISCIPULO,
    acompanamiento: {
      acompananteName: 'Apostol Guillermo',
      pastorName: 'Pastor Carlos',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Vida',
    },
    eddi: {
      notasExamenes: [
        { id: 'g-2-1', materia: 'Liderazgo', modulo: 'Modulo 1', fecha: '2021-03-08', nota: 9, estado: 'APROBADO' },
        { id: 'g-2-2', materia: 'Hermeneutica', modulo: 'Modulo 2', fecha: '2021-04-15', nota: 8, estado: 'APROBADO' },
      ],
    },
    observations: OBS_PASTOR,
    disciples: ['Luis Rodriguez', 'Javier Mendoza', 'Pedro Gomez'],
  },
  {
    id: '3',
    name: 'Pastora Ana',
    role: Role.PASTOR,
    procesoActual: Proceso.DISCIPULO,
    acompanamiento: {
      acompananteName: 'Apostol Guillermo',
      pastorName: 'Pastora Ana',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Nissi',
    },
    observations: [],
    disciples: ['Elena Fernandez', 'Sofia Lopez'],
  },
  {
    id: '4',
    name: 'Luis Rodriguez',
    fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200',
    role: Role.LIDER_RED_CELULAS,
    procesoActual: Proceso.EDDI,
    acompanamiento: {
      acompananteName: 'Pastor Carlos',
      liderCelulaName: 'Pastor Carlos',
      pastorName: 'Pastor Carlos',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Zaeta',
    },
    altar: {
      realizadoPor: ['Pastor Carlos', 'Pedro Gomez'],
      fechaInicio: '2023-01-10',
      fechaFin: '2023-03-10',
      observaciones: [
        makeObservation('Mostro arrepentimiento genuino y se integro rapido.', 'Pastor Carlos', 'pastor', '2023-03-10'),
        makeObservation('Completo su etapa con buena disposicion.', 'Pedro Gomez', 'lider', '2023-03-08'),
      ],
    },
    grupo: {
      fechaInicio: '2023-03-15',
      fechaFin: '2023-06-20',
      observaciones: [makeObservation('Muy participativo en dinamicas de grupo.', 'Pedro Gomez', 'lider', '2023-06-18')],
    },
    experiencia: {
      fechaRealizacion: '2023-07-05',
      observaciones: [
        makeObservation('Recibio sanidad emocional durante retiro.', 'Pastor Carlos', 'pastor', '2023-07-05'),
        makeObservation('Se vio un cambio sostenido en su caracter.', 'Javier Mendoza', 'discipulo', '2023-07-12'),
      ],
    },
    eddi: {
      fechaInicio: '2023-08-01',
      fechaFin: '2024-12-10',
      notasExamenes: [
        { id: 'g-4-1', materia: 'Doctrina Basica', modulo: 'Modulo 1', fecha: '2023-09-20', nota: 9.5, estado: 'APROBADO' },
        { id: 'g-4-2', materia: 'Sanidad Interior', modulo: 'Modulo 2', fecha: '2023-11-05', nota: 10, estado: 'APROBADO' },
        { id: 'g-4-3', materia: 'Guerra Espiritual', modulo: 'Modulo 3', fecha: '2024-01-22', nota: 8.5, estado: 'APROBADO' },
      ],
      observaciones: [
        makeObservation('Cursa segundo cuatrimestre con notas sobresalientes.', 'Pastor Carlos', 'pastor', '2024-11-20'),
        makeObservation('Sigue constante en asistencia y preparacion.', 'Pedro Gomez', 'lider', '2024-10-14'),
      ],
    },
    observations: [],
  },
  {
    id: '5',
    name: 'Elena Fernandez',
    role: Role.LIDER_CELULA,
    procesoActual: Proceso.EDDI,
    acompanamiento: {
      acompananteName: 'Pastora Ana',
      pastorName: 'Pastora Ana',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Sion',
    },
    observations: [],
  },
  {
    id: '6',
    name: 'Javier Mendoza',
    role: Role.LIDER_CELULA,
    procesoActual: Proceso.EXPERIENCIA,
    acompanamiento: {
      acompananteName: 'Pastor Carlos',
      pastorName: 'Pastor Carlos',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Maranata',
    },
    experiencia: { fechaRealizacion: '2024-02-15' },
    observations: OBS_DISCIPULO,
  },
  {
    id: '7',
    name: 'Sofia Lopez',
    role: Role.LIDER_CELULA,
    procesoActual: Proceso.EXPERIENCIA,
    acompanamiento: {
      acompananteName: 'Pastora Ana',
      pastorName: 'Pastora Ana',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Alpha y Omega',
    },
    observations: [],
  },
  {
    id: '8',
    name: 'Pedro Gomez',
    role: Role.DISCIPULO,
    procesoActual: Proceso.GRUPO,
    acompanamiento: {
      acompananteName: 'Pastor Carlos',
      pastorName: 'Pastor Carlos',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Vida',
    },
    altar: { fechaFin: '2024-01-10' },
    observations: [],
  },
  {
    id: '9',
    name: 'Maria Martinez',
    role: Role.HERMANO_MAYOR,
    procesoActual: Proceso.GRUPO,
    acompanamiento: {
      acompananteName: 'Luis Rodriguez',
      liderCelulaName: 'Luis Rodriguez',
      pastorName: 'Pastor Carlos',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Zaeta',
    },
    observations: [],
  },
  {
    id: '10',
    name: 'Juan Ruiz',
    role: Role.HERMANO_NUEVO,
    procesoActual: Proceso.ALTAR,
    acompanamiento: {
      acompananteName: 'Elena Fernandez',
      liderCelulaName: 'Elena Fernandez',
      pastorName: 'Pastora Ana',
      apostolName: 'Apostol Guillermo',
      celulaName: 'Sion',
    },
    altar: { fechaInicio: '2024-03-25' },
    observations: [],
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Noche de Avivamiento',
    type: EventType.RED,
    date: '2024-04-15',
    time: '19:30',
    cell: 'Red Apostolica',
    organizerCell: 'Red Apostólica',
    invitedCells: ['Vida', 'Nissi', 'Zaeta', 'Sion', 'Maranata', 'Alpha y Omega'],
  },
  {
    id: 'e2',
    title: 'Celula Especial Vida',
    type: EventType.CELULA,
    date: '2024-04-18',
    time: '20:00',
    cell: 'Vida',
    organizerCell: 'Vida',
    invitedCells: ['Zaeta'],
  },
  {
    id: 'e3',
    title: 'Congreso Fuerza Joven',
    type: EventType.JOVENES,
    date: '2024-05-02',
    time: '18:00',
    cell: 'Zaeta / Sion',
    organizerCell: 'Zaeta',
    invitedCells: ['Sion', 'Vida'],
  },
  {
    id: 'e4',
    title: 'Reunion Liderazgo General',
    type: EventType.RED,
    date: '2024-04-20',
    time: '09:00',
    cell: 'Maranata',
    organizerCell: 'Maranata',
    invitedCells: ['Vida', 'Nissi', 'Zaeta', 'Sion', 'Alpha y Omega'],
  },
];

