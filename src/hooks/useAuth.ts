import { useSyncExternalStore } from 'react';
import { canManageNotifications } from '../lib/permissionsMatrix';
import { applyRolePermissionsOverrides, applyUserPermissionOverrides } from '../lib/permissionsMatrix';
import { Role, User } from '../types';
import { supabaseAuditService } from '../services/supabaseAuditService';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient';
import { supabaseRolePermissionsService } from '../services/supabaseRolePermissionsService';
import { supabaseUserPermissionsService } from '../services/supabaseUserPermissionsService';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type LoginResult = {
  ok: boolean;
  error?: string;
};

const FALLBACK_USER: User = {
  id: 'u-local-fallback',
  name: 'Pastor Carlos',
  role: Role.PASTOR,
  primaryCell: 'Vida',
  coveredCells: ['Vida', 'Zaeta'],
};

const DEFAULT_STATE: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

let authState: AuthState = DEFAULT_STATE;
let initialized = false;
let authListenerBound = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const setAuthState = (next: AuthState) => {
  authState = next;
  notify();
};

const mapRole = (value?: string): Role => {
  const normalized = String(value ?? '').trim().toUpperCase();
  switch (normalized) {
    case Role.SUPERADMIN:
      return Role.SUPERADMIN;
    case Role.APOSTOL:
      return Role.APOSTOL;
    case Role.PASTOR:
      return Role.PASTOR;
    case Role.LIDER_RED_CELULAS:
      return Role.LIDER_RED_CELULAS;
    case Role.LIDER_CELULA:
      return Role.LIDER_CELULA;
    case Role.DISCIPULO:
      return Role.DISCIPULO;
    case Role.HERMANO_MAYOR:
      return Role.HERMANO_MAYOR;
    case Role.HERMANO_NUEVO:
      return Role.HERMANO_NUEVO;
    default:
      return Role.HERMANO_NUEVO;
  }
};

const resolveUserByEmail = async (email: string): Promise<User | null> => {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('usuarios')
    .select('id, nombre, email, rol, celula_id, activo')
    .eq('email', email.toLowerCase())
    .eq('activo', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  let primaryCell: User['primaryCell'];
  if (data.celula_id) {
    const { data: cell } = await client
      .from('celulas')
      .select('nombre')
      .eq('id', data.celula_id)
      .maybeSingle();

    primaryCell = (cell?.nombre as User['primaryCell']) ?? undefined;
  }

  return {
    id: data.id,
    name: data.nombre,
    role: mapRole(data.rol),
    primaryCell,
    coveredCells: primaryCell ? [primaryCell] : [],
  };
};

const applySessionUser = async (email?: string | null) => {
  if (!email) {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    return;
  }

  const user = await resolveUserByEmail(email);
  if (!user) {
    const client = getSupabaseClient();
    await client?.auth.signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    return;
  }

  const [roleOverrides, userOverrides] = await Promise.all([
    supabaseRolePermissionsService.list(),
    supabaseUserPermissionsService.listAll(),
  ]);
  applyRolePermissionsOverrides(roleOverrides);
  applyUserPermissionOverrides(userOverrides);

  setAuthState({
    user,
    isAuthenticated: true,
    isLoading: false,
  });
};

const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  initialized = true;

  if (!isSupabaseConfigured()) {
    setAuthState({
      user: FALLBACK_USER,
      isAuthenticated: true,
      isLoading: false,
    });
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    return;
  }

  void client.auth.getSession().then(({ data }) => {
    void applySessionUser(data.session?.user?.email);
  });

  if (!authListenerBound) {
    client.auth.onAuthStateChange((_event, session) => {
      void applySessionUser(session?.user?.email);
    });
    authListenerBound = true;
  }
};

const subscribe = (listener: () => void) => {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => {
  ensureInitialized();
  return authState;
};

const getServerSnapshot = () => DEFAULT_STATE;

const login = async (email: string, password: string): Promise<LoginResult> => {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: 'Supabase no esta configurado.' };
  }

  setAuthState({
    ...authState,
    isLoading: true,
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    void supabaseAuditService.log({
      actor: { email },
      modulo: 'auth',
      entityType: 'session',
      entityId: email.toLowerCase(),
      action: 'auth_failed',
      metadata: { reason: error?.message ?? 'invalid_credentials' },
    });
    return { ok: false, error: 'Email o contrasena invalida.' };
  }

  const appUser = await resolveUserByEmail(data.user.email);
  if (!appUser) {
    await client.auth.signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    void supabaseAuditService.log({
      actor: { email: data.user.email },
      modulo: 'auth',
      entityType: 'session',
      entityId: data.user.id,
      action: 'auth_failed',
      metadata: { reason: 'user_not_authorized_in_usuarios' },
    });
    return { ok: false, error: 'Tu usuario no esta habilitado en la plataforma.' };
  }

  setAuthState({
    user: appUser,
    isAuthenticated: true,
    isLoading: false,
  });

  void supabaseAuditService.log({
    actor: { id: appUser.id, email: data.user.email, name: appUser.name },
    modulo: 'auth',
    entityType: 'session',
    entityId: data.user.id,
    action: 'login',
    metadata: { role: appUser.role },
  });

  return { ok: true };
};

const logout = async () => {
  const actor = authState.user;
  const client = getSupabaseClient();
  await client?.auth.signOut();
  setAuthState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  if (actor) {
    void supabaseAuditService.log({
      actor: { id: actor.id, name: actor.name },
      modulo: 'auth',
      entityType: 'session',
      entityId: actor.id,
      action: 'logout',
      metadata: { role: actor.role },
    });
  }
};

export const useAuth = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = state.user ?? FALLBACK_USER;

  return {
    user,
    isAuthenticated: state.isAuthenticated,
    isAuthLoading: state.isLoading,
    canManageNotifications: state.isAuthenticated ? canManageNotifications(user.role) : false,
    login,
    logout,
  };
};
