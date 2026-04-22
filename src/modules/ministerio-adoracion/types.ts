export interface WorshipMember {
  id: string;
  name: string;
  role: string;
  instrument: string;
  availability: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface WorshipSetlistSong {
  id: string;
  title: string;
  tone: string;
  leadBy: string;
  lyrics?: string;
}

export interface WorshipRehearsal {
  id: string;
  date: string;
  hour: string;
  location: string;
  status: 'PROGRAMADO' | 'REALIZADO';
}

export interface WorshipMinistryRepository {
  listMembers(): WorshipMember[];
  listSetlistSongs(): WorshipSetlistSong[];
  listRehearsals(): WorshipRehearsal[];
}
