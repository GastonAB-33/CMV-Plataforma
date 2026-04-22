export interface MisericordiaMember {
  id: string;
  name: string;
  role: string;
  area: string;
  availability: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface MisericordiaMessage {
  id: string;
  title: string;
  topic: string;
  speaker: string;
  outline?: string;
}

export interface MisericordiaOutreach {
  id: string;
  date: string;
  hour: string;
  location: string;
  status: 'PROGRAMADO' | 'REALIZADO';
}

export interface MisericordiaMinistryRepository {
  listMembers(): MisericordiaMember[];
  listMessages(): MisericordiaMessage[];
  listOutreaches(): MisericordiaOutreach[];
}
