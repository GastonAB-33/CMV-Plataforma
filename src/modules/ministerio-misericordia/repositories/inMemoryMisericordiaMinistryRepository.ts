import { MisericordiaMember, MisericordiaMessage, MisericordiaMinistryRepository, MisericordiaOutreach } from '../types';

const MEMBERS: MisericordiaMember[] = [
  { id: 'mmis-1', name: 'Rocio Fernandez', role: 'Coordinadora', area: 'Cocina', availability: 'ALTA' },
  { id: 'mmis-2', name: 'Nicolas Peralta', role: 'Servidor', area: 'Preparacion', availability: 'ALTA' },
  { id: 'mmis-3', name: 'Carla Sosa', role: 'Servidora', area: 'Reparto', availability: 'MEDIA' },
  { id: 'mmis-4', name: 'Esteban Medina', role: 'Evangelista', area: 'Evangelismo', availability: 'MEDIA' },
];

const MESSAGES: MisericordiaMessage[] = [
  {
    id: 'msg-1',
    title: 'Pan para el cuerpo y para el alma',
    topic: 'Compasion',
    speaker: 'Rocio Fernandez',
    outline:
      'Lectura: Mateo 25:35-40\nIdea central: Servimos a Cristo cuando servimos al necesitado.\nLlamado: Unir accion social con discipulado en cada salida.',
  },
  {
    id: 'msg-2',
    title: 'Jesus en las calles',
    topic: 'Evangelismo practico',
    speaker: 'Esteban Medina',
    outline:
      'Lectura: Lucas 4:18\nIdea central: Llevamos buenas nuevas, sanidad y esperanza.\nLlamado: Orar por cada persona y ofrecer acompanamiento.',
  },
  {
    id: 'msg-3',
    title: 'Servir con excelencia',
    topic: 'Mayordomia',
    speaker: 'Nicolas Peralta',
    outline:
      'Lectura: Colosenses 3:23\nIdea central: Todo servicio se hace para el Senor.\nLlamado: Preparar alimentos dignos y trato amoroso.',
  },
];

const OUTREACHES: MisericordiaOutreach[] = [
  { id: 'out-1', date: '2026-04-18', hour: '18:30', location: 'Plaza central', status: 'REALIZADO' },
];

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export class InMemoryMisericordiaMinistryRepository implements MisericordiaMinistryRepository {
  listMembers(): MisericordiaMember[] {
    return clone(MEMBERS);
  }

  listMessages(): MisericordiaMessage[] {
    return clone(MESSAGES);
  }

  listOutreaches(): MisericordiaOutreach[] {
    return clone(OUTREACHES);
  }
}
