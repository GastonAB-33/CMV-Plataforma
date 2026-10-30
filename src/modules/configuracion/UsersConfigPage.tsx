import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Shield, UserCog, UserCheck, Sparkles, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
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
import { STAGE_NAMES, stageProgressionService } from '../../services/stageProgressionService';
import { brothersService } from '../../services/brothersService';
import { BrotherProfile } from '../hermanos/types';

const MANAGER_ROLES = new Set<Role>([Role.SUPERADMIN, Role.APOSTOL, Role.PASTOR]);
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
  seguimiento: 'Estadísticas',
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
  const [brothers, setBrothers] = useState<BrotherProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createAccess, setCreateAccess] = useState(true);
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

  // Etapa configurable para habilitar acceso (Por defecto: 4 = Discípulo Conector)
  const [minAccessStageNumber, setMinAccessStageNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cmv_min_access_stage');
      return saved ? parseInt(saved, 10) : 4;
    }
    return 4;
  });

  // Correos editables para candidatos
  const [candidateEmails, setCandidateEmails] = useState<Record<string, string>>({});
  const [activatingCandidateId, setActivatingCandidateId] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    const rows = await supabaseUsersService.listUsers();
    setUsers(rows);
    setIsLoading(false);
  };

  const loadBrothers = async () => {
    const list = await brothersService.listAsync();
    setBrothers(list);
  };

  useEffect(() => {
    if (!canManageUsers) {
      return;
    }
    void loadUsers();
    void loadBrothers();
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
  };

  const openEdit = async (target: AppUserRow) => {
    setEditingId(target.id);
    setNombre(target.nombre);
    setEmail(target.email);
    setRol(target.rol);
    setActivo(target.activo);
    setCreateAccess(false);

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
      // Flujo de auto-servicio: Se crea en auth con invite/reset sin que el pastor tenga que inventar una clave
      const authResult = await supabaseUsersService.provisionUserWithInvite(email);
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
      text: editingId
        ? 'Usuario actualizado correctamente.'
        : 'Usuario agregado a la lista de aprobados. Se envió el correo para definir contraseña (o podrá usar Google).',
      type: 'success',
    });
    resetForm();
    await loadUsers();
  };

  // Cálculo de candidatos elegibles para activar acceso
  const eligibleCandidates = useMemo(() => {
    return brothers.filter((brother) => {
      const progression = stageProgressionService.resolveProgression(brother);
      const hasReached =
        progression.currentStageNumber >= minAccessStageNumber ||
        progression.isStageCompleted(minAccessStageNumber);

      if (!hasReached) {
        return false;
      }

      const brotherEmail = (candidateEmails[brother.id] ?? brother.email ?? '').trim().toLowerCase();
      const brotherName = brother.name.trim().toLowerCase();

      // Chequear si ya está activo en la tabla usuarios (whitelist)
      const isAlreadyUser = users.some((u) => {
        const userEmail = u.email.trim().toLowerCase();
        const userName = u.nombre.trim().toLowerCase();
        return (brotherEmail && userEmail === brotherEmail) || userName === brotherName;
      });

      return !isAlreadyUser;
    });
  }, [brothers, users, minAccessStageNumber, candidateEmails]);

  const handleActivateBrother = async (brother: BrotherProfile) => {
    const effectiveEmail = (candidateEmails[brother.id] ?? brother.email ?? '').trim().toLowerCase();
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      setToast({
        text: `Por favor ingresa un correo electrónico válido para ${brother.name} antes de activar su cuenta.`,
        type: 'error',
      });
      return;
    }

    setActivatingCandidateId(brother.id);
    const progression = stageProgressionService.resolveProgression(brother);
    // Rol sugerido: Si ya está en etapa 8 (Líder de Célula) o más se le da LIDER_CELULA, si no DISCIPULO
    const recommendedRole = progression.currentStageNumber >= 8 ? Role.LIDER_CELULA : Role.DISCIPULO;

    const result = await supabaseUsersService.activateBrotherAccess(
      {
        name: brother.name,
        email: effectiveEmail,
        role: recommendedRole,
        celulaId: null,
      },
      { id: user.id, name: user.name },
    );

    setActivatingCandidateId(null);

    if (!result.ok) {
      setToast({ text: result.error ?? 'No se pudo activar la cuenta.', type: 'error' });
      return;
    }

    setToast({
      text: `¡Cuenta activada para ${brother.name}! Se habilitó su acceso en la lista de aprobados y se envió el correo a ${effectiveEmail} (también puede entrar con Google).`,
      type: 'success',
    });

    await loadUsers();
    await loadBrothers();
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
              Gestiona perfiles, roles y la lista blanca de acceso (Whitelist) de la plataforma.
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

      {/* METRICAS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <article className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-4">
          <p className="text-xs text-slate-500 dark:text-gray-400">Usuarios en Whitelist</p>
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

      {/* SECCIÓN CONFIGURABLE: PROMOCIÓN Y ACTIVACIÓN DE CUENTAS POR ETAPA */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#c5a059]" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Activación de Cuentas por Promoción
              </h2>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Habilita el acceso automático a los hermanos al alcanzar la etapa configurada.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">
              Etapa para habilitar acceso:
            </span>
            <select
              value={minAccessStageNumber}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinAccessStageNumber(val);
                localStorage.setItem('cmv_min_access_stage', String(val));
              }}
              className="rounded-xl border border-[#c5a059]/40 bg-[#c5a059]/10 px-3 py-1.5 text-xs font-bold text-[#c5a059] outline-none cursor-pointer"
            >
              {Object.entries(STAGE_NAMES).map(([num, name]) => (
                <option key={num} value={num} className="bg-white dark:bg-[#111111] text-slate-900 dark:text-white">
                  Etapa {num}: {name} {Number(num) === 4 ? '(Por defecto: Discípulo Conector)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-gray-400">
              Hermanos pendientes de activación en o sobre{' '}
              <span className="text-[#c5a059] font-black">
                Etapa {minAccessStageNumber} ({STAGE_NAMES[minAccessStageNumber]})
              </span>
            </span>
            <span className="text-xs bg-[#c5a059]/20 text-[#c5a059] px-2.5 py-0.5 rounded-full font-bold">
              {eligibleCandidates.length} candidatos listos
            </span>
          </div>

          {eligibleCandidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center">
              <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-200">
                ¡Todo al día!
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                No hay hermanos pendientes de activación en la etapa seleccionada. Todos los miembros en esta etapa ya tienen su cuenta habilitada en la Whitelist.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eligibleCandidates.map((candidate) => {
                const progression = stageProgressionService.resolveProgression(candidate);
                const currentEmail = candidateEmails[candidate.id] ?? candidate.email ?? '';
                const isActivating = activatingCandidateId === candidate.id;

                return (
                  <div
                    key={candidate.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0a0a0a] p-4 hover:border-[#c5a059]/40 transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {candidate.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-gray-400">
                            Célula: {candidate.acompanamiento.celulaName}
                          </p>
                        </div>
                        <span className="rounded-lg bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 text-[10px] font-black uppercase">
                          {progression.currentStageName}
                        </span>
                      </div>

                      <div className="mt-3">
                        <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block mb-1">
                          Correo para la cuenta:
                        </label>
                        <div className="relative">
                          <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={currentEmail}
                            onChange={(e) =>
                              setCandidateEmails((prev) => ({
                                ...prev,
                                [candidate.id]: e.target.value,
                              }))
                            }
                            placeholder="correo@gmail.com"
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 py-1.5 pl-7 pr-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#c5a059]"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isActivating || !currentEmail}
                      onClick={() => handleActivateBrother(candidate)}
                      className="mt-4 w-full rounded-xl bg-[#c5a059] hover:bg-[#d4b375] disabled:opacity-50 text-black font-black py-2 px-3 text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <UserCheck size={14} />
                      <span>{isActivating ? 'Activando...' : 'Activar cuenta'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FORMULARIO Y LISTADO MANUAL */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <article className="xl:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserCog size={16} className="text-[#c5a059]" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingId ? 'Editar usuario' : 'Nuevo usuario en Whitelist'}
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
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300 mb-1 block">
                Nombre completo
              </label>
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Nombre completo"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300 mb-1 block">
                Correo electrónico
              </label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="email@dominio.com"
                className="w-full rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-gray-300 mb-1 block">
                Rol
              </label>
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
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-300 py-1">
              <input
                checked={activo}
                onChange={(event) => setActivo(event.target.checked)}
                type="checkbox"
              />
              Usuario habilitado en Whitelist
            </label>

            {!editingId && (
              <div className="rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/10 p-3 text-xs space-y-1.5">
                <p className="font-bold text-slate-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Mail size={14} className="text-[#c5a059]" />
                  Invitación y acceso simplificado
                </p>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
                  No necesitas crear una contraseña para el usuario. Al agregarlo, el sistema le enviará un correo para definir su propia clave, o podrá acceder directamente en 1 clic con <strong>Continuar con Google</strong> usando este correo.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#c5a059] hover:bg-[#d4b375] text-black font-black px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer shadow-sm transition-all"
              >
                {isSaving ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar a Whitelist'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 dark:border-white/10 px-4 py-2.5 text-xs uppercase tracking-widest cursor-pointer"
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Listado de usuarios en Whitelist
            </h2>
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
                  className="w-full text-left rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0a0a0a] p-3 hover:border-[#c5a059]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{item.nombre}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#c5a059] uppercase">{roleLabel(item.rol)}</p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400">
                        {item.activo ? 'Habilitado' : 'Bloqueado'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* PERMISOS POR PERFIL */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-[#c5a059]" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Permisos por perfil</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-gray-400 mb-4">
          Para cada módulo: activa visibilidad y define si el perfil solo puede ver o también editar.
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
