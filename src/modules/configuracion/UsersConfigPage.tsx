import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, UserCog } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { supabaseUsersService, type AppUserRow } from '../../services/supabaseUsersService';
import {
  AppFeatureKey,
  applyRolePermissionsOverrides,
  getPermissionLevel,
  ROLE_HIERARCHY,
  setRoleFeaturePermission,
} from '../../lib/permissionsMatrix';
import { supabaseRolePermissionsService } from '../../services/supabaseRolePermissionsService';
import { supabaseUserPermissionsService } from '../../services/supabaseUserPermissionsService';

const MANAGER_ROLES = new Set<Role>([Role.SUPERADMIN, Role.APOSTOL]);
const AVAILABLE_ROLES: Role[] = [
  Role.SUPERADMIN,
  Role.APOSTOL,
  Role.PASTOR,
  Role.LIDER_RED_CELULAS,
  Role.LIDER_CELULA,
  Role.DISCIPULO,
  Role.HERMANO_MAYOR,
  Role.HERMANO_NUEVO,
];

const roleLabel = (role: Role) => role.replace(/_/g, ' ').toLowerCase();

const FEATURE_LABELS: Record<AppFeatureKey, string> = {
  dashboard: 'Inicio',
  hermanos: 'Hermanos',
  seguimiento: 'Seguimiento',
  eventos: 'Eventos/Noticias',
  escuela_eddi: 'Escuela EDDI',
  escuela_edem: 'Escuela EDEM',
  ministerio_adoracion: 'Ministerio Adoracion',
  ministerio_multimedia: 'Ministerio Multimedia',
  ministerio_misericordia: 'Ministerio Misericordia',
  promociones: 'Promociones',
};

const FEATURE_ORDER: AppFeatureKey[] = [
  'dashboard',
  'hermanos',
  'seguimiento',
  'eventos',
  'escuela_eddi',
  'escuela_edem',
  'ministerio_adoracion',
  'ministerio_multimedia',
  'ministerio_misericordia',
  'promociones',
];

const OWNER_SUPERADMIN_EMAIL = 'ale.97.28+usercmv@gmail.com';

type PermissionMode = 'view' | 'edit';

const resolveVisibility = (role: Role, feature: AppFeatureKey): { visible: boolean; mode: PermissionMode } => {
  const permission = getPermissionLevel(role, feature);
  if (permission === 'none') {
    return { visible: false, mode: 'view' };
  }
  if (permission === 'edit' || permission === 'manage') {
    return { visible: true, mode: 'edit' };
  }
  return { visible: true, mode: 'view' };
};

const buildRolePermissionsView = () =>
  ROLE_HIERARCHY.reduce((acc, role) => {
    const features = FEATURE_ORDER.reduce((featureAcc, feature) => {
      featureAcc[feature] = resolveVisibility(role, feature);
      return featureAcc;
    }, {} as Record<AppFeatureKey, { visible: boolean; mode: PermissionMode }>);
    acc[role] = features;
    return acc;
  }, {} as Record<Role, Record<AppFeatureKey, { visible: boolean; mode: PermissionMode }>>);

export const UsersConfigPage = () => {
  const { user } = useAuth();
  const canManageUsers = MANAGER_ROLES.has(user.role);
  const [users, setUsers] = useState<AppUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createAccess, setCreateAccess] = useState(true);
  const [accessPassword, setAccessPassword] = useState('');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role>(Role.PASTOR);
  const [isSpecialPermissionsModalOpen, setIsSpecialPermissionsModalOpen] = useState(false);
  const [specialPermissionsByFeature, setSpecialPermissionsByFeature] = useState<
    Record<AppFeatureKey, { enabled: boolean; mode: PermissionMode }>
  >(
    FEATURE_ORDER.reduce((acc, feature) => {
      acc[feature] = { enabled: false, mode: 'view' };
      return acc;
    }, {} as Record<AppFeatureKey, { enabled: boolean; mode: PermissionMode }>),
  );
  const [rolePermissions, setRolePermissions] = useState(buildRolePermissionsView);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<Role>(Role.PASTOR);
  const [activo, setActivo] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    const rows = await supabaseUsersService.listUsers();
    setUsers(rows);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!canManageUsers) {
      return;
    }
    void loadUsers();
  }, [canManageUsers]);

  useEffect(() => {
    if (!canManageUsers) {
      return;
    }
    const loadPermissions = async () => {
      const rows = await supabaseRolePermissionsService.list();
      applyRolePermissionsOverrides(rows);
      setRolePermissions(buildRolePermissionsView());
    };
    void loadPermissions();
  }, [canManageUsers]);

  const resetForm = () => {
    setEditingId(null);
    setNombre('');
    setEmail('');
    setRol(Role.PASTOR);
    setActivo(true);
    setCreateAccess(true);
    setAccessPassword('');
  };

  const openEdit = async (target: AppUserRow) => {
    setEditingId(target.id);
    setNombre(target.nombre);
    setEmail(target.email);
    setRol(target.rol);
    setActivo(target.activo);
    setCreateAccess(false);
    setAccessPassword('');

    const special = await supabaseUserPermissionsService.listForUser(target.id);
    const next = FEATURE_ORDER.reduce((acc, feature) => {
      const row = special.find((item) => item.feature === feature);
      if (!row) {
        acc[feature] = { enabled: false, mode: 'view' };
      } else {
        acc[feature] = {
          enabled: true,
          mode: row.permission === 'edit' || row.permission === 'manage' ? 'edit' : 'view',
        };
      }
      return acc;
    }, {} as Record<AppFeatureKey, { enabled: boolean; mode: PermissionMode }>);
    setSpecialPermissionsByFeature(next);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    let userIdFromAuth: string | undefined;
    if (!editingId && createAccess) {
      if (!accessPassword.trim() || accessPassword.trim().length < 8) {
        setIsSaving(false);
        setToast({ text: 'La contrasena debe tener al menos 8 caracteres.', type: 'error' });
        return;
      }

      const authResult = await supabaseUsersService.provisionAuthUser(email, accessPassword.trim());
      if (!authResult.ok || !authResult.userId) {
        setIsSaving(false);
        setToast({
          text: authResult.error ?? 'No se pudo crear el acceso en Supabase Auth.',
          type: 'error',
        });
        return;
      }
      userIdFromAuth = authResult.userId;
    }

    const result = await supabaseUsersService.upsertUser(
      {
        id: editingId ?? userIdFromAuth,
        nombre,
        email,
        rol,
        activo,
      },
      { id: user.id, name: user.name },
    );
    setIsSaving(false);

    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo guardar el usuario.', type: 'error' });
      return;
    }

    setToast({
      text: editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.',
      type: 'success',
    });
    resetForm();
    await loadUsers();
  };

  const persistSpecialPermission = async (
    targetUserId: string,
    feature: AppFeatureKey,
    config: { enabled: boolean; mode: PermissionMode },
  ) => {
    if (!config.enabled) {
      await supabaseUserPermissionsService.remove(targetUserId, feature);
      return;
    }
    await supabaseUserPermissionsService.upsert(
      targetUserId,
      feature,
      config.mode === 'edit' ? 'edit' : 'view',
    );
  };

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((item) => item.activo).length,
      admins: users.filter((item) => item.rol === Role.SUPERADMIN || item.rol === Role.APOSTOL).length,
    }),
    [users],
  );

  if (!canManageUsers) {
    return <Navigate to="/" replace />;
  }

  const updatePermission = (
    role: Role,
    feature: AppFeatureKey,
    next: { visible?: boolean; mode?: PermissionMode },
  ) => {
    setRolePermissions((previous) => {
      const current = previous[role][feature];
      const visible = next.visible ?? current.visible;
      const mode = next.mode ?? current.mode;
      const permission = visible ? (mode === 'edit' ? 'edit' : 'view') : 'none';
      setRoleFeaturePermission(role, feature, permission);
      void supabaseRolePermissionsService.upsert({ role, feature, permission });

      return {
        ...previous,
        [role]: {
          ...previous[role],
          [feature]: {
            visible,
            mode,
          },
        },
      };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c5a059]">Configuracion</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Usuarios y permisos</h1>
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Gestiona perfiles, roles y estado de acceso para toda la plataforma.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-[#c5a059]">
              Usuarios
            </span>
            <Link
              to="/configuracion/celulas"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Células
            </Link>
            <Link
              to="/configuracion/matrimonios"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Matrimonios
            </Link>
            <Link
              to="/configuracion/discipulado"
              className="rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2 text-xs uppercase tracking-widest font-black text-slate-600 dark:text-gray-300 hover:border-[#c5a059]/40"
            >
              Discipulado
            </Link>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Usuarios</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.total}</p>
        </article>
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Activos</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.active}</p>
        </article>
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Admin/Apostol</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{summary.admins}</p>
        </article>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <article className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCog size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => setIsSpecialPermissionsModalOpen(true)}
              className="mb-4 rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 text-[#c5a059] px-3 py-2 text-xs font-black uppercase tracking-wider"
            >
              Permisos especiales
            </button>
          )}

          <form className="space-y-3" onSubmit={onSubmit}>
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
              required
            />
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="email@dominio.com"
              className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
              required
            />
            <select
              value={rol}
              onChange={(event) => setRol(event.target.value as Role)}
              className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
            >
              {AVAILABLE_ROLES.filter((roleOption) => {
                if (roleOption !== Role.SUPERADMIN) {
                  return true;
                }
                return email.trim().toLowerCase() === OWNER_SUPERADMIN_EMAIL;
              }).map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
              <input
                checked={activo}
                onChange={(event) => setActivo(event.target.checked)}
                type="checkbox"
              />
              Usuario activo
            </label>
            {!editingId && (
              <div className="space-y-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300">
                  <input
                    checked={createAccess}
                    onChange={(event) => setCreateAccess(event.target.checked)}
                    type="checkbox"
                  />
                  Crear acceso de inicio de sesion
                </label>
                {createAccess && (
                  <input
                    value={accessPassword}
                    onChange={(event) => setAccessPassword(event.target.value)}
                    type="password"
                    placeholder="Contrasena inicial (min. 8)"
                    className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-black/40 p-3 text-sm"
                    required
                  />
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black px-4 py-2 text-xs uppercase tracking-widest"
              >
                {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 dark:border-white/10 px-4 py-2 text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="xl:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Listado de usuarios</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-gray-400">No hay usuarios cargados.</p>
          ) : (
            <div className="space-y-2">
              {users.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEdit(item)}
                  className="w-full text-left rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 hover:border-[#c5a059]/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.nombre}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#c5a059] uppercase">{roleLabel(item.rol)}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-[#c5a059]" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Permisos por perfil</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
          Para cada modulo: activa visibilidad y define si el perfil solo puede ver o tambien editar.
        </p>

        <div className="space-y-4">
          <div className="max-w-sm">
            <label className="text-xs text-slate-600 dark:text-gray-300">Perfil</label>
            <select
              value={selectedRoleForPermissions}
              onChange={(event) => setSelectedRoleForPermissions(event.target.value as Role)}
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#111111] px-3 py-2 text-sm"
            >
              {ROLE_HIERARCHY.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-4">
            <p className="text-xs font-black uppercase tracking-wider text-[#c5a059] mb-3">
              {roleLabel(selectedRoleForPermissions)}
            </p>
            <div className="space-y-3">
              {FEATURE_ORDER.map((feature) => {
                const config = rolePermissions[selectedRoleForPermissions][feature];
                return (
                  <div key={`${selectedRoleForPermissions}-${feature}`} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/30 p-3">
                    <p className="text-sm text-slate-800 dark:text-gray-200">{FEATURE_LABELS[feature]}</p>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={config.visible}
                        onChange={(event) =>
                          updatePermission(selectedRoleForPermissions, feature, {
                            visible: event.target.checked,
                          })}
                      />
                      Ver
                    </label>
                    <select
                      value={config.mode}
                      disabled={!config.visible}
                      onChange={(event) =>
                        updatePermission(selectedRoleForPermissions, feature, {
                          mode: event.target.value as PermissionMode,
                        })}
                      className="rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#111111] px-2 py-1 text-xs"
                    >
                      <option value="view">Ver</option>
                      <option value="edit">Ver y editar</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      {editingId && (
        <Modal
          isOpen={isSpecialPermissionsModalOpen}
          onClose={() => setIsSpecialPermissionsModalOpen(false)}
          title="Permisos especiales por usuario"
          size="sm"
        >
          <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#c5a05944_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#c5a059]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Estos permisos se suman al rol base. Solo deben ser otorgados por Apostol o Superadmin.
            </p>
            {FEATURE_ORDER.map((feature) => {
              const config = specialPermissionsByFeature[feature];
              return (
                <div
                  key={`special-${feature}`}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-center gap-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3"
                >
                  <p className="text-sm text-slate-800 dark:text-gray-200">{FEATURE_LABELS[feature]}</p>
                  <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(event) => {
                        const next = {
                          ...specialPermissionsByFeature,
                          [feature]: { ...config, enabled: event.target.checked },
                        };
                        setSpecialPermissionsByFeature(next);
                        void persistSpecialPermission(editingId, feature, next[feature]);
                      }}
                    />
                    Activar especial
                  </label>
                  <select
                    value={config.mode}
                    disabled={!config.enabled}
                    onChange={(event) => {
                      const next = {
                        ...specialPermissionsByFeature,
                        [feature]: { ...config, mode: event.target.value as PermissionMode },
                      };
                      setSpecialPermissionsByFeature(next);
                      void persistSpecialPermission(editingId, feature, next[feature]);
                    }}
                    className="rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#111111] px-2 py-1 text-xs"
                  >
                    <option value="view">Ver</option>
                    <option value="edit">Ver y editar</option>
                  </select>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      <Toast
        message={toast?.text ?? ''}
        isVisible={Boolean(toast)}
        type={toast?.type ?? 'success'}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
