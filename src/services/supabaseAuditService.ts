import { getSupabaseClient } from './supabaseClient';

export interface AuditActor {
  id?: string;
  email?: string;
  name?: string;
}

export interface AuditLogInput {
  actor?: AuditActor;
  modulo: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'import' | 'sync' | 'login' | 'logout' | 'auth_failed';
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: unknown;
}

const isUuid = (value?: string): boolean =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

export const supabaseAuditService = {
  async log(input: AuditLogInput): Promise<void> {
    const client = getSupabaseClient();
    if (!client) {
      return;
    }

    const payload = {
      actor_user_id: isUuid(input.actor?.id) ? input.actor?.id : null,
      actor_email: input.actor?.email ?? null,
      actor_nombre: input.actor?.name ?? null,
      modulo: input.modulo,
      entity_type: input.entityType,
      entity_id: input.entityId,
      action: input.action,
      before_data: input.beforeData ?? null,
      after_data: input.afterData ?? null,
      metadata: input.metadata ?? null,
    };

    const { error } = await client.from('audit_logs').insert(payload);
    if (error) {
      console.warn('No se pudo guardar audit log:', error.message);
    }
  },
};
