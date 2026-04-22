import { useMemo } from 'react';
import { Role, User } from '../types';

const CURRENT_USER: User = {
  id: 'u-1',
  name: 'Pastor Carlos',
  role: Role.PASTOR,
};

export const useAuth = () => {
  const user = useMemo(() => CURRENT_USER, []);

  return {
    user,
    isAuthenticated: true,
    canManageNotifications: [Role.APOSTOL, Role.PASTOR, Role.LIDER_CELULA].includes(user.role),
  };
};

