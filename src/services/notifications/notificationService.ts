import { canManageNotifications } from '../../lib/permissionsMatrix';
import { Role } from '../../types';

export type NotificationChannel = 'internal' | 'email' | 'whatsapp';

export interface NotificationDraft {
  title: string;
  message: string;
  recipientId: string;
  channel: NotificationChannel;
}

export interface InternalNotice {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const INTERNAL_NOTICES: InternalNotice[] = [
  {
    id: 'n1',
    title: 'Ficha pendiente',
    message: 'Completar actualizacion de la ficha de Juan Ruiz.',
    createdAt: '2026-03-28T10:00:00.000Z',
    isRead: false,
  },
  {
    id: 'n2',
    title: 'Seguimiento semanal',
    message: 'Registrar observaciones de los hermanos en proceso de Altar.',
    createdAt: '2026-03-27T15:30:00.000Z',
    isRead: true,
  },
];

export const notificationService = {
  listInternalNotices(): InternalNotice[] {
    return INTERNAL_NOTICES;
  },

  canSendByChannel(role: Role, channel: NotificationChannel): boolean {
    if (channel === 'internal') {
      return true;
    }
    return canManageNotifications(role);
  },

  buildDeliveryPreview(draft: NotificationDraft): string {
    if (draft.channel === 'email') {
      return `EMAIL -> ${draft.title}: ${draft.message}`;
    }
    if (draft.channel === 'whatsapp') {
      return `WHATSAPP -> ${draft.title}: ${draft.message}`;
    }
    return `INTERNAL -> ${draft.title}: ${draft.message}`;
  },
};

