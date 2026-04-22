import { useMemo, useSyncExternalStore } from 'react';
import { canManageNotifications } from '../lib/permissionsMatrix';
import { Role, User } from '../types';

const CURRENT_USER: User = {
  id: 'u-1',
  name: 'Pastor Carlos',
  role: Role.PASTOR,
  primaryCell: 'Vida',
  coveredCells: ['Vida', 'Zaeta'],
};

const AUTH_STORAGE_KEY = 'cmv_auth_session_vite';
const DEFAULT_AUTHENTICATED = true;

let authState = DEFAULT_AUTHENTICATED;
let initialized = false;
const listeners = new Set<() => void>();

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_AUTHENTICATED;
  }
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  return raw === null ? DEFAULT_AUTHENTICATED : raw === '1';
};

const writeStoredAuth = (value: boolean) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_STORAGE_KEY, value ? '1' : '0');
  }
};

const ensureInitialized = () => {
  if (!initialized) {
    authState = readStoredAuth();
    initialized = true;
  }
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const setAuthState = (value: boolean) => {
  ensureInitialized();
  authState = value;
  writeStoredAuth(value);
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  ensureInitialized();
  return authState;
};

const getServerSnapshot = () => DEFAULT_AUTHENTICATED;

export const useAuth = () => {
  const isAuthenticated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => CURRENT_USER, []);

  return {
    user,
    isAuthenticated,
    canManageNotifications: canManageNotifications(user.role),
    login: () => setAuthState(true),
    logout: () => setAuthState(false),
  };
};
