import { MultimediaMember, MultimediaMinistryRepository, MultimediaShift } from '../types';

const MEMBERS: MultimediaMember[] = [
  { id: 'mm-1', name: 'Ezequiel Gomez', role: 'Operador', area: 'Proyeccion', availability: 'ALTA' },
  { id: 'mm-2', name: 'Luciana Torres', role: 'Tecnica', area: 'Luces', availability: 'MEDIA' },
  { id: 'mm-3', name: 'Matias Diaz', role: 'Tecnico', area: 'Sonido', availability: 'ALTA' },
  { id: 'mm-4', name: 'Sofia Benitez', role: 'Operadora', area: 'Transmision', availability: 'MEDIA' },
];

const SHIFTS: MultimediaShift[] = [
  { id: 'ms-3', date: '2026-04-15', hour: '19:30', location: 'Cabina tecnica', status: 'REALIZADO' },
];

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export class InMemoryMultimediaMinistryRepository implements MultimediaMinistryRepository {
  listMembers(): MultimediaMember[] {
    return clone(MEMBERS);
  }

  listShifts(): MultimediaShift[] {
    return clone(SHIFTS);
  }
}
