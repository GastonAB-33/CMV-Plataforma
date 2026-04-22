export interface MultimediaMember {
  id: string;
  name: string;
  role: string;
  area: string;
  availability: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface MultimediaShift {
  id: string;
  date: string;
  hour: string;
  location: string;
  status: 'PROGRAMADO' | 'REALIZADO';
}

export interface MultimediaMinistryRepository {
  listMembers(): MultimediaMember[];
  listShifts(): MultimediaShift[];
}

