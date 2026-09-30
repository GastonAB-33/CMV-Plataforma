const FEMALE_FIRST_NAMES = new Set([
  'ana', 'elena', 'sofia', 'lucia', 'valeria', 'camila', 'paula', 'agustina', 'florencia',
  'maria', 'romina', 'daniela', 'gabriela', 'patricia', 'natalia', 'laura', 'carolina',
  'mariana', 'julieta', 'belen', 'micaela', 'cecilia', 'lorena', 'silvia', 'claudia',
  'andrea', 'marina', 'clara', 'beatriz', 'victoria', 'rocio', 'monica', 'veronica'
]);

export const MALE_AVATARS = ['/avatars/male-1.png', '/avatars/male-2.png'] as const;
export const FEMALE_AVATARS = ['/avatars/female-1.png', '/avatars/female-2.png', '/avatars/female-3.png'] as const;

export const isFemaleName = (name: string): boolean => {
  const normalized = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (normalized.startsWith('pastora ') || normalized.startsWith('hermana ')) return true;
  if (normalized.startsWith('pastor ') || normalized.startsWith('hermano ') || normalized.startsWith('apostol ')) return false;

  const firstName = normalized.split(/\s+/)[0] || '';
  if (FEMALE_FIRST_NAMES.has(firstName)) return true;
  if (
    firstName.endsWith('a') &&
    !['luca', 'lucas', 'matias', 'nicolas', 'tomas', 'elias', 'josue', 'isaias'].includes(firstName)
  ) {
    return true;
  }
  return false;
};

export const getAvatarForBrother = (name: string, explicitPhoto?: string | null): string => {
  if (explicitPhoto && explicitPhoto.trim() !== '') {
    return explicitPhoto;
  }

  const female = isFemaleName(name);
  const avatars = female ? FEMALE_AVATARS : MALE_AVATARS;

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % avatars.length;
  return avatars[index];
};
