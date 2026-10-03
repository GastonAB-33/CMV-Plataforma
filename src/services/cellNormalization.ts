const stripAccents = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const normalizeCellKey = (value?: string | null): string =>
  stripAccents(value ?? '')
    .replace(/[^a-z0-9]+/g, '');

const CELL_ALIASES: Record<string, string> = {
  alfaomega: 'Alfa y Omega',
  alphayomega: 'Alfa y Omega',
  alphaomega: 'Alfa y Omega',
  alfayomega: 'Alfa y Omega',
  maranata: 'Maranata',
  maranatha: 'Maranata',
  redapostolica: 'Red Apostólica',
  redapostolicas: 'Red Apostólica',
  saeta: 'Saeta',
  saetas: 'Saeta',
  sion: 'Sion',
  zion: 'Sion',
  vida: 'Vida',
  nissi: 'Nissi',
};

export const canonicalizeCellName = (value?: string | null): string => {
  const clean = (value ?? '').trim();
  if (!clean) {
    return '';
  }

  return CELL_ALIASES[normalizeCellKey(clean)] ?? clean;
};

