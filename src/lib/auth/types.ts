import type { AllowedRole } from '@/lib/auth/constants';

export interface AuthSession {
  email: string;
  nombre: string;
  rol: AllowedRole;
}
