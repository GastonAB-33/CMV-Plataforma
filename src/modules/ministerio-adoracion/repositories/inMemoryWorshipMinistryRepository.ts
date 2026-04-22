import { WorshipMember, WorshipMinistryRepository, WorshipRehearsal, WorshipSetlistSong } from '../types';

const MEMBERS: WorshipMember[] = [
  { id: 'wm-1', name: 'Debora Ramirez', role: 'Voz lider', instrument: 'Voz', availability: 'ALTA' },
  { id: 'wm-2', name: 'Jonathan Perez', role: 'Musico', instrument: 'Guitarra', availability: 'ALTA' },
  { id: 'wm-3', name: 'Tamara Lopez', role: 'Corista', instrument: 'Voz', availability: 'MEDIA' },
  { id: 'wm-4', name: 'Daniel Suarez', role: 'Musico', instrument: 'Bateria', availability: 'BAJA' },
];

const SETLIST: WorshipSetlistSong[] = [
  {
    id: 'song-1',
    title: 'Santo por siempre',
    tone: 'D',
    leadBy: 'Debora Ramirez',
    lyrics:
      'Mil generaciones se postran para adorarle.\nLe cantan al Cordero que vencio.\nLos que estuvieron antes y los que vendran despues,\nle cantaran: Santo por siempre.',
  },
  {
    id: 'song-2',
    title: 'Eres todo',
    tone: 'A',
    leadBy: 'Tamara Lopez',
    lyrics:
      'Eres todo para mi, mi esperanza y mi cancion.\nMi refugio en la tormenta, mi fuerza y mi direccion.\nTe adorare por siempre.',
  },
  {
    id: 'song-3',
    title: 'Tu fidelidad',
    tone: 'G',
    leadBy: 'Debora Ramirez',
    lyrics:
      'Tu fidelidad es grande,\nTu fidelidad incomparable es.\nNadie como Tu, bendito Dios,\nGrande es Tu fidelidad.',
  },
];

const REHEARSALS: WorshipRehearsal[] = [
  { id: 'reh-3', date: '2026-04-15', hour: '19:30', location: 'Sala de ensayo', status: 'REALIZADO' },
];

const clone = <T,>(items: T[]): T[] => items.map((item) => ({ ...item }));

export class InMemoryWorshipMinistryRepository implements WorshipMinistryRepository {
  listMembers(): WorshipMember[] {
    return clone(MEMBERS);
  }

  listSetlistSongs(): WorshipSetlistSong[] {
    return clone(SETLIST);
  }

  listRehearsals(): WorshipRehearsal[] {
    return clone(REHEARSALS);
  }
}
